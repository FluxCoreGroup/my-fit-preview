import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Utensils, Target, Apple, Settings, MessageCircleQuestion } from "lucide-react";

const Hub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Fetch sessions count for this week
  const { data: sessionsData } = useQuery({
    queryKey: ["sessions-count", user?.id],
    queryFn: async () => {
      if (!user) return { count: 0 };
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from("sessions")
        .select("completed")
        .eq("user_id", user.id)
        .gte("session_date", startOfWeek.toISOString());
      
      return {
        completed: data?.filter(s => s.completed).length || 0,
        total: data?.length || 0
      };
    },
    enabled: !!user,
  });

  const frequency = goals?.frequency || 3;
  const userName = user?.user_metadata?.name?.split(" ")[0] || "Champion";

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hub_first_visit');
    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
    }
  }, [user]);

  useEffect(() => {
    const checkTrainingSetup = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('training_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!data && !error) {
        navigate('/onboarding-intro');
      }
    };
    
    checkTrainingSetup();
  }, [user, navigate]);

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

        {/* Grid de modules - 6 modules */}
        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Mes entraînements */}
            <ModuleCard
              icon={Dumbbell}
              title="Mes entraînements"
              badge={
                sessionsData?.total
                  ? `${sessionsData.completed}/${sessionsData.total}`
                  : undefined
              }
              iconColor="217 91% 60%"
              to="/training"
            />

            {/* Ma nutrition */}
            <ModuleCard
              icon={Utensils}
              title="Ma nutrition"
              iconColor="210 70% 50%"
              to="/nutrition"
            />

            {/* Alex (Coach IA) */}
            <ModuleCard
              icon={Target}
              title="Alex"
              subtitle="Coach Sport"
              iconColor="190 75% 55%"
              to="/coach/alex"
            />

            {/* Julie (Nutritionniste IA) */}
            <ModuleCard
              icon={Apple}
              title="Julie"
              subtitle="Nutritionniste"
              iconColor="300 60% 60%"
              to="/coach/julie"
            />

            {/* Paramètres */}
            <ModuleCard
              icon={Settings}
              title="Paramètres"
              iconColor="245 58% 55%"
              to="/settings"
            />

            {/* Aide */}
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
