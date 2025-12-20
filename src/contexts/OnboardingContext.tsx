import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Utensils, Target, Apple, Settings, MessageCircleQuestion, LucideIcon } from "lucide-react";

interface OnboardingState {
  phase: 'intro' | 'touring' | 'complete';
  currentStepIndex: number;
}

interface OnboardingContextType {
  state: OnboardingState;
  isOnboardingActive: boolean;
  isLoading: boolean;
  startTour: () => void;
  skipTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTour: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  getCurrentStep: () => TourStep | null;
  getTotalSteps: () => number;
}

export interface TourStep {
  title: string;
  description: string;
  moduleKey: string; // Which module to spotlight on Hub
  icon: LucideIcon;
}

const STORAGE_KEY = "hub_onboarding_progress";

// Flat linear tour steps - all shown on Hub
export const TOUR_STEPS: TourStep[] = [
  {
    title: "Bienvenue sur ton Hub",
    description: "C'est ton tableau de bord central. Tous tes outils de coaching sont ici, organisés en modules.",
    moduleKey: "none", // No spotlight, just welcome
    icon: Target,
  },
  {
    title: "Mes Entraînements",
    description: "Accède à tes séances personnalisées, générées chaque semaine selon ta progression et tes objectifs.",
    moduleKey: "training",
    icon: Dumbbell,
  },
  {
    title: "Ma Nutrition",
    description: "Consulte ton plan alimentaire, génère des repas healthy en 30 secondes et suis ton hydratation.",
    moduleKey: "nutrition",
    icon: Utensils,
  },
  {
    title: "Alex - Coach Sport",
    description: "Ton coach sportif IA disponible 24/7. Pose-lui toutes tes questions sur l'entraînement.",
    moduleKey: "alex",
    icon: Target,
  },
  {
    title: "Julie - Nutritionniste",
    description: "Ta nutritionniste IA pour t'aider dans ton alimentation au quotidien.",
    moduleKey: "julie",
    icon: Apple,
  },
  {
    title: "Paramètres",
    description: "Personnalise ton expérience : modifie ton profil, tes préférences d'entraînement et de nutrition.",
    moduleKey: "settings",
    icon: Settings,
  },
  {
    title: "Dernière étape !",
    description: "Crée maintenant ta première séance d'entraînement personnalisée. Clique sur 'Terminer' pour commencer !",
    moduleKey: "none",
    icon: Dumbbell,
  },
];

const initialState: OnboardingState = {
  phase: 'intro',
  currentStepIndex: 0,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dbCompleted, setDbCompleted] = useState<boolean | null>(null);

  const isOnboardingActive = state.phase === 'touring';

  // Check DB status on mount
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        const completed = profile?.onboarding_completed ?? false;
        setDbCompleted(completed);

        // If DB says completed, force state to complete
        if (completed) {
          setState({ ...initialState, phase: 'complete' });
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDbStatus();
  }, []);

  // Persist in-progress state to localStorage
  useEffect(() => {
    if (state.phase === 'touring') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Check if user needs onboarding (returns true if needs tour)
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      return !(profile?.onboarding_completed ?? false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, []);

  const startTour = () => {
    setState({ phase: 'touring', currentStepIndex: 0 });
  };

  const skipTour = async () => {
    await markOnboardingComplete();
  };

  const nextStep = () => {
    setState(prev => {
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= TOUR_STEPS.length) {
        // Tour complete
        localStorage.setItem('hub_onboarding_just_completed', 'true');
        localStorage.removeItem(STORAGE_KEY);
        return { ...prev, phase: 'complete' };
      }
      return { ...prev, currentStepIndex: nextIndex };
    });
  };

  const prevStep = () => {
    setState(prev => {
      if (prev.currentStepIndex > 0) {
        return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
      }
      return prev;
    });
  };

  // Mark onboarding as complete in DB
  const markOnboardingComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
    
    localStorage.removeItem(STORAGE_KEY);
    setDbCompleted(true);
    setState({ ...initialState, phase: 'complete' });
  };

  const completeTour = async () => {
    await markOnboardingComplete();
  };

  const getCurrentStep = (): TourStep | null => {
    if (state.phase !== 'touring') return null;
    return TOUR_STEPS[state.currentStepIndex] || null;
  };

  const getTotalSteps = (): number => TOUR_STEPS.length;

  return (
    <OnboardingContext.Provider value={{
      state,
      isOnboardingActive,
      isLoading,
      startTour,
      skipTour,
      nextStep,
      prevStep,
      completeTour,
      checkOnboardingStatus,
      getCurrentStep,
      getTotalSteps,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
