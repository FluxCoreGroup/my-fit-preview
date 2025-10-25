import { useState, useEffect } from "react";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useWeeklyCheckInStatus } from "@/hooks/useWeeklyCheckInStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Dumbbell, Utensils, Activity, Target, Apple, Settings, MessageCircleQuestion } from "lucide-react";

const Hub = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardData();
  const { hasCheckInThisWeek, weightDelta, adherence } = useWeeklyCheckInStatus();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-100/20 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200/50 px-4 py-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Salut {userName} 👋
        </h1>
        <p className="text-sm text-blue-700/70">
          Prêt à progresser aujourd'hui ?
        </p>
      </div>

      {/* Grid de modules */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Accueil - Bleu Ciel */}
          <ModuleCard
            icon={LayoutDashboard}
            title="Accueil"
            iconColor="200 85% 65%"
            to="/home"
          />

          {/* Mes entraînements - Bleu Électrique */}
          <ModuleCard
            icon={Dumbbell}
            title="Mes entraînements"
            badge={
              !loading && stats?.sessionsThisWeek !== undefined
                ? `${stats.sessionsThisWeek}/${frequency}`
                : undefined
            }
            iconColor="217 91% 60%"
            to="/training"
          />

          {/* Ma nutrition - Bleu Océan */}
          <ModuleCard
            icon={Utensils}
            title="Ma nutrition"
            badge={
              !loading && stats?.nutritionAdherence
                ? `${stats.nutritionAdherence}%`
                : undefined
            }
            iconColor="210 70% 50%"
            to="/nutrition"
          />

          {/* Mon suivi - Bleu Nuit */}
          <ModuleCard
            icon={Activity}
            title="Mon suivi"
            badge={hasCheckInThisWeek ? "✓" : "!"}
            subtitle={
              hasCheckInThisWeek && weightDelta !== null
                ? `Δ ${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)}kg | ${adherence}%`
                : hasCheckInThisWeek
                ? "Check-in fait"
                : "2 min pour faire le point"
            }
            iconColor="230 50% 40%"
            to={hasCheckInThisWeek ? "/progression" : "/weekly"}
          />

          {/* Alex (Coach IA) - Bleu Cyan */}
          <ModuleCard
            icon={Target}
            title="Alex"
            subtitle="Coach Sport"
            iconColor="190 75% 55%"
            to="/coach/alex"
          />

          {/* Julie (Nutritionniste IA) - Rose/Mauve */}
          <ModuleCard
            icon={Apple}
            title="Julie"
            subtitle="Nutritionniste"
            iconColor="300 60% 60%"
            to="/coach/julie"
          />

          {/* Paramètres - Bleu Indigo */}
          <ModuleCard
            icon={Settings}
            title="Paramètres"
            iconColor="245 58% 55%"
            to="/settings"
          />

          {/* Aide - Bleu-Vert */}
          <ModuleCard
            icon={MessageCircleQuestion}
            title="Aide"
            iconColor="180 60% 50%"
            to="/support"
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default Hub;
