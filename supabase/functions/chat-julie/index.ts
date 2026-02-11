import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
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
  dataConsent: z.boolean().nullable().optional(),
});

// Tool definitions for AI to access user data
const tools = [
  {
    type: "function",
    function: {
      name: "get_nutrition_targets",
      description: "UTILISER SYSTÉMATIQUEMENT pour toute question sur le poids, l'âge, la taille, le sexe, les objectifs, les calories cibles, les macros, les conditions de santé, les allergies, les restrictions alimentaires. Retourne TOUTES les données de la table goals + calculs TDEE.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_nutrition_logs",
      description: "Récupère les repas et calories consommés récemment par l'utilisateur",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Nombre de jours à récupérer (par défaut 7)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weight_history",
      description: "Récupère l'historique des pesées hebdomadaires de l'utilisateur",
      parameters: {
        type: "object",
        properties: {
          weeks: {
            type: "number",
            description: "Nombre de semaines à récupérer (par défaut 4)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_checkin_stats",
      description: "Récupère les statistiques des check-ins hebdomadaires (adhérence diète, énergie)",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["week", "month"],
            description: "Période à analyser",
          },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_profile",
      description: "Récupère le profil utilisateur (nom, email, date d'inscription)",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// Execute tool calls with validated parameters
async function executeToolCall(toolName: string, args: any, userId: string, supabase: any) {
  console.log(`Executing tool: ${toolName} for user ${userId}`, args);

  const validateToolArgs = (schema: z.ZodSchema, data: any) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error(`Tool ${toolName} args validation error:`, result.error.errors);
      return null;
    }
    return result.data;
  };

  try {
    switch (toolName) {
      case "get_nutrition_targets": {
        const { data: goals, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("get_nutrition_targets error:", error);
          throw error;
        }
        
        if (!goals) {
          return { success: false, error: "Aucun objectif défini" };
        }

        // Calculate age from birth_date if age is not set
        let age = goals.age;
        if (!age && goals.birth_date) {
          const birthDate = new Date(goals.birth_date);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        // TDEE calculation (Mifflin-St Jeor)
        let bmr = 0;
        if (goals.weight && goals.height && age && goals.sex) {
          if (goals.sex === "male") {
            bmr = 10 * goals.weight + 6.25 * goals.height - 5 * age + 5;
          } else {
            bmr = 10 * goals.weight + 6.25 * goals.height - 5 * age - 161;
          }
        }

        const activityMultiplier =
          goals.activity_level === "sedentary" ? 1.2 :
          goals.activity_level === "light" ? 1.375 :
          goals.activity_level === "moderate" ? 1.55 :
          goals.activity_level === "active" ? 1.725 : 1.9;

        const tdee = Math.round(bmr * activityMultiplier);
        const targetCalories =
          goals.goal_type === "lose_weight" ? tdee - 500 :
          goals.goal_type === "gain_muscle" ? tdee + 300 : tdee;

        const protein = goals.weight ? Math.round(goals.weight * 2) : 150;
        const fat = goals.weight ? Math.round(goals.weight * 1) : 70;
        const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

        return {
          success: true,
          data: {
            weight: goals.weight,
            height: goals.height,
            age: age,
            sex: goals.sex,
            birth_date: goals.birth_date,
            goal_type: goals.goal_type,
            activity_level: goals.activity_level,
            target_weight_loss: goals.target_weight_loss,
            health_conditions: goals.health_conditions,
            restrictions: goals.restrictions,
            allergies: goals.allergies,
            meals_per_day: goals.meals_per_day,
            has_breakfast: goals.has_breakfast,
            tdee,
            targetCalories,
            protein,
            fat,
            carbs,
          },
          summary: `Poids: ${goals.weight}kg, Objectif: ${goals.goal_type}, ${targetCalories} kcal/jour, P:${protein}g F:${fat}g G:${carbs}g`,
        };
      }

      case "get_nutrition_logs": {
        const argsSchema = z.object({ days: z.number().min(1).max(30).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const days = validated?.days || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from("nutrition_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", startDate.toISOString())
          .order("logged_at", { ascending: false });

        if (error) {
          console.error("get_nutrition_logs error:", error);
          throw error;
        }

        const totalCalories = data?.reduce((sum: number, log: any) => sum + (log.calories || 0), 0) || 0;
        const avgCaloriesPerDay = data?.length ? Math.round(totalCalories / days) : 0;

        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} repas sur ${days} jours, moyenne ${avgCaloriesPerDay} kcal/jour`,
          totalCalories,
          avgCaloriesPerDay,
        };
      }

      case "get_weight_history": {
        const argsSchema = z.object({ weeks: z.number().min(1).max(52).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const weeks = validated?.weeks || 4;
        const weeksAgo = new Date();
        weeksAgo.setDate(weeksAgo.getDate() - weeks * 7);

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("average_weight, created_at, week_iso")
          .eq("user_id", userId)
          .gte("created_at", weeksAgo.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("get_weight_history error:", error);
          throw error;
        }

        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} pesées sur ${weeks} semaines`,
        };
      }

      case "get_checkin_stats": {
        const argsSchema = z.object({ period: z.enum(["week", "month"]).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const period = validated?.period || "week";
        const daysAgo = period === "week" ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("adherence_diet, energy_level, created_at")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false });

        if (error) {
          console.error("get_checkin_stats error:", error);
          throw error;
        }

        const avgAdherence = data?.length
          ? (data.reduce((sum: number, c: any) => sum + (c.adherence_diet || 0), 0) / data.length).toFixed(0)
          : "N/A";

        return {
          success: true,
          data: data || [],
          summary: `Adhérence diète: ${avgAdherence}%`,
          avgAdherence,
        };
      }

      case "get_user_profile": {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("get_user_profile error:", error);
          throw error;
        }

        if (!data) {
          return { success: false, error: "Profil non trouvé" };
        }

        return {
          success: true,
          data: {
            name: data.name,
            email: data.email,
            created_at: data.created_at,
          },
          summary: `Utilisateur: ${data.name || data.email}`,
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

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
    const userId = user.id;

    // Check subscription status (allow first use for free)
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (feedbackCount && feedbackCount > 0) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (!subscription) {
        console.warn(`Subscription required for user ${userId} - no active subscription`);
        return new Response(
          JSON.stringify({ error: "Abonnement requis pour continuer à utiliser la nutritionniste IA" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    console.log(`Subscription check passed for user ${userId}`);

    const rawBody = await req.json();
    console.log('📥 Request received:', { messagesCount: rawBody.messages?.length, dataConsent: rawBody.dataConsent });
    
    // Validate input
    const parseResult = requestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error("❌ Request validation error:", parseResult.error.errors);
      console.error("❌ Raw body:", JSON.stringify(rawBody, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "Données invalides", 
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages, context, dataConsent } = parseResult.data;
    console.log('✅ Validation passed. Messages:', messages.length, 'DataConsent:', dataConsent);
    const sanitizedContext = sanitizeContext(context);
    console.log("sanitize context", sanitizeContext)
    const hasDataAccess = dataConsent === true;
    console.log('🔐 Has data access:', hasDataAccess);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPromptWithAccess = `Tu es Julie, nutritionniste diplômée et experte en nutrition sportive de l'app PULSE.

⚠️ RÈGLES CRITIQUES :
1. TOUJOURS utiliser les tools pour TOUTE question sur les données utilisateur
2. JAMAIS inventer de chiffres - APPELER LES TOOLS D'ABORD
3. Ne réponds qu'avec les données EXACTES retournées par les tools

TOOLS DISPONIBLES :
- get_nutrition_targets : TOUTES les données (poids, taille, âge, sexe, objectifs, calories, macros, conditions de santé, allergies, restrictions)
- get_nutrition_logs : repas et calories consommés récemment
- get_weight_history : historique des pesées
- get_checkin_stats : adhérence diète et énergie
- get_user_profile : profil utilisateur

QUAND UTILISER LES TOOLS :
- "Mon objectif ?" → get_nutrition_targets
- "Mes calories ?" → get_nutrition_targets
- "Mes macros ?" → get_nutrition_targets
- "Ce que j'ai mangé ?" → get_nutrition_logs
- "Mon poids ?" → get_weight_history + get_nutrition_targets
- "Mon adhérence ?" → get_checkin_stats
- "Mes allergies ?" → get_nutrition_targets
- "Mes restrictions ?" → get_nutrition_targets

Contexte général :
- Objectif : ${sanitizedContext.goal_type}
- Repas par jour : ${sanitizedContext.meals_per_day}
- Restrictions : ${sanitizedContext.restrictions}
- Allergies : ${sanitizedContext.allergies}

⚠️ Ce contexte ne contient PAS de données chiffrées. Utilise les tools!

Tu dois :
- Répondre en français, de manière claire et actionnable
- Donner des conseils nutritionnels précis basés sur les données
- Proposer des recettes simples adaptées aux objectifs et contraintes
- Respecter les allergies et restrictions alimentaires
- Être encourageante sans être moralisatrice`;

    const systemPromptWithoutAccess = `Tu es Julie, nutritionniste diplômée et experte en nutrition sportive.

⚠️ IMPORTANT : L'utilisateur n'a pas autorisé l'accès à ses données personnelles.
Tu dois donner des conseils GÉNÉRAUX sans données personnalisées.

📌 Commence TOUJOURS ta réponse par :
"📌 Réponse générale (sans accès à tes données personnelles)"

Puis donne un conseil pertinent basé uniquement sur la question posée.

Tu ne peux PAS :
- Accéder aux objectifs caloriques, macros ou données de l'utilisateur
- Donner des chiffres personnalisés (calories, protéines, etc.)
- Mentionner des données spécifiques à l'utilisateur

Tu PEUX :
- Donner des conseils nutritionnels généraux
- Expliquer les principes d'une alimentation équilibrée
- Proposer des recettes saines et équilibrées
- Répondre à des questions théoriques sur la nutrition

Ton : Pédagogue, bienveillante, encourageante.`;

    const systemPrompt = hasDataAccess ? systemPromptWithAccess : systemPromptWithoutAccess;

    // Track data sources used
    let dataSources: any[] = [];

    // Build AI messages array
    let aiMessages: any[] = [{ role: "system", content: systemPrompt }, ...messages];
    console.log('🤖 AI messages built:', aiMessages.length, 'messages');

    // If no data access, skip tool loop entirely
    if (!hasDataAccess) {
      console.log("⏭️ No data access consent - skipping tools");
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!finalResponse.ok) {
        if (finalResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Trop de requêtes, réessaye dans quelques instants." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (finalResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Crédits épuisés, contacte le support." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Failed to get streaming response");
      }

      return new Response(finalResponse.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-Data-Sources": JSON.stringify([]),
          "X-Debug-DataConsent": "false",
        },
      });
    }

    // Tool execution loop
    let needsToolExecution = true;
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;
    console.log('🔄 Starting tool execution loop with data access');

    while (needsToolExecution && iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      console.log(`🔄 AI iteration ${iterationCount}/${MAX_ITERATIONS}`);

      // Detect keywords in last user message
      const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
      const needsNutritionData = /poids|calorie|macro|objectif|allergie|restriction|protéine|lipide|glucide/i.test(lastUserMessage);

      const body: any = {
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: tools,
        stream: false,
      };

      // Force tool_choice for nutrition questions
      if (iterationCount === 1 && needsNutritionData) {
        body.tool_choice = { type: "function", function: { name: "get_nutrition_targets" } };
        console.log("Forcing tool: get_nutrition_targets");
      }

      console.log('🚀 Calling AI API...');
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log('📡 AI API response status:', response.status);

      if (!response.ok) {
        console.error('❌ AI API error:', response.status, response.statusText);
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

      const aiResponse = await response.json();
      console.log('📦 AI response received');
      const choice = aiResponse.choices?.[0];

      if (!choice) {
        throw new Error("No response from AI");
      }

      console.log("📊 AI response analysis:", {
        hasToolCalls: !!choice.message?.tool_calls,
        toolCallsCount: choice.message?.tool_calls?.length || 0,
        toolNames: choice.message?.tool_calls?.map((tc: any) => tc.function.name) || [],
      });

      // Check if AI wants to use tools
      if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
        console.log(`🔧 AI requested ${choice.message.tool_calls.length} tool calls`);

        aiMessages.push(choice.message);

        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

          console.log(`⚙️ Executing tool: ${toolName}`, toolArgs);
          const result = await executeToolCall(toolName, toolArgs, userId, supabase);
          console.log(`✅ Tool ${toolName} executed:`, result.success ? 'success' : 'failed');

          dataSources.push({
            tool: toolName,
            args: toolArgs,
            result: result.summary || result.error,
          });

          aiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        continue;
      }

      // No more tools needed
      console.log('✅ No more tools needed, proceeding to final response');
      needsToolExecution = false;

      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!finalResponse.ok) {
        throw new Error("Failed to get final streaming response");
      }

      return new Response(finalResponse.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-Data-Sources": JSON.stringify(dataSources),
          "X-Debug-DataConsent": "true",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Max iterations reached" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-julie error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
