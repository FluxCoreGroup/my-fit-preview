import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface PublicStats {
  total_users: number;
  completed_sessions: number;
  average_rating: number | null;
  avg_weight_loss: number | null;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get cached stats
    const { data: cachedStats, error: cacheError } = await supabase
      .from('public_stats_cache')
      .select('*')
      .eq('id', 'main')
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Error fetching cache:', cacheError);
      throw cacheError;
    }

    // Check if cache is still valid (less than 1 hour old)
    const now = new Date();
    const cacheUpdatedAt = cachedStats?.updated_at ? new Date(cachedStats.updated_at) : null;
    const cacheIsValid = cacheUpdatedAt && (now.getTime() - cacheUpdatedAt.getTime()) < CACHE_DURATION_MS;

    if (cachedStats && cacheIsValid) {
      console.log('Returning cached stats (valid for', Math.round((CACHE_DURATION_MS - (now.getTime() - cacheUpdatedAt.getTime())) / 60000), 'more minutes)');
      return new Response(JSON.stringify(cachedStats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cache expired or doesn't exist - recalculate
    console.log('Cache expired, recalculating stats...');

    // Count total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error counting users:', usersError);
      throw usersError;
    }

    // Count completed sessions
    const { count: completedSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true);

    if (sessionsError) {
      console.error('Error counting sessions:', sessionsError);
      throw sessionsError;
    }

    // Calculate average rating from feedback (RPE inversé: 1-10 où bas = facile = bon)
    // On convertit en note de satisfaction: (11 - RPE) / 2 pour avoir une note sur 5
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('rpe')
      .not('rpe', 'is', null);

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    let averageRating: number | null = null;
    if (feedbackData && feedbackData.length >= 5) {
      // Calculer une note de satisfaction basée sur les feedbacks
      // RPE 6-7 = optimal = 5/5, RPE 8-9 = dur mais ok = 4/5, RPE 10 = trop dur = 3/5
      const ratings = feedbackData.map(f => {
        const rpe = f.rpe!;
        if (rpe <= 7) return 5;
        if (rpe <= 8) return 4.5;
        if (rpe <= 9) return 4;
        return 3.5;
      });
      const sum = ratings.reduce((acc, val) => acc + val, 0);
      averageRating = Math.round((sum / ratings.length) * 10) / 10;
    }

    // Calculate average weight loss (difference between first and latest weight log)
    const { data: weightData, error: weightError } = await supabase
      .from('weekly_checkins')
      .select('average_weight, user_id, created_at')
      .not('average_weight', 'is', null)
      .order('created_at', { ascending: true });

    if (weightError) {
      console.error('Error fetching weight data:', weightError);
      throw weightError;
    }

    let avgWeightLoss: number | null = null;
    if (weightData && weightData.length > 0) {
      // Group by user and calculate individual weight loss
      const userWeights: Record<string, { first: number; last: number }> = {};
      
      for (const entry of weightData) {
        if (!userWeights[entry.user_id]) {
          userWeights[entry.user_id] = { first: entry.average_weight!, last: entry.average_weight! };
        } else {
          userWeights[entry.user_id].last = entry.average_weight!;
        }
      }

      // Calculate average weight loss for users with progress
      const weightLosses = Object.values(userWeights)
        .map(w => w.first - w.last)
        .filter(loss => loss > 0); // Only count actual weight loss

      if (weightLosses.length >= 3) {
        const totalLoss = weightLosses.reduce((acc, val) => acc + val, 0);
        avgWeightLoss = Math.round((totalLoss / weightLosses.length) * 10) / 10;
      }
    }

    // Update cache
    const newStats: PublicStats = {
      total_users: totalUsers || 0,
      completed_sessions: completedSessions || 0,
      average_rating: averageRating,
      avg_weight_loss: avgWeightLoss,
      updated_at: now.toISOString(),
    };

    const { error: updateError } = await supabase
      .from('public_stats_cache')
      .upsert({
        id: 'main',
        ...newStats,
      });

    if (updateError) {
      console.error('Error updating cache:', updateError);
      // Don't throw, just log - we can still return the calculated stats
    }

    console.log('Stats recalculated:', newStats);

    return new Response(JSON.stringify(newStats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-public-stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
