import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(10000),
});

const contextSchema = z.object({
  goal_type: z.string().max(100).optional(),
  tdee: z.number().min(0).max(10000).optional(),
  target_calories: z.number().min(0).max(10000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  meals_per_day: z.number().min(1).max(10).optional(),
  restrictions: z.array(z.string().max(100)).max(20).optional(),
  allergies: z.array(z.string().max(100)).max(20).optional(),
}).passthrough();

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  context: contextSchema.optional(),
});

// Sanitize context values for prompt injection prevention
function sanitizeContext(context: any): any {
  const sanitizeString = (str: string | undefined | null, fallback: string): string => {
    if (!str) return fallback;
    return str.replace(/[<>{}]/g, '').substring(0, 100);
  };
  
  const sanitizeNumber = (num: number | undefined | null, fallback: string): string => {
    if (num === undefined || num === null) return fallback;
    return String(num);
  };
  
  const sanitizeArray = (arr: string[] | undefined | null): string => {
    if (!arr || arr.length === 0) return "aucune";
    return arr.map(s => s.replace(/[<>{}]/g, '').substring(0, 100)).join(", ");
  };

  return {
    goal_type: sanitizeString(context?.goal_type, "non défini"),
    tdee: sanitizeNumber(context?.tdee, "non calculé"),
    target_calories: sanitizeNumber(context?.target_calories, "non calculées"),
    protein: sanitizeNumber(context?.protein, "0"),
    fat: sanitizeNumber(context?.fat, "0"),
    carbs: sanitizeNumber(context?.carbs, "0"),
    meals_per_day: sanitizeString(context?.meals_per_day?.toString(), "non défini"),
    restrictions: sanitizeArray(context?.restrictions),
    allergies: sanitizeArray(context?.allergies),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authentication check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.75.0");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription status (allow first use for free)
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (feedbackCount && feedbackCount > 0) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!subscription) {
        console.warn(`Subscription required for user ${user.id} - no active subscription`);
        return new Response(
          JSON.stringify({ error: "Abonnement requis pour continuer à utiliser la nutritionniste IA" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    console.log(`Subscription check passed for user ${user.id}`);

    const rawBody = await req.json();
    
    // Validate input
    const parseResult = requestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("❌ Request validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Données invalides", 
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages, context } = parseResult.data;
    const sanitizedContext = sanitizeContext(context);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Tu es Julie, nutritionniste diplômée et experte en nutrition sportive.
Tu aides les utilisateurs à optimiser leur alimentation pour atteindre leurs objectifs.
Tu es pédagogue, bienveillante et tu donnes des conseils pratiques et réalistes.

Contexte utilisateur actuel :
- Objectif : ${sanitizedContext.goal_type}
- TDEE : ${sanitizedContext.tdee} kcal
- Calories cibles : ${sanitizedContext.target_calories} kcal
- Macros cibles : P=${sanitizedContext.protein}g, F=${sanitizedContext.fat}g, G=${sanitizedContext.carbs}g
- Repas par jour : ${sanitizedContext.meals_per_day}
- Restrictions : ${sanitizedContext.restrictions}
- Allergies : ${sanitizedContext.allergies}

Tu dois :
- Répondre en français, de manière claire et actionnable
- Donner des conseils nutritionnels précis basés sur le contexte de l'utilisateur
- Proposer des recettes simples adaptées aux objectifs et contraintes
- Suggérer des substitutions alimentaires quand demandé
- Respecter les allergies et restrictions alimentaires
- Être encourageante sans être moralisatrice`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaye dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés, contacte le support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-julie error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
