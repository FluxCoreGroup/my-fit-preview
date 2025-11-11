import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Retrieve subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id, status, plan_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      logStep("ERROR retrieving subscription", { error: subError.message });
      throw new Error("Error retrieving subscription");
    }

    if (!subscription) {
      logStep("No subscription found for user");
      throw new Error("No subscription found");
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      logStep("Subscription is not active", { status: subscription.status });
      throw new Error("Subscription is not active or in trial");
    }

    logStep("Canceling subscription on Stripe", { 
      subscriptionId: subscription.stripe_subscription_id 
    });

    // Cancel on Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    const canceledSub = await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    logStep("Subscription canceled on Stripe", { 
      subscriptionId: canceledSub.id,
      canceledAt: canceledSub.canceled_at 
    });

    // Update Supabase
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        ends_at: new Date(canceledSub.canceled_at! * 1000).toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR updating subscription in Supabase", { error: updateError.message });
      throw updateError;
    }

    logStep("Subscription updated in Supabase");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscription canceled successfully",
      ends_at: new Date(canceledSub.canceled_at! * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while canceling subscription" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
