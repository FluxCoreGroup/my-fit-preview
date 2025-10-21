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

      // Compte le nombre total d'utilisateurs
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Récupère le nombre de séances de l'utilisateur
      const { data: userSessions } = await supabase
        .from("sessions")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("completed", true);

      const userSessionCount = userSessions?.length || 0;

      // Compte combien d'utilisateurs ont moins de séances
      const { count: usersBelow } = await supabase
        .from("sessions")
        .select("user_id", { count: "exact", head: true })
        .eq("completed", true)
        .lt("created_at", new Date().toISOString());

      // Calcul approximatif du percentile
      const percentile = totalUsers && totalUsers > 0
        ? Math.round(((usersBelow || 0) / totalUsers) * 100)
        : 50;

      return {
        percentile: Math.min(percentile, 99), // Cap à 99%
        totalUsers: totalUsers || 0,
        userSessions: userSessionCount,
      };
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

  const getColor = () => {
    if (ranking.percentile >= 90) return "from-accent/20 to-accent/5 border-accent/30";
    if (ranking.percentile >= 75) return "from-primary/20 to-primary/5 border-primary/30";
    return "from-secondary/20 to-secondary/5 border-secondary/30";
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${getColor()} backdrop-blur-xl`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-accent/10 rounded-xl shrink-0">
          <Trophy className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Ton classement</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">Top {ranking.percentile}%</p>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <p className="text-sm text-muted-foreground">{getMessage()}</p>
          <p className="text-xs text-muted-foreground">
            {ranking.userSessions} séances complétées • Comparaison anonyme
          </p>
        </div>
      </div>
    </Card>
  );
};
