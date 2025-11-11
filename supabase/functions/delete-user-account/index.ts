import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-USER-ACCOUNT] ${step}${detailsStr}`);
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

    logStep("Function started", { userId: user.id, email: user.email });

    // Check and cancel Stripe subscription if exists
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
      logStep("Active subscription found, canceling on Stripe", { 
        subscriptionId: subscription.stripe_subscription_id 
      });

      try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
          apiVersion: "2025-08-27.basil" 
        });

        await stripe.subscriptions.cancel(subscription.stripe_subscription_id, {
          prorate: false, // No prorated refund
        });
        
        logStep("Stripe subscription canceled successfully");
      } catch (stripeError: any) {
        logStep("ERROR canceling Stripe subscription", { error: stripeError.message });
        // Continue with account deletion even if Stripe cancellation fails
        // This prevents the user from being stuck
      }
    } else {
      logStep("No active subscription to cancel");
    }

    // Delete user data from all tables (RLS policies will handle access control)
    // The CASCADE on foreign keys and RLS policies will handle deletion
    logStep("Deleting user data from all tables");
    await Promise.all([
      supabaseClient.from('goals').delete().eq('user_id', user.id),
      supabaseClient.from('training_preferences').delete().eq('user_id', user.id),
      supabaseClient.from('app_preferences').delete().eq('user_id', user.id),
      supabaseClient.from('sessions').delete().eq('user_id', user.id),
      supabaseClient.from('feedback').delete().eq('user_id', user.id),
      supabaseClient.from('weekly_checkins').delete().eq('user_id', user.id),
      supabaseClient.from('subscriptions').delete().eq('user_id', user.id),
    ]);
    logStep("User data deleted");

    // Delete profile
    logStep("Deleting profile");
    await supabaseClient.from('profiles').delete().eq('id', user.id);

    // Delete auth user (this is done last)
    logStep("Deleting auth user");
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    logStep("Account deleted successfully");
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
