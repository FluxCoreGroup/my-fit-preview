import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, differenceInDays } from "date-fns";

interface DashboardStats {
  sessionsThisWeek: number;
  totalSessions: number;
  weekStreak: number;
  nextCheckIn: string;
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
  const [stats, setStats] = useState<DashboardStats>({
    sessionsThisWeek: 0,
    totalSessions: 0,
    weekStreak: 0,
    nextCheckIn: "Bientôt"
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [latestSession, setLatestSession] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
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

        setStats({
          sessionsThisWeek,
          totalSessions,
          weekStreak,
          nextCheckIn
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { loading, stats, upcomingSessions, latestSession };
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
