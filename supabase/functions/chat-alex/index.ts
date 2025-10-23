import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for AI to access user data
const tools = [
  {
    type: "function",
    function: {
      name: "get_weight_history",
      description: "Récupère l'historique du poids de l'utilisateur sur les dernières semaines",
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
      name: "get_recent_sessions",
      description: "Récupère les séances d'entraînement récentes de l'utilisateur",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Nombre de séances à récupérer (par défaut 5)",
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
      description: "Récupère les statistiques des check-ins hebdomadaires (RPE moyen, adhérence, énergie)",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["week", "month"],
            description: "Période à analyser : 'week' pour la semaine dernière, 'month' pour le mois dernier",
          },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_next_session",
      description: "Récupère la prochaine séance d'entraînement planifiée",
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
      name: "get_nutrition_targets",
      description: "Récupère les objectifs nutritionnels de l'utilisateur (calories, protéines, lipides, glucides)",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// Execute tool calls
async function executeToolCall(toolName: string, args: any, userId: string, supabase: any) {
  console.log(`Executing tool: ${toolName} for user ${userId}`, args);

  try {
    switch (toolName) {
      case "get_weight_history": {
        const weeks = args.weeks || 4;
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

        console.log(`get_weight_history: Found ${data?.length || 0} records`);
        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} pesées trouvées sur ${weeks} semaines`,
        };
      }

      case "get_recent_sessions": {
        const limit = args.limit || 5;

        const { data, error } = await supabase
          .from("sessions")
          .select("id, session_date, completed, exercises")
          .eq("user_id", userId)
          .order("session_date", { ascending: false })
          .limit(limit);

        if (error) {
          console.error("get_recent_sessions error:", error);
          throw error;
        }

        console.log(`get_recent_sessions: Found ${data?.length || 0} records`);
        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} séances trouvées`,
        };
      }

      case "get_checkin_stats": {
        const period = args.period || "week";
        const daysAgo = period === "week" ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("rpe_avg, adherence_diet, energy_level, created_at")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false });

        if (error) {
          console.error("get_checkin_stats error:", error);
          throw error;
        }

        console.log(`get_checkin_stats: Found ${data?.length || 0} records`);

        const avgRpe = data?.length
          ? (data.reduce((sum: number, c: any) => sum + (c.rpe_avg || 0), 0) / data.length).toFixed(1)
          : "N/A";
        const avgAdherence = data?.length
          ? (data.reduce((sum: number, c: any) => sum + (c.adherence_diet || 0), 0) / data.length).toFixed(0)
          : "N/A";

        return {
          success: true,
          data: data || [],
          summary: `RPE moyen: ${avgRpe}/10, Adhérence diète: ${avgAdherence}%`,
          avgRpe,
          avgAdherence,
        };
      }

      case "get_next_session": {
        const { data, error } = await supabase
          .from("sessions")
          .select("id, session_date, exercises")
          .eq("user_id", userId)
          .eq("completed", false)
          .gte("session_date", new Date().toISOString())
          .order("session_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("get_next_session error:", error);
          throw error;
        }

        console.log(`get_next_session: Found ${data ? "1" : "0"} session`);
        return {
          success: true,
          data: data || null,
          summary: data
            ? `Prochaine séance prévue le ${new Date(data.session_date).toLocaleDateString("fr-FR")}`
            : "Aucune séance planifiée",
        };
      }

      case "get_nutrition_targets": {
        const { data: goals, error } = await supabase
          .from("goals")
          .select("weight, height, age, sex, goal_type, activity_level")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("get_nutrition_targets error:", error);
          throw error;
        }
        
        if (!goals) {
          console.log("get_nutrition_targets: No goals found");
          return { success: false, error: "Aucun objectif défini" };
        }

        console.log("get_nutrition_targets: Goals found, calculating TDEE");

        // Simple TDEE calculation (Mifflin-St Jeor)
        let bmr = 0;
        if (goals.weight && goals.height && goals.age && goals.sex) {
          if (goals.sex === "male") {
            bmr = 10 * goals.weight + 6.25 * goals.height - 5 * goals.age + 5;
          } else {
            bmr = 10 * goals.weight + 6.25 * goals.height - 5 * goals.age - 161;
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
            tdee,
            targetCalories,
            protein,
            fat,
            carbs,
          },
          summary: `${targetCalories} kcal/jour - P: ${protein}g, L: ${fat}g, G: ${carbs}g`,
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get user ID from JWT
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    console.log("Request received:", {
      userId: userId || "NONE",
      messagesCount: messages?.length || 0,
      hasContext: !!context,
    });

    if (!userId) {
      console.error("Authentication failed - no user ID");
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es Alex, coach sportif expert en musculation et fitness.
Tu aides les utilisateurs à optimiser leur entraînement avec des conseils techniques clairs et concis.
Tu es direct, motivant et tu te concentres sur l'action concrète.

Contexte utilisateur actuel :
- Objectif : ${context.goal_type || "non défini"}
- Fréquence d'entraînement : ${context.frequency || "non définie"} séances/semaine
- Niveau d'expérience : ${context.experience_level || "non défini"}
- Matériel disponible : ${context.equipment?.join(", ") || "non défini"}
- Préférences : ${context.session_type || "non défini"}
- Limitations : ${context.limitations?.join(", ") || "aucune"}

IMPORTANT - TU AS ACCÈS À DES OUTILS POUR CONSULTER LES VRAIES DONNÉES :
- get_weight_history : Pour connaître l'évolution du poids
- get_recent_sessions : Pour voir les séances récentes
- get_checkin_stats : Pour analyser les stats (RPE, adhérence, énergie)
- get_next_session : Pour connaître la prochaine séance planifiée
- get_nutrition_targets : Pour les objectifs caloriques et macros

Tu dois UTILISER CES OUTILS quand l'utilisateur pose des questions factuelles :
- "Quel était mon poids..." → get_weight_history
- "Combien de séances..." → get_recent_sessions
- "Mon RPE moyen..." → get_checkin_stats
- "Prochaine séance..." → get_next_session
- "Mes calories cibles..." → get_nutrition_targets

Format de réponse structuré :
📊 [Valeur principale basée sur les données]
📅 [Date/Période concernée]
💬 [Explication courte et actionnable]

Tu dois :
- Répondre en français, de manière courte et actionnable
- Toujours consulter les outils avant de répondre aux questions factuelles
- Donner des conseils techniques précis basés sur les VRAIES données
- Proposer des alternatives ou modifications d'exercices si demandé
- Motiver l'utilisateur sans être trop verbeux
- Toujours tenir compte des limitations et du matériel disponible`;

    // Track data sources used
    let dataSources: any[] = [];

    // Initial AI call with tools
    let aiMessages = [{ role: "system", content: systemPrompt }, ...messages];
    let needsToolExecution = true;
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;

    while (needsToolExecution && iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      console.log(`AI iteration ${iterationCount}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          tools: tools,
          stream: false, // Non-streaming pour pouvoir parser tool_calls
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

      const aiResponse = await response.json();
      const choice = aiResponse.choices?.[0];

      if (!choice) {
        throw new Error("No response from AI");
      }

      // Check if AI wants to use tools
      if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
        console.log(`AI requested ${choice.message.tool_calls.length} tool calls`);

        // Add assistant message with tool calls to conversation
        aiMessages.push(choice.message);

        // Execute all tool calls
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

          console.log(`Executing tool: ${toolName}`, toolArgs);
          const result = await executeToolCall(toolName, toolArgs, userId, supabase);

          // Track data source
          dataSources.push({
            tool: toolName,
            args: toolArgs,
            result: result.summary || result.error,
          });

          // Add tool result to conversation
          aiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        // Continue loop to get final response
        continue;
      }

      // No more tools needed, return final response
      needsToolExecution = false;

      // Stream the final response
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
          "X-Data-Sources": JSON.stringify(dataSources), // Send data sources in header
        },
      });
    }

    return new Response(JSON.stringify({ error: "Max iterations reached" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-alex error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
