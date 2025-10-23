import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subWeeks } from "date-fns";

export const useWeeklyCheckInStatus = () => {
  const { user } = useAuth();
  const currentWeekISO = format(new Date(), "yyyy-'W'II");

  const { data: checkIn, isLoading } = useQuery({
    queryKey: ["weekly-checkin-status", user?.id, currentWeekISO],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("weekly_checkins")
        .select("id, average_weight, adherence_diet, created_at")
        .eq("user_id", user.id)
        .eq("week_iso", currentWeekISO)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: lastWeekCheckIn } = useQuery({
    queryKey: ["last-week-checkin", user?.id],
    queryFn: async () => {
      if (!user || !checkIn) return null;
      const lastWeekISO = format(subWeeks(new Date(), 1), "yyyy-'W'II");
      const { data } = await supabase
        .from("weekly_checkins")
        .select("average_weight")
        .eq("user_id", user.id)
        .eq("week_iso", lastWeekISO)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!checkIn,
  });

  const weightDelta = checkIn && lastWeekCheckIn 
    ? checkIn.average_weight - lastWeekCheckIn.average_weight
    : null;

  return {
    hasCheckInThisWeek: !!checkIn,
    checkIn,
    weightDelta,
    adherence: checkIn?.adherence_diet,
    isLoading,
  };
};
