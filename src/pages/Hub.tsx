import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding, ONBOARDING_MODULES } from "@/contexts/OnboardingContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Utensils, Target, Apple, Settings, MessageCircleQuestion } from "lucide-react";

const Hub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, isOnboardingActive, startTour, skipTour, enterModule } = useOnboarding();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

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

  const userName = user?.user_metadata?.name?.split(" ")[0] || "Champion";

  // Single useEffect to handle both training check and welcome modal
  useEffect(() => {
    const initializeHub = async () => {
      if (!user) return;
      
      // First check if training preferences exist
      const { data: prefs, error } = await supabase
        .from('training_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If no preferences, redirect to onboarding (no modal needed)
      if (!prefs && !error) {
        navigate('/onboarding-intro');
        return;
      }
      
      // Only after confirming prefs exist, check welcome modal
      const hasSeenWelcome = localStorage.getItem('hub_first_visit');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    };
    
    initializeHub();
  }, [user, navigate]);

  // Show completion modal when tour finishes
  useEffect(() => {
    if (state.phase === 'complete') {
      const justCompleted = localStorage.getItem('hub_onboarding_just_completed');
      if (justCompleted) {
        setShowComplete(true);
        localStorage.removeItem('hub_onboarding_just_completed');
      }
    }
  }, [state.phase]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hub_first_visit', 'done');
    setShowWelcome(false);
  };

  const handleStartTour = () => {
    startTour();
  };

  const handleModuleClick = async (path: string) => {
    enterModule();
    // Wait for state to propagate before navigating
    await new Promise(resolve => setTimeout(resolve, 50));
    navigate(path);
  };

  // Get module state based on onboarding progress
  const getModuleState = (moduleIndex: number) => {
    if (!isOnboardingActive || state.phase !== 'hub-spotlight') {
      return { locked: false, spotlight: false };
    }
    if (moduleIndex < state.currentModuleIndex) {
      return { locked: false, spotlight: false }; // Already visited
    }
    if (moduleIndex === state.currentModuleIndex) {
      return { locked: false, spotlight: true }; // Current
    }
    return { locked: true, spotlight: false }; // Not yet
  };

  const currentModule = ONBOARDING_MODULES[state.currentModuleIndex];

  return (
    <>
      <WelcomeModal 
        open={showWelcome} 
        userName={userName}
        onComplete={handleWelcomeComplete}
        onStartTour={handleStartTour}
      />
      
      <OnboardingComplete 
        open={showComplete}
        onClose={() => setShowComplete(false)}
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
              {...getModuleState(0)}
              spotlightData={state.currentModuleIndex === 0 ? {
                title: currentModule?.name || "",
                description: currentModule?.description || "",
                onAction: () => handleModuleClick("/training"),
                onSkip: skipTour,
              } : undefined}
            />

            {/* Ma nutrition */}
            <ModuleCard
              icon={Utensils}
              title="Ma nutrition"
              iconColor="210 70% 50%"
              to="/nutrition"
              {...getModuleState(1)}
              spotlightData={state.currentModuleIndex === 1 ? {
                title: currentModule?.name || "",
                description: currentModule?.description || "",
                onAction: () => handleModuleClick("/nutrition"),
                onSkip: skipTour,
              } : undefined}
            />

            {/* Alex (Coach IA) */}
            <ModuleCard
              icon={Target}
              title="Alex"
              subtitle="Coach Sport"
              iconColor="190 75% 55%"
              to="/coach/alex"
              {...getModuleState(2)}
              spotlightData={state.currentModuleIndex === 2 ? {
                title: currentModule?.name || "",
                description: currentModule?.description || "",
                onAction: () => handleModuleClick("/coach/alex"),
                onSkip: skipTour,
              } : undefined}
            />

            {/* Julie (Nutritionniste IA) */}
            <ModuleCard
              icon={Apple}
              title="Julie"
              subtitle="Nutritionniste"
              iconColor="300 60% 60%"
              to="/coach/julie"
              {...getModuleState(3)}
              spotlightData={state.currentModuleIndex === 3 ? {
                title: currentModule?.name || "",
                description: currentModule?.description || "",
                onAction: () => handleModuleClick("/coach/julie"),
                onSkip: skipTour,
              } : undefined}
            />

            {/* Paramètres - always unlocked, no spotlight */}
            <ModuleCard
              icon={Settings}
              title="Paramètres"
              iconColor="245 58% 55%"
              to="/settings"
            />

            {/* Aide - always unlocked, no spotlight */}
            <ModuleCard
              icon={MessageCircleQuestion}
              title="Aide"
              iconColor="180 60% 50%"
              to="/settings/support"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hub;
