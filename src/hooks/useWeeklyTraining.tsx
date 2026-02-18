import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addWeeks, format, endOfWeek, subWeeks, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  exercises: any;
  completed: boolean;
  created_at: string;
  session_date: string;
  partially_completed?: boolean;
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
  // Program with pending check-in (past week, not yet checked-in)
  const [pendingCheckInProgram, setPendingCheckInProgram] = useState<WeeklyProgram | null>(null);

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
        .limit(10);

      if (error) throw error;
      setHistoricalPrograms(data || []);
      
      const now = new Date();

      // Set current program (active this week)
      if (data && data.length > 0) {
        const current = data.find(p => 
          new Date(p.week_start_date) <= now && 
          new Date(p.week_end_date) >= now
        );
        setCurrentProgram(current || null);

        // Detect past program(s) without check-in (not older than 30 days to avoid spam)
        const pending = data.find(p =>
          new Date(p.week_end_date) < now &&
          !p.check_in_completed &&
          differenceInDays(now, new Date(p.week_end_date)) <= 30
        );
        setPendingCheckInProgram(pending || null);
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

    // Fetch the most recent past weekly program (week already ended)
    const { data: lastProgram } = await supabase
      .from("weekly_programs")
      .select("check_in_completed, week_start_date, week_end_date")
      .eq("user_id", user.id)
      .lt("week_end_date", new Date().toISOString())
      .order("week_start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    // No past program → allow
    if (!lastProgram) {
      return { allowed: true };
    }

    // Fast path: check_in_completed already set → allow
    if (lastProgram.check_in_completed) {
      return { allowed: true };
    }

    // Robustness: if last week ended > 14 days ago without check-in → user is inactive, allow anyway
    const daysSinceEnd = differenceInDays(new Date(), new Date(lastProgram.week_end_date));
    if (daysSinceEnd > 14) {
      // Auto-mark as completed silently so they don't get blocked on next visit
      await supabase
        .from("weekly_programs")
        .update({ check_in_completed: true })
        .eq("user_id", user.id)
        .eq("week_start_date", lastProgram.week_start_date);

      return { allowed: true };
    }

    // Fallback: check via week_iso in weekly_checkins
    // Use ISO week string based on the program's week_start_date
    const lastWeekISO = format(new Date(lastProgram.week_start_date), "yyyy-'W'II");
    // Also check the following week's ISO (handles late check-ins on Monday)
    const nextWeekISO = format(addWeeks(new Date(lastProgram.week_start_date), 1), "yyyy-'W'II");

    const { data: lastWeekCheckIn } = await supabase
      .from("weekly_checkins")
      .select("id")
      .eq("user_id", user.id)
      .in("week_iso", [lastWeekISO, nextWeekISO])
      .limit(1)
      .maybeSingle();

    if (lastWeekCheckIn) {
      // Auto-repair: found check-in but weekly_programs not updated
      await supabase
        .from("weekly_programs")
        .update({ check_in_completed: true, check_in_id: lastWeekCheckIn.id })
        .eq("user_id", user.id)
        .eq("week_start_date", lastProgram.week_start_date);

      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "Tu dois compléter le check-in de la semaine dernière avant de générer cette semaine.",
    };
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

  // Postpone a session by N days
  const postponeSession = async (sessionId: string, days: number = 1) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newDate = new Date(session.session_date);
    newDate.setDate(newDate.getDate() + days);

    const { error } = await supabase
      .from("sessions")
      .update({ session_date: newDate.toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user?.id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de reporter la séance", variant: "destructive" });
    } else {
      toast({ title: "Séance reportée", description: `Déplacée au ${format(newDate, "EEEE dd MMM", { locale: fr })}` });
      await fetchWeeklySessions();
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

  // needsFeedback: week complete but check-in not done yet
  const needsFeedback = isWeekComplete && currentProgram && !currentProgram.check_in_completed;

  // hasPendingCheckIn: a past week has no check-in (separate from current week)
  const hasPendingCheckIn = !!pendingCheckInProgram && !needsFeedback;

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
    postponeSession,
    getWeekLabel,
    getCompletedCount,
    getProgressPercentage,
    canGenerateWeek,
    historicalPrograms,
    currentProgram,
    pendingCheckInProgram,
    isWeekComplete,
    needsFeedback,
    hasPendingCheckIn,
    refreshData,
  };
};
