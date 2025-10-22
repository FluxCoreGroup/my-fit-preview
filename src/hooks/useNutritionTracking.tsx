import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useNutritionTracking = () => {
  const { user } = useAuth();

  // Récupérer l'évolution du poids (4 dernières semaines)
  const { data: weightData } = useQuery({
    queryKey: ["weight-logs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data } = await supabase
        .from("weight_logs")
        .select("weight, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", fourWeeksAgo.toISOString())
        .order("logged_at", { ascending: true });

      return data || [];
    },
    enabled: !!user,
  });

  // Récupérer les stats de la semaine
  const { data: weeklyStats } = useQuery({
    queryKey: ["nutrition-weekly-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data } = await supabase
        .from("nutrition_logs")
        .select("logged_at, calories")
        .eq("user_id", user.id)
        .gte("logged_at", oneWeekAgo.toISOString());

      if (!data || data.length === 0) return null;

      // Calculer les stats
      const daysTracked = new Set(data.map(log => 
        new Date(log.logged_at).toDateString()
      )).size;

      const avgCalories = Math.round(
        data.reduce((sum, log) => sum + log.calories, 0) / data.length
      );

      const adherence = Math.round((daysTracked / 7) * 100);

      return { daysTracked, avgCalories, adherence };
    },
    enabled: !!user,
  });

  return { weightData, weeklyStats };
};
