import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingState {
  phase: 'intro' | 'hub-spotlight' | 'in-module' | 'complete';
  currentModuleIndex: number;
  currentModuleStep: number;
}

interface OnboardingContextType {
  state: OnboardingState;
  isOnboardingActive: boolean;
  startTour: () => void;
  skipTour: () => void;
  nextModule: () => void;
  enterModule: () => void;
  exitModule: () => void;
  nextModuleStep: () => void;
  completeTour: () => void;
  getModuleSteps: (moduleKey: string) => ModuleStep[];
}

export interface ModuleStep {
  title: string;
  description: string;
  targetId?: string;
}

const STORAGE_KEY = "hub_onboarding_progress";
const COMPLETE_KEY = "hub_onboarding_complete";

// Module definitions with their in-page tour steps
export const ONBOARDING_MODULES = [
  {
    key: "training",
    name: "Mes entraînements",
    description: "Accède à tes séances personnalisées et suis ta progression semaine après semaine.",
    path: "/training",
    steps: [
      { title: "Ta semaine d'entraînement", description: "Ici tu vois tes séances de la semaine avec ta progression." },
      { title: "Démarre une séance", description: "Clique sur une séance pour la commencer. Chaque exercice est adapté à ton niveau." },
      { title: "Suivi de progression", description: "Tu peux voir tes graphiques de progression en bas de page." },
    ],
  },
  {
    key: "nutrition",
    name: "Ma nutrition",
    description: "Consulte ton plan alimentaire, génère des repas et suis ton hydratation.",
    path: "/nutrition",
    steps: [
      { title: "Tes calculs nutritionnels", description: "Ton IMC, BMR, TDEE et objectif calorique calculés automatiquement." },
      { title: "Générateur de repas", description: "Génère un repas healthy en 30 secondes, adapté à tes goûts." },
      { title: "Hydratation & suivi", description: "Suis ton hydratation quotidienne et tes métriques corporelles." },
    ],
  },
  {
    key: "alex",
    name: "Alex",
    description: "Ton coach sportif IA disponible 24/7 pour répondre à toutes tes questions.",
    path: "/coach/alex",
    steps: [
      { title: "Ton coach sportif", description: "Alex est ton coach personnel. Pose-lui toutes tes questions sur l'entraînement." },
      { title: "Raccourcis rapides", description: "Utilise les raccourcis pour des demandes fréquentes comme simplifier une séance." },
    ],
  },
  {
    key: "julie",
    name: "Julie",
    description: "Ta nutritionniste IA pour t'aider dans ton alimentation au quotidien.",
    path: "/coach/julie",
    steps: [
      { title: "Ta nutritionniste", description: "Julie répond à toutes tes questions sur la nutrition et l'alimentation." },
      { title: "Conseils personnalisés", description: "Elle connaît ton profil et peut générer des plans repas adaptés." },
    ],
  },
];

const initialState: OnboardingState = {
  phase: 'intro',
  currentModuleIndex: 0,
  currentModuleStep: 0,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    // Check if onboarding is complete
    const isComplete = localStorage.getItem(COMPLETE_KEY);
    if (isComplete) {
      return { ...initialState, phase: 'complete' };
    }
    // Try to restore progress
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  const isOnboardingActive = state.phase !== 'complete' && state.phase !== 'intro';

  // Persist state changes
  useEffect(() => {
    if (state.phase !== 'complete') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const startTour = () => {
    setState({ phase: 'hub-spotlight', currentModuleIndex: 0, currentModuleStep: 0 });
  };

  const skipTour = () => {
    localStorage.setItem(COMPLETE_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...initialState, phase: 'complete' });
  };

  const enterModule = () => {
    setState(prev => ({ ...prev, phase: 'in-module', currentModuleStep: 0 }));
  };

  const exitModule = () => {
    setState(prev => ({ ...prev, phase: 'hub-spotlight' }));
  };

  const nextModule = () => {
    setState(prev => {
      const nextIndex = prev.currentModuleIndex + 1;
      if (nextIndex >= ONBOARDING_MODULES.length) {
        // Tour complete
        localStorage.setItem(COMPLETE_KEY, 'true');
        localStorage.setItem('hub_onboarding_just_completed', 'true');
        localStorage.removeItem(STORAGE_KEY);
        return { ...prev, phase: 'complete' };
      }
      return { ...prev, currentModuleIndex: nextIndex, currentModuleStep: 0, phase: 'hub-spotlight' };
    });
  };

  const nextModuleStep = () => {
    setState(prev => {
      const currentModule = ONBOARDING_MODULES[prev.currentModuleIndex];
      const nextStep = prev.currentModuleStep + 1;
      if (nextStep >= currentModule.steps.length) {
        // Module tour complete, return to hub
        return prev; // Will be handled by exitModule call
      }
      return { ...prev, currentModuleStep: nextStep };
    });
  };

  const completeTour = () => {
    localStorage.setItem(COMPLETE_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...initialState, phase: 'complete' });
  };

  const getModuleSteps = (moduleKey: string): ModuleStep[] => {
    const module = ONBOARDING_MODULES.find(m => m.key === moduleKey);
    return module?.steps || [];
  };

  return (
    <OnboardingContext.Provider value={{
      state,
      isOnboardingActive,
      startTour,
      skipTour,
      nextModule,
      enterModule,
      exitModule,
      nextModuleStep,
      completeTour,
      getModuleSteps,
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
