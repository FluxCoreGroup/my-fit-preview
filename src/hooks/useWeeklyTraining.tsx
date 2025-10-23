import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addWeeks, format, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  exercises: any;
  completed: boolean;
  created_at: string;
  session_date: string;
}

export const useWeeklyTraining = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchWeeklySessions = async () => {
    if (!user) return;

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

  useEffect(() => {
    fetchWeeklySessions();
  }, [user, currentWeek]);

  const changeWeek = (direction: "prev" | "next") => {
    setCurrentWeek(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const generateWeeklyProgram = async (regenerate = false) => {
    if (!user) return;

    if (currentWeek > 0) {
      toast({
        title: "Impossible de générer",
        description: "Génère d'abord la semaine courante avant les semaines futures.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const weekStart = startOfWeek(addWeeks(new Date(), currentWeek), { weekStartsOn: 1 });

      const { data, error } = await supabase.functions.invoke('generate-weekly-program', {
        body: {
          week_start_date: weekStart.toISOString(),
          regenerate
        }
      });

      if (error) throw error;

      toast({
        title: "Programme généré ! 🎉",
        description: `${data.totalGenerated} séances créées pour cette semaine.`,
      });

      await fetchWeeklySessions();
    } catch (error) {
      console.error("Error generating weekly program:", error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le programme. Réessaie plus tard.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getWeekLabel = () => {
    const weekStart = startOfWeek(addWeeks(new Date(), currentWeek), { weekStartsOn: 1 });
    const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const dateRange = `${format(weekStart, "dd MMM", { locale: fr })} - ${format(weekEndDate, "dd MMM", { locale: fr })}`;
    
    if (currentWeek === 0) {
      return `Semaine actuelle : ${dateRange}`;
    } else if (currentWeek === -1) {
      return `Semaine dernière : ${dateRange}`;
    } else if (currentWeek === 1) {
      return `Semaine prochaine : ${dateRange}`;
    }
    
    return dateRange;
  };

  const getCompletedCount = () => {
    return sessions.filter(s => s.completed).length;
  };

  const getProgressPercentage = () => {
    if (sessions.length === 0) return 0;
    return Math.round((getCompletedCount() / sessions.length) * 100);
  };

  return {
    loading,
    isGenerating,
    sessions,
    currentWeek,
    changeWeek,
    goToCurrentWeek,
    generateWeeklyProgram,
    getWeekLabel,
    getCompletedCount,
    getProgressPercentage,
  };
};
