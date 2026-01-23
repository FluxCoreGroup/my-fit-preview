import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VALIDATE-PROMO-CODE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { code } = await req.json();
    
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    logStep("Validating promo code", { code: code.toUpperCase() });

    // Chercher le coupon par son ID/nom (les coupons créés avec un nom sont recherchables)
    try {
      // D'abord essayer de récupérer directement le coupon par ID
      const coupon = await stripe.coupons.retrieve(code.toUpperCase());
      
      if (!coupon.valid) {
        logStep("Coupon found but not valid", { couponId: coupon.id });
        return new Response(
          JSON.stringify({ valid: false, error: "Code expiré ou invalide" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      logStep("Coupon valid", { 
        couponId: coupon.id, 
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off 
      });

      return new Response(
        JSON.stringify({
          valid: true,
          couponId: coupon.id,
          discount: {
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            duration: coupon.duration,
            name: coupon.name || coupon.id
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (stripeError: any) {
      // Si le coupon n'existe pas par ID, chercher dans les promotion codes
      if (stripeError.code === "resource_missing") {
        logStep("Coupon not found by ID, searching promotion codes");
        
        const promotionCodes = await stripe.promotionCodes.list({
          code: code.toUpperCase(),
          active: true,
          limit: 1
        });

        if (promotionCodes.data.length === 0) {
          logStep("No promotion code found");
          return new Response(
            JSON.stringify({ valid: false, error: "Code invalide" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        const promo = promotionCodes.data[0];
        const coupon = promo.coupon;

        if (!coupon.valid) {
          return new Response(
            JSON.stringify({ valid: false, error: "Code expiré" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        logStep("Promotion code valid", { promoId: promo.id, couponId: coupon.id });

        return new Response(
          JSON.stringify({
            valid: true,
            couponId: coupon.id,
            promoCodeId: promo.id,
            discount: {
              percent_off: coupon.percent_off,
              amount_off: coupon.amount_off,
              duration: coupon.duration,
              name: coupon.name || promo.code
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      throw stripeError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ valid: false, error: "Erreur de validation" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
