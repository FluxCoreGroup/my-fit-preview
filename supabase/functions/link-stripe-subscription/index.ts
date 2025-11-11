import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LINK-STRIPE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Helper function to safely convert Stripe timestamp to ISO string
const safeTimestampToISO = (timestamp: number | null | undefined): string | null => {
  if (!timestamp || timestamp <= 0) {
    return null;
  }
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (e) {
    logStep("ERROR converting timestamp", { timestamp, error: e });
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Get Stripe session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (!session.customer || !session.subscription) {
      throw new Error("Invalid session: missing customer or subscription");
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    const subscription = typeof session.subscription === 'string' 
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

    // Log raw subscription data for debugging
    logStep("Raw subscription data", { 
      trial_end: subscription.trial_end,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      status: subscription.status
    });

    // Calculate dates safely
    const startedAt = safeTimestampToISO(subscription.current_period_start);
    const trialEnd = safeTimestampToISO(subscription.trial_end);
    const periodEnd = safeTimestampToISO(subscription.current_period_end);
    
    // Determine end date: prioritize trial_end, fallback to current_period_end
    const endsAt = trialEnd || periodEnd;

    logStep("Calculated dates", { startedAt, trialEnd, periodEnd, endsAt });
    
    logStep("Stripe data retrieved", { 
      customerId, 
      subscriptionId: subscription.id,
      status: subscription.status 
    });

    // Check if subscription already exists
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSub) {
      logStep("Subscription already exists, updating", { existingId: existingSub.id });
      
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan_type: session.metadata?.plan_type || 'monthly',
          started_at: startedAt,
          ends_at: endsAt,
        })
        .eq('id', existingSub.id);

      if (updateError) throw updateError;
    } else {
      logStep("Creating new subscription record");
      
      const { error: insertError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan_type: session.metadata?.plan_type || 'monthly',
          started_at: startedAt,
          ends_at: endsAt,
        });

      if (insertError) throw insertError;
    }

    logStep("Subscription linked successfully");

    return new Response(JSON.stringify({ 
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
