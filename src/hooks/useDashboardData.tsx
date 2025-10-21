import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, differenceInDays } from "date-fns";

interface DashboardStats {
  sessionsThisWeek: number;
  totalSessions: number;
  weekStreak: number;
  nextCheckIn: string;
  currentWeight: number | null;
  weightChange7d: number | null;
  weightChange30d: number | null;
  goalWeight: number | null;
  weeksToGoal: number | null;
  trainingMinutes7d: number;
  nutritionAdherence: number | null;
  activeStreak: number;
}

interface UpcomingSession {
  id: string;
  name: string;
  date: string;
  time: string;
  exercises: any;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    sessionsThisWeek: 0,
    totalSessions: 0,
    weekStreak: 0,
    nextCheckIn: "Bientôt",
    currentWeight: null,
    weightChange7d: null,
    weightChange30d: null,
    goalWeight: null,
    weeksToGoal: null,
    trainingMinutes7d: 0,
    nutritionAdherence: null,
    activeStreak: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [latestSession, setLatestSession] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
        
        // Fetch all sessions
        const { data: allSessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (sessionsError) throw sessionsError;

        // Calculate sessions this week
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const sessionsThisWeek = (allSessions || []).filter(
          s => s.completed && new Date(s.created_at) >= weekStart
        ).length;

        // Total completed sessions
        const totalSessions = (allSessions || []).filter(s => s.completed).length;

        // Get upcoming sessions (non-completed)
        const upcoming = (allSessions || [])
          .filter(s => !s.completed)
          .slice(0, 3)
          .map(s => {
            const exercises = s.exercises || [];
            const firstExercise = exercises[0];
            return {
              id: s.id,
              name: firstExercise?.name || "Séance d'entraînement",
              date: formatSessionDate(s.created_at),
              time: "Prêt à démarrer",
              exercises: s.exercises
            };
          });

        setUpcomingSessions(upcoming);

        // Get latest uncompleted session for Quick Actions
        const latest = (allSessions || []).find(s => !s.completed);
        setLatestSession(latest);

        // Fetch last check-in
        const { data: lastCheckIn } = await supabase
          .from("weekly_checkins")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextCheckIn = "Bientôt";
        if (lastCheckIn) {
          const daysSinceCheckIn = differenceInDays(new Date(), new Date(lastCheckIn.created_at));
          const daysUntilNext = 7 - daysSinceCheckIn;
          if (daysUntilNext > 0) {
            nextCheckIn = `Dans ${daysUntilNext} jour${daysUntilNext > 1 ? 's' : ''}`;
          } else {
            nextCheckIn = "Maintenant !";
          }
        } else {
          nextCheckIn = "Pas encore de check-in";
        }

        // Calculate week streak (simplified version)
        const weekStreak = Math.floor(totalSessions / 2) || 0; // Simple heuristic

        // Fetch goals for weight data
        const { data: goalsData } = await supabase
          .from("goals")
          .select("weight, target_weight_loss")
          .eq("user_id", user.id)
          .maybeSingle();

        // Fetch weekly check-ins for weight tracking
        const { data: checkIns } = await supabase
          .from("weekly_checkins")
          .select("average_weight, adherence_diet, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        // Calculate weight metrics
        const currentWeight = checkIns?.[0]?.average_weight || goalsData?.weight || null;
        const weight7dAgo = checkIns?.find(c => {
          const daysDiff = differenceInDays(new Date(), new Date(c.created_at));
          return daysDiff >= 7;
        })?.average_weight;
        const weight30dAgo = checkIns?.find(c => {
          const daysDiff = differenceInDays(new Date(), new Date(c.created_at));
          return daysDiff >= 30;
        })?.average_weight;

        const weightChange7d = currentWeight && weight7dAgo 
          ? Math.round((currentWeight - weight7dAgo) * 10) / 10 
          : null;
        const weightChange30d = currentWeight && weight30dAgo 
          ? Math.round((currentWeight - weight30dAgo) * 10) / 10 
          : null;

        // Calculate goal weight and weeks to goal
        const targetWeightLoss = goalsData?.target_weight_loss || 0;
        const goalWeight = currentWeight ? currentWeight - targetWeightLoss : null;
        const weeksToGoal = targetWeightLoss && weightChange7d && weightChange7d < 0
          ? Math.ceil(Math.abs(targetWeightLoss / (weightChange7d * 4)))
          : null;

        // Calculate training minutes (estimate 45min per session)
        const trainingMinutes7d = sessionsThisWeek * 45;

        // Get latest nutrition adherence
        const nutritionAdherence = checkIns?.[0]?.adherence_diet || null;

        // Calculate active streak (days with sessions or check-ins)
        let activeStreak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const hasActivity = (allSessions || []).some(s => {
            const sessionDate = new Date(s.created_at);
            return sessionDate.toDateString() === checkDate.toDateString();
          });
          if (hasActivity) {
            activeStreak++;
          } else if (i > 0) {
            break;
          }
        }

        setStats({
          sessionsThisWeek,
          totalSessions,
          weekStreak,
          nextCheckIn,
          currentWeight,
          weightChange7d,
          weightChange30d,
          goalWeight,
          weeksToGoal,
          trainingMinutes7d,
          nutritionAdherence,
          activeStreak,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { loading, error, stats, upcomingSessions, latestSession, refetch };
};

const formatSessionDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Demain";
  } else {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
};
