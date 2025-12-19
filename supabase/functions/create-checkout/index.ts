import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

  try {
    logStep("Function started");

    const { mode = "subscription" } = await req.json();
    const priceId = "price_1SS9BTFHkkJtNHC3dr9vpvNP"; // 8,99€/mois All In

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Check if user is authenticated (optional for trial flow)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerId = null;
    let isExistingUser = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;

      if (user?.email) {
        isExistingUser = true;
        logStep("User authenticated", { userId: user.id, email: user.email });

        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          logStep("Existing customer found", { customerId });
        }
      }
    } else {
      logStep("No auth header - new user flow from /tarif");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Always redirect to /payment-success with session_id
    // is_new flag indicates if this is a new user (needs to create account) or existing user
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&is_new=${!isExistingUser}`;
    const cancelUrl = isExistingUser ? `${origin}/paywall?canceled=true` : `${origin}/tarif?canceled=true`;

    logStep("Building checkout session", { isExistingUser, successUrl, cancelUrl });

    // Build session config dynamically to avoid passing empty customer
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      },
      payment_method_collection: "always",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user?.id || "PENDING",
        plan_type: "all_in",
        is_new_user: (!isExistingUser).toString(),
      },
    };

    // Only add customer if we have a valid ID
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
