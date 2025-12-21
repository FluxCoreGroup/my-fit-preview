import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from "https://esm.sh/resend@4.0.0";
import { generateEmailHtml, BRAND, translateGoalType } from '../_shared/email-template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    // Get all active users with completed onboarding
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('onboarding_completed', true);

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      console.log('No active users found');
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending weekly digest to ${profiles.length} users`);

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Get user's weekly stats
        const stats = await getUserWeeklyStats(supabase, profile.id);
        
        // Skip if no activity this week and no sessions planned
        if (stats.sessionsCompleted === 0 && stats.totalSessions === 0) {
          console.log(`Skipping ${profile.email} - no activity`);
          continue;
        }

        const emailHtml = generateWeeklyDigestEmail(profile.name || 'Champion', stats);

        const { error: sendError } = await resend.emails.send({
          from: BRAND.from,
          to: [profile.email],
          subject: `${profile.name || 'Champion'}, ton récap' de la semaine 🔥`,
          html: emailHtml,
        });

        if (sendError) {
          console.error(`Failed to send to ${profile.email}:`, sendError);
          errorCount++;
        } else {
          console.log(`Sent weekly digest to ${profile.email}`);
          successCount++;
        }

      } catch (userError) {
        console.error(`Error processing user ${profile.email}:`, userError);
        errorCount++;
      }
    }

    console.log(`Weekly digest: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: errorCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-weekly-digest:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface WeeklyStats {
  sessionsCompleted: number;
  totalSessions: number;
  adherencePercent: number;
  weightStart: number | null;
  weightEnd: number | null;
  weightChange: number | null;
  nutritionAdherence: number | null;
  currentStreak: number;
  goalType: string;
}

async function getUserWeeklyStats(supabase: any, userId: string): Promise<WeeklyStats> {
  // Get current week dates (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  // Get sessions this week
  const { data: sessions } = await supabase
    .from('sessions')
    .select('completed')
    .eq('user_id', userId)
    .gte('session_date', weekStart.toISOString())
    .lt('session_date', weekEnd.toISOString());

  // Get user goals
  const { data: goals } = await supabase
    .from('goals')
    .select('frequency, goal_type')
    .eq('user_id', userId)
    .single();

  // Get weight logs this week
  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('weight, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', weekStart.toISOString())
    .lt('logged_at', weekEnd.toISOString())
    .order('logged_at', { ascending: true });

  // Get latest weekly check-in for nutrition adherence
  const { data: checkIn } = await supabase
    .from('weekly_checkins')
    .select('adherence_diet')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Calculate streak (consecutive days with completed sessions)
  const { data: allSessions } = await supabase
    .from('sessions')
    .select('session_date, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('session_date', { ascending: false })
    .limit(30);

  const sessionsCompleted = sessions?.filter((s: any) => s.completed).length || 0;
  const totalSessions = goals?.frequency || 3;
  const adherencePercent = totalSessions > 0 ? Math.round((sessionsCompleted / totalSessions) * 100) : 0;

  let weightStart: number | null = null;
  let weightEnd: number | null = null;
  let weightChange: number | null = null;

  if (weightLogs && weightLogs.length > 0) {
    weightStart = weightLogs[0].weight;
    weightEnd = weightLogs[weightLogs.length - 1].weight;
    if (weightStart !== null && weightEnd !== null) {
      weightChange = Math.round((weightEnd - weightStart) * 10) / 10;
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  if (allSessions && allSessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let lastDate = today;
    for (const session of allSessions) {
      const sessionDate = new Date(session.session_date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 2) { // Allow 1-2 day gap for rest days
        currentStreak++;
        lastDate = sessionDate;
      } else {
        break;
      }
    }
  }

  return {
    sessionsCompleted,
    totalSessions,
    adherencePercent,
    weightStart,
    weightEnd,
    weightChange,
    nutritionAdherence: checkIn?.adherence_diet || null,
    currentStreak,
    goalType: translateGoalType(goals?.goal_type)
  };
}

function generateWeeklyDigestEmail(name: string, stats: WeeklyStats): string {
  // Determine performance message
  let performanceEmoji = '💪';
  let performanceMessage = 'Continue comme ça !';
  
  if (stats.adherencePercent >= 100) {
    performanceEmoji = '🏆';
    performanceMessage = 'Semaine parfaite ! Tu es incroyable !';
  } else if (stats.adherencePercent >= 75) {
    performanceEmoji = '🔥';
    performanceMessage = 'Excellent travail cette semaine !';
  } else if (stats.adherencePercent >= 50) {
    performanceEmoji = '💪';
    performanceMessage = 'Beau travail, on continue !';
  } else if (stats.adherencePercent > 0) {
    performanceEmoji = '🚀';
    performanceMessage = 'Chaque séance compte, tu progresses !';
  } else {
    performanceEmoji = '👋';
    performanceMessage = 'On reprend cette semaine ?';
  }

  // Build weight section
  let weightSection = '';
  if (stats.weightChange !== null && stats.weightEnd !== null) {
    const weightEmoji = stats.weightChange < 0 ? '📉' : stats.weightChange > 0 ? '📈' : '➡️';
    const weightColor = stats.weightChange < 0 ? '#10B981' : stats.weightChange > 0 ? '#F59E0B' : '#64748B';
    const weightText = stats.weightChange === 0 ? 'stable' : 
                       stats.weightChange > 0 ? `+${stats.weightChange} kg` : `${stats.weightChange} kg`;
    
    weightSection = `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
          <table role="presentation" width="100%">
            <tr>
              <td style="font-size:14px;color:#64748B">Poids</td>
              <td align="right" style="font-size:16px;font-weight:700;color:${weightColor}">
                ${weightEmoji} ${stats.weightEnd} kg (${weightText})
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // Build nutrition section
  let nutritionSection = '';
  if (stats.nutritionAdherence !== null) {
    const nutritionColor = stats.nutritionAdherence >= 80 ? '#10B981' : 
                           stats.nutritionAdherence >= 50 ? '#F59E0B' : '#EF4444';
    nutritionSection = `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
          <table role="presentation" width="100%">
            <tr>
              <td style="font-size:14px;color:#64748B">Nutrition</td>
              <td align="right" style="font-size:16px;font-weight:700;color:${nutritionColor}">
                🥗 ${stats.nutritionAdherence}% adhérence
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // Streak section
  const streakSection = stats.currentStreak > 0 ? `
    <tr>
      <td style="padding:12px 16px">
        <table role="presentation" width="100%">
          <tr>
            <td style="font-size:14px;color:#64748B">Streak actuel</td>
            <td align="right" style="font-size:16px;font-weight:700;color:#F59E0B">
              🔥 ${stats.currentStreak} ${stats.currentStreak > 1 ? 'séances' : 'séance'}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  const bodyContent = `
    <!-- Performance header -->
    <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#3B82F6 0%, #6366F1 100%);border-radius:16px;margin-bottom:20px">
      <div style="font-size:48px;margin-bottom:8px">${performanceEmoji}</div>
      <div style="color:white;font-size:18px;font-weight:700">${performanceMessage}</div>
    </div>

    <!-- Stats card -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background:#F8FAFC;border-radius:16px;overflow:hidden;margin:16px 0">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
          <table role="presentation" width="100%">
            <tr>
              <td style="font-size:14px;color:#64748B">Séances</td>
              <td align="right" style="font-size:16px;font-weight:700;color:#0F172A">
                🏋️ ${stats.sessionsCompleted}/${stats.totalSessions} complétées
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${weightSection}
      ${nutritionSection}
      ${streakSection}
    </table>

    <!-- Motivation -->
    <div style="background:#FEF3C7;border-radius:12px;padding:16px;margin:20px 0;border-left:4px solid #F59E0B">
      <p style="margin:0;font-size:14px;color:#92400E">
        💡 <strong>Objectif :</strong> ${stats.goalType}. Chaque effort compte pour y arriver !
      </p>
    </div>

    <p style="text-align:center;color:#64748B;font-size:14px;margin:20px 0">
      Prêt pour une nouvelle semaine ? Ta prochaine séance t'attend 👇
    </p>
  `;

  return generateEmailHtml({
    recipientName: name,
    recipientEmail: '',
    subject: `${name}, ton récap' de la semaine 🔥`,
    previewText: `${stats.sessionsCompleted}/${stats.totalSessions} séances • ${performanceMessage}`,
    title: `Ta semaine en un coup d'œil 📊`,
    subtitle: `Objectif : ${stats.goalType}`,
    bodyContent,
    ctaText: 'Voir ma prochaine séance',
    ctaUrl: `${BRAND.baseUrl}/training`,
    secondaryCtaText: 'Faire mon check-in →',
    secondaryCtaUrl: `${BRAND.baseUrl}/training`,
    footerNote: 'On se retrouve dimanche prochain pour ton prochain récap !'
  });
}
