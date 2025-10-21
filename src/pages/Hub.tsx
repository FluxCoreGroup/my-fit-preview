import { useState, useEffect } from "react";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Dumbbell, Apple, TrendingUp, Bot, Sparkles, Settings, HelpCircle } from "lucide-react";

const Hub = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardData();
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: goals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("goals")
        .select("frequency")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const frequency = goals?.frequency || 3;

  const userName = user?.user_metadata?.name?.split(" ")[0] || "Champion";

  // Vérifier si c'est la 1ère visite post-inscription
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hub_first_visit');
    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hub_first_visit', 'done');
    setShowWelcome(false);
  };

  return (
    <>
      <WelcomeModal 
        open={showWelcome} 
        userName={userName}
        onComplete={handleWelcomeComplete}
      />
      <div className="min-h-screen bg-muted/30 pb-8">
        {/* Header */}
        <div className="bg-card border-b px-4 py-6">
        <h1 className="text-2xl font-bold">
          Salut {userName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Bienvenue sur Pulse.ai
        </p>
      </div>

      {/* Grid de modules */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Accueil - Orange */}
          <ModuleCard
            icon={Home}
            title="Accueil"
            iconColor="24.6 95% 53.1%"
            to="/home"
          />

          {/* Mes entraînements - Teal */}
          <ModuleCard
            icon={Dumbbell}
            title="Mes entraînements"
            badge={
              !loading && stats?.sessionsThisWeek !== undefined
                ? `${stats.sessionsThisWeek}/${frequency}`
                : undefined
            }
            iconColor="180 62% 45%"
            to="/training"
          />

          {/* Ma nutrition - Ambre */}
          <ModuleCard
            icon={Apple}
            title="Ma nutrition"
            badge={
              !loading && stats?.nutritionAdherence
                ? `${stats.nutritionAdherence}%`
                : undefined
            }
            iconColor="45 93% 47%"
            to="/nutrition"
          />

          {/* Mon suivi - Violet */}
          <ModuleCard
            icon={TrendingUp}
            title="Mon suivi"
            badge={!loading && stats?.nextCheckIn === "Maintenant !" ? "!" : undefined}
            iconColor="271 81% 56%"
            to="/weekly"
          />

          {/* Alex (Coach IA) - Bleu */}
          <ModuleCard
            icon={Bot}
            title="Alex"
            iconColor="217.2 91.2% 59.8%"
            to="/coach?tab=alex"
          />

          {/* Julie (Nutritionniste IA) - Rose */}
          <ModuleCard
            icon={Sparkles}
            title="Julie"
            iconColor="330 81% 60%"
            to="/coach?tab=julie"
          />

          {/* Paramètres - Gris */}
          <ModuleCard
            icon={Settings}
            title="Paramètres"
            iconColor="215 16% 47%"
            to="/settings"
          />

          {/* Aide - Indigo */}
          <ModuleCard
            icon={HelpCircle}
            title="Aide"
            iconColor="239 84% 67%"
            to="/support"
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default Hub;
