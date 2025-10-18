import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete user data from all tables (RLS policies will handle access control)
    // The CASCADE on foreign keys and RLS policies will handle deletion
    await Promise.all([
      supabaseClient.from('goals').delete().eq('user_id', user.id),
      supabaseClient.from('training_preferences').delete().eq('user_id', user.id),
      supabaseClient.from('app_preferences').delete().eq('user_id', user.id),
      supabaseClient.from('sessions').delete().eq('user_id', user.id),
      supabaseClient.from('feedback').delete().eq('user_id', user.id),
      supabaseClient.from('weekly_checkins').delete().eq('user_id', user.id),
      supabaseClient.from('subscriptions').delete().eq('user_id', user.id),
    ]);

    // Delete profile
    await supabaseClient.from('profiles').delete().eq('id', user.id);

    // Delete auth user (this is done last)
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error deleting account:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
