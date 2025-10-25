import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const LeaderboardCard = () => {
  const { user } = useAuth();

  const { data: ranking, isLoading } = useQuery({
    queryKey: ["user-ranking", user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        // Récupère le nombre de séances de l'utilisateur
        const { data: userSessions } = await supabase
          .from("sessions")
          .select("id")
          .eq("user_id", user.id)
          .eq("completed", true);

        const userSessionCount = userSessions?.length || 0;

        // Compte le nombre total d'utilisateurs ayant au moins une session
        const { data: allUserSessions } = await supabase
          .from("sessions")
          .select("user_id")
          .eq("completed", true);

        if (!allUserSessions || allUserSessions.length === 0) {
          return {
            percentile: 50,
            totalUsers: 1,
            userSessions: userSessionCount,
          };
        }

        // Groupe les sessions par utilisateur
        const sessionsByUser = allUserSessions.reduce((acc: { [key: string]: number }, session) => {
          acc[session.user_id] = (acc[session.user_id] || 0) + 1;
          return acc;
        }, {});

        const sessionCounts = Object.values(sessionsByUser);
        const totalUsers = sessionCounts.length;
        
        // Compte combien d'utilisateurs ont moins de séances
        const usersBelow = sessionCounts.filter(count => count < userSessionCount).length;

        // Calcul du percentile
        const percentile = totalUsers > 0
          ? Math.round((usersBelow / totalUsers) * 100)
          : 50;

        return {
          percentile: Math.min(Math.max(percentile, 1), 99), // Entre 1% et 99%
          totalUsers,
          userSessions: userSessionCount,
        };
      } catch (error) {
        console.error('Error fetching ranking:', error);
        return {
          percentile: 50,
          totalUsers: 0,
          userSessions: 0,
        };
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!ranking) return null;

  // Déterminer le message selon le percentile
  const getMessage = () => {
    if (ranking.percentile >= 90) return "Incroyable ! Tu es dans le TOP 10% 🔥";
    if (ranking.percentile >= 75) return "Excellent ! TOP 25% des utilisateurs 💪";
    if (ranking.percentile >= 50) return "Tu es au-dessus de la moyenne ! 📈";
    return "Continue, tu progresses ! 🚀";
  };

  return (
    <Card className="p-4 bg-primary/5 border-primary/10">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Ton classement</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">Top {ranking.percentile}%</p>
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">{getMessage()}</p>
          <p className="text-[10px] text-muted-foreground">
            {ranking.userSessions} séances • Comparaison anonyme
          </p>
        </div>
      </div>
    </Card>
  );
};
