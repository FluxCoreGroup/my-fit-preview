import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { calculateRecommendation } from "@/utils/adjustmentRules";

export const useWeeklyRecommendation = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-recommendation", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: checkIns } = await supabase
        .from("weekly_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      if (!checkIns || checkIns.length === 0) return null;

      const [current, previous] = checkIns;

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("session_date", weekStart.toISOString());

      const sessionsCompleted = sessions?.length || 0;

      return calculateRecommendation({
        currentWeight: current.average_weight,
        previousWeight: previous?.average_weight,
        adherence: current.adherence_diet,
        rpe: current.rpe_avg,
        hasPain: current.has_pain,
        energy: current.energy_level,
        sessionsCompleted,
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};
