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
  frequency: z.number().min(1).max(7).optional(),
  experience_level: z.string().max(50).optional(),
  equipment: z.array(z.string().max(100)).max(20).optional(),
  session_type: z.string().max(50).optional(),
  limitations: z.array(z.string().max(200)).max(20).optional(),
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
      name: "get_weight_history",
      description: "UTILISER SYSTÉMATIQUEMENT pour toute question sur le poids, l'évolution de poids, les pesées. Retourne les données de weekly_checkins avec les poids moyens par semaine.",
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
      description: "Récupère les séances d'entraînement récentes de l'utilisateur avec les exercices effectués",
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
      description: "Récupère les statistiques des check-ins hebdomadaires (RPE moyen, adhérence, énergie, douleurs)",
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
      description: "Récupère la prochaine séance d'entraînement non complétée (inclut les séances récentes des 7 derniers jours)",
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
      name: "get_session_by_index",
      description: "UTILISER quand l'utilisateur demande 'ma séance 1', 'séance 2', etc. Récupère une séance spécifique par son numéro dans la semaine courante.",
      parameters: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "Numéro de la séance (1 pour la première, 2 pour la deuxième, etc.)",
          },
        },
        required: ["index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_all_week_sessions",
      description: "UTILISER pour voir toutes les séances de la semaine courante. Retourne la liste complète des séances planifiées/réalisées cette semaine.",
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
      description: "UTILISER SYSTÉMATIQUEMENT pour toute question sur le poids INITIAL, l'âge, la taille, le sexe, les objectifs, les calories cibles, les macros, les conditions de santé, les allergies, les restrictions alimentaires. Retourne TOUTES les données de la table goals + calculs TDEE.",
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
      name: "get_training_preferences",
      description: "UTILISER pour toute question sur le split, les zones prioritaires, le niveau, les exercices favoris/à éviter, les limitations physiques, le type de séance, la préférence de mobilité, la progression.",
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
      name: "get_user_profile",
      description: "Récupère le profil complet de l'utilisateur incluant nom, email, date d'inscription, et statut d'onboarding",
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
      name: "get_weekly_progress",
      description: "Récupère la progression du programme hebdomadaire (séances complétées vs planifiées, check-in fait ou non)",
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
      name: "get_exercise_history",
      description: "Récupère l'historique des performances pour un exercice spécifique (poids utilisés, RPE ressenti, commentaires)",
      parameters: {
        type: "object",
        properties: {
          exercise_name: {
            type: "string",
            description: "Nom de l'exercice à rechercher (recherche partielle supportée)",
          },
          limit: {
            type: "number",
            description: "Nombre d'entrées à récupérer (par défaut 10)",
          },
        },
        required: [],
      },
    },
  },
];

