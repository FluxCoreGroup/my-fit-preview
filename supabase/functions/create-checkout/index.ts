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

// Prix IDs pour chaque formule
const PRICE_IDS = {
  weekly: "price_1SslhaGmCvXEfWmDnO5NM7eN",   // 6,99€/semaine
  monthly: "price_1Sslk3GmCvXEfWmDRcWjrwpp",  // 14,99€/mois
  yearly: "price_1SslmjGmCvXEfWmDP0Md7nfh",   // 149,99€/an
  legacy: "price_1SgMu4GmCvXEfWmDJlWHfwsS",   // 8,99€/mois (ancien prix)
};

// Formules avec essai gratuit (7 jours)
const PLANS_WITH_TRIAL = ["monthly", "yearly"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

  try {
    logStep("Function started");

    const { plan = "monthly", promoCode = null } = await req.json();
    
    // Valider le plan
    if (!["weekly", "monthly", "yearly"].includes(plan)) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    const hasTrial = PLANS_WITH_TRIAL.includes(plan);
    
    logStep("Plan selected", { plan, priceId, hasTrial, promoCode: promoCode ? "provided" : "none" });

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
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&is_new=${!isExistingUser}`;
    const cancelUrl = isExistingUser ? `${origin}/paywall?canceled=true` : `${origin}/tarif?canceled=true`;

    logStep("Building checkout session", { isExistingUser, successUrl, cancelUrl });

    // Build session config
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_collection: "always",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user?.id || "PENDING",
        plan_type: plan,
        is_new_user: (!isExistingUser).toString(),
      },
    };

    // Ajouter essai seulement pour mensuel/annuel
    if (hasTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      };
      logStep("Trial period added", { days: 7 });
    }

    // Only add customer if we have a valid ID
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    // Gérer le code promo
    if (promoCode) {
      // Vérifier si c'est un coupon ID direct ou un promotion code
      try {
        // D'abord essayer comme coupon ID
        const coupon = await stripe.coupons.retrieve(promoCode.toUpperCase());
        if (coupon.valid) {
          sessionConfig.discounts = [{ coupon: coupon.id }];
          logStep("Coupon applied", { couponId: coupon.id });
        }
      } catch {
        // Sinon chercher comme promotion code
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: promoCode.toUpperCase(),
            active: true,
            limit: 1
          });
          if (promoCodes.data.length > 0) {
            sessionConfig.discounts = [{ promotion_code: promoCodes.data[0].id }];
            logStep("Promotion code applied", { promoId: promoCodes.data[0].id });
          }
        } catch (e) {
          logStep("Promo code not found, continuing without discount", { code: promoCode });
        }
      }
    }

    // Si pas de code promo appliqué, permettre la saisie dans Checkout
    if (!sessionConfig.discounts) {
      sessionConfig.allow_promotion_codes = true;
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
