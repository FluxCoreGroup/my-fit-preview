import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addWeeks, format } from "date-fns";

interface Session {
  id: string;
  exercises: any;
  completed: boolean;
  created_at: string;
  session_date: string;
}

export const useWeeklyTraining = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current, -1 = previous, +1 = next
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchWeeklySessions = async () => {
      try {
        setLoading(true);
        
        const weekStart = startOfWeek(addWeeks(new Date(), currentWeek), { weekStartsOn: 1 });
        const weekEnd = addWeeks(weekStart, 1);

        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("session_date", weekStart.toISOString())
          .lt("session_date", weekEnd.toISOString())
          .order("session_date", { ascending: true });

        if (error) throw error;

        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching weekly sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklySessions();
  }, [user, currentWeek]);

  const changeWeek = (direction: "prev" | "next") => {
    setCurrentWeek(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const regenerateWeek = async () => {
    // Placeholder for week regeneration logic
    console.log("Regenerating week...");
  };

  const getWeekLabel = () => {
    const weekStart = startOfWeek(addWeeks(new Date(), currentWeek), { weekStartsOn: 1 });
    return format(weekStart, "dd MMM yyyy");
  };

  return {
    loading,
    sessions,
    currentWeek,
    changeWeek,
    goToCurrentWeek,
    regenerateWeek,
    getWeekLabel,
  };
};
