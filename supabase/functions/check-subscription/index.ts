import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    
    // Find active or trialing subscription
    const validSubscription = subscriptions.data.find(
      (sub: { status: string }) => sub.status === "active" || sub.status === "trialing"
    );
    
    const hasValidSub = !!validSubscription;
    let productId = null;
    let subscriptionEnd = null;
    let trialEnd = null;
    let subscriptionStatus = null;

    if (hasValidSub) {
      const subscription = validSubscription;
      subscriptionStatus = subscription.status;
      
      // Log raw Stripe data for debugging
      logStep("Subscription raw data", { 
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        created: subscription.created,
        status: subscription.status
      });
      
      // Safe date conversions with null checks
      if (subscription.current_period_end) {
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      }
      logStep("Valid subscription found", { subscriptionId: subscription.id, status: subscriptionStatus, endDate: subscriptionEnd });
      
      productId = subscription.items.data[0].price.product as string;
      logStep("Determined subscription tier", { productId });
      
      if (subscription.status === "trialing" && subscription.trial_end) {
        trialEnd = new Date(subscription.trial_end * 1000).toISOString();
        logStep("Trial subscription", { trialEnd });
      }
      
      // Sync avec Supabase
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscriptionStatus,
          plan_type: subscription.items.data[0].price.recurring?.interval || 'month',
          started_at: subscription.created 
            ? new Date(subscription.created * 1000).toISOString() 
            : new Date().toISOString(),
          ends_at: subscriptionEnd
        }, { onConflict: 'user_id' });
    } else {
      logStep("No valid subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasValidSub,
      subscription_status: subscriptionStatus,
      product_id: productId,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Log detailed error server-side only
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    // Return generic error to client
    return new Response(JSON.stringify({ error: 'Erreur lors de la vérification de l\'abonnement' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
