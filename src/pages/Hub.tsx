import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { HubTour } from "@/components/dashboard/HubTour";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding, TOUR_STEPS } from "@/contexts/OnboardingContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Utensils, Target, Apple, Settings, MessageCircleQuestion, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";

const Hub = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { state, isOnboardingActive, isLoading: onboardingLoading, startTour, skipTour, checkOnboardingStatus, getCurrentStep } = useOnboarding();
  const { status: subscriptionStatus } = useSubscriptionContext();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [initDone, setInitDone] = useState(false);

  // Handle subscription success from payment redirect
  useEffect(() => {
    if (searchParams.get("subscription") === "success") {
      toast.success("Bienvenue dans Pulse.ai Premium !", {
        description: "Ton abonnement est maintenant actif. Profite de toutes les fonctionnalités !",
        duration: 5000,
      });
      searchParams.delete("subscription");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  // Initialize Hub: check training prefs + onboarding status
  useEffect(() => {
    const initializeHub = async () => {
      if (!user || onboardingLoading || initDone) return;
      
      const { data: prefs, error } = await supabase
        .from('training_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!prefs && !error) {
        navigate('/onboarding-intro');
        return;
      }
      
      const needsOnboarding = await checkOnboardingStatus();
      
      if (needsOnboarding) {
        setShowWelcome(true);
      }
      
      setInitDone(true);
    };
    
    initializeHub();
  }, [user, onboardingLoading, initDone, navigate, checkOnboardingStatus]);

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
    setShowWelcome(false);
  };

  const handleStartTour = () => {
    startTour();
  };

  // Get spotlight state for each module based on current tour step
  const getModuleSpotlight = (moduleKey: string) => {
    if (!isOnboardingActive) return false;
    const currentStep = getCurrentStep();
    return currentStep?.moduleKey === moduleKey;
  };

  return (
    <>
      <WelcomeModal 
        open={showWelcome} 
        userName={userName}
        onComplete={handleWelcomeComplete}
        onStartTour={handleStartTour}
        onSkipTour={skipTour}
      />
      
      <OnboardingComplete 
        open={showComplete}
        onClose={() => setShowComplete(false)}
      />

      {/* Hub Tour Overlay */}
      <HubTour />

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

        {/* Subscription expired banner */}
        {subscriptionStatus === "inactive" && (
          <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Ton abonnement a expiré</p>
              <p className="text-sm text-muted-foreground mt-1">
                Réabonne-toi pour accéder à tes entraînements et coachs IA.
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => navigate("/tarif")}
              >
                Se réabonner
              </Button>
            </div>
          </div>
        )}

        {/* Grid de modules */}
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
              spotlight={getModuleSpotlight("training")}
            />

            {/* Ma nutrition */}
            <ModuleCard
              icon={Utensils}
              title="Ma nutrition"
              iconColor="210 70% 50%"
              to="/nutrition"
              spotlight={getModuleSpotlight("nutrition")}
            />

            {/* Alex (Coach IA) */}
            <ModuleCard
              icon={Target}
              title="Alex"
              subtitle="Coach Sport"
              iconColor="190 75% 55%"
              to="/coach/alex"
              spotlight={getModuleSpotlight("alex")}
            />

            {/* Julie (Nutritionniste IA) */}
            <ModuleCard
              icon={Apple}
              title="Julie"
              subtitle="Nutritionniste"
              iconColor="300 60% 60%"
              to="/coach/julie"
              spotlight={getModuleSpotlight("julie")}
            />

            {/* Paramètres */}
            <ModuleCard
              icon={Settings}
              title="Paramètres"
              iconColor="245 58% 55%"
              to="/settings"
              spotlight={getModuleSpotlight("settings")}
            />

            {/* Aide */}
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