// Execute tool calls with validated parameters
async function executeToolCall(toolName: string, args: any, userId: string, supabase: any) {
  console.log(`Executing tool: ${toolName} for user ${userId}`, args);

  // Validate tool arguments
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
      case "get_weight_history": {
        const argsSchema = z.object({ weeks: z.number().min(1).max(52).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const weeks = validated?.weeks || 4;
        const weeksAgo = new Date();
        weeksAgo.setDate(weeksAgo.getDate() - weeks * 7);

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("average_weight, created_at, week_iso, weight_measure_1, weight_measure_2, weight_measure_3")
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
        const argsSchema = z.object({ limit: z.number().min(1).max(20).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const limit = validated?.limit || 5;

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
        const argsSchema = z.object({ period: z.enum(["week", "month"]).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const period = validated?.period || "week";
        const daysAgo = period === "week" ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("rpe_avg, adherence_diet, energy_level, has_pain, pain_zones, blockers, created_at")
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
        // Look for uncompleted sessions in the last 7 days AND future
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data, error } = await supabase
          .from("sessions")
          .select("id, session_date, exercises, completed")
          .eq("user_id", userId)
          .eq("completed", false)
          .gte("session_date", weekAgo.toISOString())
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

      case "get_session_by_index": {
        const argsSchema = z.object({ index: z.number().min(1).max(10) });
        const validated = validateToolArgs(argsSchema, args);
        const index = validated?.index || 1;

        // Get current week bounds (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const { data, error } = await supabase
          .from("sessions")
          .select("id, session_date, exercises, completed")
          .eq("user_id", userId)
          .gte("session_date", weekStart.toISOString())
          .lt("session_date", weekEnd.toISOString())
          .order("session_date", { ascending: true });

        if (error) {
          console.error("get_session_by_index error:", error);
          throw error;
        }

        const session = data?.[index - 1];
        console.log(`get_session_by_index: Looking for session ${index}, found ${data?.length || 0} total, match: ${session ? "yes" : "no"}`);

        if (!session) {
          return {
            success: true,
            data: null,
            totalSessions: data?.length || 0,
            summary: data?.length 
              ? `Séance ${index} non trouvée. Tu as ${data.length} séance(s) cette semaine.`
              : "Aucune séance planifiée cette semaine",
          };
        }

        return {
          success: true,
          data: session,
          sessionNumber: index,
          totalSessions: data.length,
          summary: `Séance ${index}/${data.length} - ${new Date(session.session_date).toLocaleDateString("fr-FR")} - ${session.completed ? "Complétée" : "À faire"}`,
        };
      }

      case "get_all_week_sessions": {
        // Get current week bounds (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const { data, error } = await supabase
          .from("sessions")
          .select("id, session_date, exercises, completed")
          .eq("user_id", userId)
          .gte("session_date", weekStart.toISOString())
          .lt("session_date", weekEnd.toISOString())
          .order("session_date", { ascending: true });

        if (error) {
          console.error("get_all_week_sessions error:", error);
          throw error;
        }

        console.log(`get_all_week_sessions: Found ${data?.length || 0} sessions this week`);

        const completedCount = data?.filter((s: any) => s.completed).length || 0;
        const sessionsWithIndex = data?.map((s: any, i: number) => ({
          ...s,
          sessionNumber: i + 1,
        })) || [];

        return {
          success: true,
          data: sessionsWithIndex,
          totalSessions: data?.length || 0,
          completedCount,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          summary: data?.length
            ? `${data.length} séance(s) cette semaine (${completedCount} complétée(s))`
            : "Aucune séance planifiée cette semaine",
        };
      }

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
          console.log("get_nutrition_targets: No goals found");
          return { success: false, error: "Aucun objectif défini" };
        }

        if (!goals.weight) {
          console.log("get_nutrition_targets: Goals found but weight is missing");
          return { 
            success: true, 
            weightMissing: true,
            data: goals,
            summary: "Objectif défini mais poids initial non renseigné" 
          };
        }

        console.log("get_nutrition_targets: Goals found, calculating TDEE");

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

        // Simple TDEE calculation (Mifflin-St Jeor)
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
            frequency: goals.frequency,
            session_duration: goals.session_duration,
            location: goals.location,
            equipment: goals.equipment,
            horizon: goals.horizon,
            target_weight_loss: goals.target_weight_loss,
            health_conditions: goals.health_conditions,
            restrictions: goals.restrictions,
            allergies: goals.allergies,
            has_cardio: goals.has_cardio,
            cardio_frequency: goals.cardio_frequency,
            meals_per_day: goals.meals_per_day,
            has_breakfast: goals.has_breakfast,
            tdee,
            targetCalories,
            protein,
            fat,
            carbs,
          },
          summary: `Poids initial: ${goals.weight}kg, Taille: ${goals.height}cm, Âge: ${age} ans, Objectif: ${goals.goal_type}, ${targetCalories} kcal/jour`,
        };
      }

      case "get_training_preferences": {
        const { data, error } = await supabase
          .from("training_preferences")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("get_training_preferences error:", error);
          throw error;
        }

        if (!data) {
          console.log("get_training_preferences: No preferences found");
          return { success: false, error: "Aucune préférence d'entraînement définie" };
        }

        console.log("get_training_preferences: Found preferences");
        return {
          success: true,
          data: {
            experience_level: data.experience_level,
            session_type: data.session_type,
            mobility_preference: data.mobility_preference,
            progression_focus: data.progression_focus,
            split_preference: data.split_preference,
            priority_zones: data.priority_zones,
            limitations: data.limitations,
            favorite_exercises: data.favorite_exercises,
            exercises_to_avoid: data.exercises_to_avoid,
            cardio_intensity: data.cardio_intensity,
          },
          summary: `Niveau: ${data.experience_level}, Type: ${data.session_type}, Split: ${data.split_preference || "non défini"}`,
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

        console.log(`get_nutrition_logs: Found ${data?.length || 0} records`);
        
        // Calculate totals
        const totalCalories = data?.reduce((sum: number, log: any) => sum + (log.calories || 0), 0) || 0;
        const avgCaloriesPerDay = data?.length ? Math.round(totalCalories / days) : 0;

        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} repas enregistrés sur ${days} jours, moyenne ${avgCaloriesPerDay} kcal/jour`,
          totalCalories,
          avgCaloriesPerDay,
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
          console.log("get_user_profile: No profile found");
          return { success: false, error: "Profil non trouvé" };
        }

        console.log("get_user_profile: Found profile");
        return {
          success: true,
          data: {
            name: data.name,
            email: data.email,
            created_at: data.created_at,
            onboarding_completed: data.onboarding_completed,
            onboarding_completed_at: data.onboarding_completed_at,
          },
          summary: `Utilisateur: ${data.name || data.email}, inscrit le ${new Date(data.created_at).toLocaleDateString("fr-FR")}`,
        };
      }

      case "get_weekly_progress": {
        const argsSchema = z.object({ weeks: z.number().min(1).max(12).optional() });
        const validated = validateToolArgs(argsSchema, args);
        const weeks = validated?.weeks || 4;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - weeks * 7);

        const { data, error } = await supabase
          .from("weekly_programs")
          .select("*")
          .eq("user_id", userId)
          .gte("week_start_date", startDate.toISOString())
          .order("week_start_date", { ascending: false });

        if (error) {
          console.error("get_weekly_progress error:", error);
          throw error;
        }

        console.log(`get_weekly_progress: Found ${data?.length || 0} programs`);

        const totalCompleted = data?.reduce((sum: number, p: any) => sum + (p.completed_sessions || 0), 0) || 0;
        const totalPlanned = data?.reduce((sum: number, p: any) => sum + (p.total_sessions || 0), 0) || 0;
        const adherenceRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} semaines, ${totalCompleted}/${totalPlanned} séances (${adherenceRate}% adhérence)`,
          totalCompleted,
          totalPlanned,
          adherenceRate,
        };
      }

      case "get_exercise_history": {
        const argsSchema = z.object({ 
          exercise_name: z.string().max(100).optional(),
          limit: z.number().min(1).max(50).optional() 
        });
        const validated = validateToolArgs(argsSchema, args);
        const limit = validated?.limit || 10;
        const exerciseName = validated?.exercise_name;

        let query = supabase
          .from("exercise_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (exerciseName) {
          query = query.ilike("exercise_name", `%${exerciseName}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("get_exercise_history error:", error);
          throw error;
        }

        console.log(`get_exercise_history: Found ${data?.length || 0} logs`);

        return {
          success: true,
          data: data || [],
          summary: `${data?.length || 0} entrées trouvées${exerciseName ? ` pour "${exerciseName}"` : ""}`,
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
  const sanitizeString = (str: string | undefined): string => {
    if (!str) return "non défini";
    return str.replace(/[<>{}]/g, '').substring(0, 100);
  };
  
  const sanitizeArray = (arr: string[] | undefined): string => {
    if (!arr || arr.length === 0) return "aucune";
    return arr.map(s => s.replace(/[<>{}]/g, '').substring(0, 100)).join(", ");
  };

  return {
    goal_type: sanitizeString(context?.goal_type),
    frequency: context?.frequency || "non définie",
    experience_level: sanitizeString(context?.experience_level),
    equipment: sanitizeArray(context?.equipment),
    session_type: sanitizeString(context?.session_type),
    limitations: sanitizeArray(context?.limitations),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
    
    const { messages, context, dataConsent } = parseResult.data;
    const sanitizedContext = sanitizeContext(context);
    const hasDataAccess = dataConsent === true;
    
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

    // Check subscription status (allow first use for free)
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // If user has used the service before, check subscription
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
          JSON.stringify({ error: "Abonnement requis pour continuer à utiliser le coach IA" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    console.log(`Subscription check passed for user ${userId}`);

    // System prompt based on data consent
    const systemPromptWithAccess = `Tu es Alex, coach sportif expert en musculation et fitness de l'app PULSE.

⚠️ RÈGLES CRITIQUES - RESPECT ABSOLU OBLIGATOIRE :
1. TOUJOURS utiliser les tools pour TOUTE question sur les données utilisateur
2. JAMAIS inventer, supposer ou estimer des chiffres - APPELER LES TOOLS D'ABORD
3. Si l'utilisateur demande son poids/sessions/objectifs → APPELER LES TOOLS AVANT DE RÉPONDRE
4. Ne réponds qu'avec les données EXACTES retournées par les tools
5. Si un tool retourne des données vides → dis clairement "Tu n'as pas encore enregistré..."

TOOLS DISPONIBLES (À UTILISER SYSTÉMATIQUEMENT) :
- get_weight_history : historique des pesées hebdomadaires (weekly_checkins)
- get_recent_sessions : dernières séances d'entraînement avec exercices
- get_checkin_stats : stats des check-ins (RPE, adhérence, énergie, douleurs)
- get_next_session : prochaine séance NON COMPLÉTÉE (7 derniers jours + futur)
- get_session_by_index : ⭐ UTILISER quand l'utilisateur dit "ma séance 1", "séance 2", "séance n°3", etc.
- get_all_week_sessions : ⭐ UTILISER pour voir TOUTES les séances de la semaine courante
- get_nutrition_targets : TOUTES les données de l'utilisateur (poids, taille, âge, sexe, objectifs, calories, macros, conditions de santé, allergies, restrictions)
- get_training_preferences : préférences d'entraînement (niveau, split, zones prioritaires, limitations, exercices favoris/à éviter)
- get_nutrition_logs : repas et calories consommés récemment
- get_user_profile : profil utilisateur (nom, email, date d'inscription)
- get_weekly_progress : progression des programmes hebdomadaires (adhérence, séances complétées)
- get_exercise_history : historique des performances par exercice (poids, RPE, commentaires)

⭐ RÈGLE IMPORTANTE POUR LES SÉANCES :
- "Ma séance 1" / "Séance n°1" / "Première séance" → get_session_by_index avec index=1
- "Ma séance 2" / "Séance n°2" / "Deuxième séance" → get_session_by_index avec index=2
- "Mes séances de la semaine" / "Toutes mes séances" → get_all_week_sessions
- "Ma prochaine séance" / "Mon prochain training" → get_next_session

QUAND UTILISER LES TOOLS (EXEMPLES CONCRETS) :
- "Quel est mon poids ?" → get_weight_history + get_nutrition_targets
- "Mon poids initial ?" → get_nutrition_targets
- "Mes dernières séances ?" → get_recent_sessions
- "Ma séance 1 ?" → get_session_by_index avec index=1
- "Mes séances cette semaine ?" → get_all_week_sessions
- "Mon prochain training ?" → get_next_session
- "Mon objectif ?" → get_nutrition_targets
- "Mes calories ?" → get_nutrition_targets
- "Mon RPE ?" → get_checkin_stats
- "Mon split ?" → get_training_preferences
- "Mes zones prioritaires ?" → get_training_preferences
- "Ce que j'ai mangé ?" → get_nutrition_logs
- "Ma progression ?" → get_weekly_progress
- "Mes perfs au squat ?" → get_exercise_history avec exercise_name="squat"
- "Mes conditions de santé ?" → get_nutrition_targets
- "Mes allergies ?" → get_nutrition_targets

Contexte utilisateur actuel (informations générales) :
- Objectif : ${sanitizedContext.goal_type}
- Fréquence d'entraînement : ${sanitizedContext.frequency} séances/semaine
- Niveau d'expérience : ${sanitizedContext.experience_level}
- Matériel disponible : ${sanitizedContext.equipment}
- Préférences : ${sanitizedContext.session_type}
- Limitations : ${sanitizedContext.limitations}

⚠️ ATTENTION : Ce contexte ne contient PAS de données chiffrées. 
Pour obtenir ces données, tu DOIS utiliser les tools.

Format de réponse structuré :
📊 [Valeur EXACTE issue des tools]
📅 [Date/Période]
💬 [Conseil court et actionnable]

COMPORTEMENT :
- Ton motivant mais factuel
- Toujours consulter les tools AVANT de répondre aux questions factuelles
- JAMAIS de chiffres inventés ou supposés
- Si aucune donnée n'est retournée → dis-le clairement
- Proposer des alternatives d'exercices si demandé
- Tenir compte des limitations et du matériel`;

    const systemPromptWithoutAccess = `Tu es Alex, coach sportif expert en musculation et fitness de l'app PULSE.

⚠️ IMPORTANT : L'utilisateur n'a pas autorisé l'accès à ses données personnelles.
Tu dois donner des conseils GÉNÉRAUX sans données personnalisées.

📌 Commence TOUJOURS ta réponse par :
"📌 Réponse générale (sans accès à tes données personnelles)"

Puis donne un conseil pertinent basé uniquement sur la question posée.

Tu ne peux PAS :
- Accéder au poids, aux séances, aux objectifs ou aux check-ins de l'utilisateur
- Donner des chiffres personnalisés (calories, macros, etc.)
- Mentionner des données spécifiques à l'utilisateur

Tu PEUX :
- Donner des conseils généraux sur l'entraînement
- Expliquer des techniques d'exercices
- Proposer des programmes génériques
- Répondre à des questions théoriques sur le fitness

Contexte général :
- Objectif déclaré : ${sanitizedContext.goal_type}
- Niveau déclaré : ${sanitizedContext.experience_level}

Ton : Motivant, professionnel, bienveillant.`;

    const systemPrompt = hasDataAccess ? systemPromptWithAccess : systemPromptWithoutAccess;

    // Track data sources used
    let dataSources: any[] = [];
    let debugGoalsStatus = "not-checked";

    // Build AI messages array
    let aiMessages: any[] = [{ role: "system", content: systemPrompt }, ...messages];

    // If no data access, skip tool loop entirely and go straight to streaming
    if (!hasDataAccess) {
      console.log("No data access consent - skipping tools, going to streaming response");
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
          "X-Debug-UserId": userId,
          "X-Debug-DataConsent": "false",
        },
      });
    }

    // Initial AI call with tools (only if data access granted)
    let needsToolExecution = true;
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;

    while (needsToolExecution && iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      console.log(`AI iteration ${iterationCount}`);

      // Detect keywords in last user message to force tool usage
      const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
      const needsWeightData = /poids|kg|weight|initial|objectif|calories|macro|santé|condition|allergie|restriction/i.test(lastUserMessage);
      const needsWeightHistory = /semaine dernière|historique|évolution|progression/i.test(lastUserMessage);
      const needsTrainingPrefs = /split|zone|priorit|niveau|exercice favori|éviter|limitation/i.test(lastUserMessage);
      const needsSessionByIndex = /séance\s*[n°#]?\s*\d+|séance\s*(1|2|3|4|5|6|7)|première séance|deuxième séance|troisième séance/i.test(lastUserMessage);
      const needsAllSessions = /mes séances|toutes les séances|séances de la semaine|programme de la semaine/i.test(lastUserMessage);

      const body: any = {
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: tools,
        stream: false,
      };

      // Force tool_choice for specific questions
      if (iterationCount === 1) {
        if (needsSessionByIndex) {
          // Extract the session number from the message
          const match = lastUserMessage.match(/séance\s*[n°#]?\s*(\d+)|première|deuxième|troisième/i);
          const sessionIndex = match ? 
            (match[1] ? parseInt(match[1]) : 
             match[0].includes("première") ? 1 :
             match[0].includes("deuxième") ? 2 :
             match[0].includes("troisième") ? 3 : 1) : 1;
          console.log(`Detected session by index request, index: ${sessionIndex}`);
          body.tool_choice = { type: "function", function: { name: "get_session_by_index" } };
          console.log("Forcing tool: get_session_by_index");
        } else if (needsAllSessions) {
          body.tool_choice = { type: "function", function: { name: "get_all_week_sessions" } };
          console.log("Forcing tool: get_all_week_sessions");
        } else if (needsWeightData) {
          body.tool_choice = { type: "function", function: { name: "get_nutrition_targets" } };
          console.log("Forcing tool: get_nutrition_targets");
        } else if (needsWeightHistory) {
          body.tool_choice = { type: "function", function: { name: "get_weight_history" } };
          console.log("Forcing tool: get_weight_history");
        } else if (needsTrainingPrefs) {
          body.tool_choice = { type: "function", function: { name: "get_training_preferences" } };
          console.log("Forcing tool: get_training_preferences");
        }
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

      // Log AI behavior for debugging
      console.log("AI response:", {
        hasToolCalls: !!choice.message?.tool_calls,
        toolCallsCount: choice.message?.tool_calls?.length || 0,
        finishReason: choice.finish_reason,
        toolNames: choice.message?.tool_calls?.map((tc: any) => tc.function.name) || [],
      });

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

          // Update debug status for nutrition targets
          if (toolName === "get_nutrition_targets") {
            if (!result.success) {
              debugGoalsStatus = "missing";
            } else if (result.weightMissing) {
              debugGoalsStatus = "weight-missing";
            } else {
              debugGoalsStatus = "found";
            }
          }

          // Track data source with detailed info
          const dataSourceEntry: any = {
            tool: toolName,
            args: toolArgs,
            result: result.summary || result.error,
          };

          // Add weight value for nutrition targets
          if (toolName === "get_nutrition_targets" && result.data?.weight) {
            dataSourceEntry.weight = result.data.weight;
          }

          dataSources.push(dataSourceEntry);

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
          "X-Data-Sources": JSON.stringify(dataSources),
          "X-Debug-UserId": userId,
          "X-Debug-Goals": debugGoalsStatus,
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
