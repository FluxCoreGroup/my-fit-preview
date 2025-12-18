import { useState, useEffect, useCallback } from "react";
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

interface WeeklyProgram {
  id: string;
  week_start_date: string;
  week_end_date: string;
  total_sessions: number;
  completed_sessions: number;
  check_in_completed: boolean;
}

export const useWeeklyTraining = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [historicalPrograms, setHistoricalPrograms] = useState<WeeklyProgram[]>([]);
  const [currentProgram, setCurrentProgram] = useState<WeeklyProgram | null>(null);

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

  const fetchHistoricalPrograms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("weekly_programs")
        .select("*")
        .eq("user_id", user.id)
        .order("week_start_date", { ascending: false })
        .limit(4);

      if (error) throw error;
      setHistoricalPrograms(data || []);
      
      // Set current program (most recent)
      if (data && data.length > 0) {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const current = data.find(p => 
          new Date(p.week_start_date) <= new Date() && 
          new Date(p.week_end_date) >= new Date()
        );
        setCurrentProgram(current || null);
      }
    } catch (error) {
      console.error("Error fetching historical programs:", error);
    }
  };

  useEffect(() => {
    fetchWeeklySessions();
    fetchHistoricalPrograms();
  }, [user, currentWeek]);

  const changeWeek = (direction: "prev" | "next") => {
    setCurrentWeek(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const canGenerateWeek = useCallback(async (): Promise<{ allowed: boolean; reason?: string }> => {
    if (!user) return { allowed: false, reason: "Non authentifié" };

    // Check if this is the first program ever
    const { data: existingPrograms } = await supabase
      .from("weekly_programs")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    // First time = automatic authorization
    if (!existingPrograms || existingPrograms.length === 0) {
      return { allowed: true };
    }

    // Check if last week's check-in exists
    const lastWeekStart = startOfWeek(addWeeks(new Date(), -1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

    const { data: lastWeekCheckIn } = await supabase
      .from("weekly_checkins")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", lastWeekStart.toISOString())
      .lte("created_at", lastWeekEnd.toISOString())
      .maybeSingle();

    if (!lastWeekCheckIn) {
      return {
        allowed: false,
        reason: "Tu dois compléter le check-in de la semaine dernière avant de générer cette semaine.",
      };
    }

    return { allowed: true };
  }, [user]);

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

    // Check if generation is allowed
    const { allowed, reason } = await canGenerateWeek();
    if (!allowed) {
      toast({
        title: "Génération impossible",
        description: reason,
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
      await fetchHistoricalPrograms();
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

  // Check if all sessions are completed
  const isWeekComplete = sessions.length > 0 && sessions.every(s => s.completed);

  // Check if feedback is needed (week complete but no check-in done)
  const needsFeedback = isWeekComplete && currentProgram && !currentProgram.check_in_completed;

  const refreshData = async () => {
    await fetchWeeklySessions();
    await fetchHistoricalPrograms();
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
    canGenerateWeek,
    historicalPrograms,
    isWeekComplete,
    needsFeedback,
    refreshData,
  };
};
