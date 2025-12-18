import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Dumbbell, Target, Calendar, CheckCircle2, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: { icon: LucideIcon; text: string }[] = [
  { icon: ClipboardList, text: "Analyse de tes objectifs..." },
  { icon: Calendar, text: "Planification de ta semaine..." },
  { icon: Dumbbell, text: "Création des séances personnalisées..." },
  { icon: Target, text: "Optimisation du programme..." },
  { icon: CheckCircle2, text: "Ton programme est prêt !" }
];

const MIN_DISPLAY_TIME = 3000; // Minimum 3 seconds for UX

const GeneratingSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Animation des étapes - plus rapide (800ms au lieu de 3000ms)
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    // Animation de la barre de progression - plus rapide
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 95) return prev + 5;
        return prev;
      });
    }, 150);

    // Appel à l'edge function pour générer le programme hebdomadaire
    const generateWeeklyProgram = async (retryCount = 0) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase.functions.invoke('generate-weekly-program', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (error) throw error;

        console.log('✅ Programme hebdomadaire généré:', data);

        // Calculer le temps restant pour atteindre le minimum
        const elapsed = Date.now() - startTimeRef.current;
        const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);

        // Finaliser la progression
        setProgress(100);
        setCurrentStep(steps.length - 1);
        setIsComplete(true);

        // Naviguer après le délai minimum
        setTimeout(() => {
          navigate('/hub');
        }, remainingTime + 500); // +500ms pour voir le "100%"

      } catch (error) {
        console.error('Error generating weekly program:', error);
        
        // Retry logic pour les erreurs de données manquantes
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isDataMissing = errorMessage.includes('DATA_MISSING');
        
        if (isDataMissing && retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}/2`);
          setTimeout(() => {
            generateWeeklyProgram(retryCount + 1);
          }, 1000);
          return;
        }
        
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        
        // Message d'erreur personnalisé selon le type d'erreur
        let displayMessage = "Impossible de générer ton programme. Réessaie dans quelques instants.";
        
        if (error instanceof Error) {
          if (error.message.includes('DATA_MISSING:goals')) {
            displayMessage = "Tes données personnelles sont incomplètes. Retourne au questionnaire d'onboarding.";
          } else if (error.message.includes('DATA_MISSING:prefs')) {
            displayMessage = "Configure d'abord tes préférences d'entraînement.";
          } else if (error.message.includes('Données personnelles incomplètes')) {
            displayMessage = "Tes données personnelles sont incomplètes. Retourne au questionnaire d'onboarding.";
          } else if (error.message.includes('Préférences d\'entraînement manquantes')) {
            displayMessage = "Configure d'abord tes préférences d'entraînement.";
          } else if (error.message.includes('User not authenticated')) {
            displayMessage = "Tu n'es pas connecté. Connecte-toi d'abord.";
            setTimeout(() => navigate('/auth'), 2000);
            return;
          }
        }
        
        toast({
          title: "Erreur de génération",
          description: displayMessage,
          variant: "destructive"
        });

        // Fallback vers hub
        setTimeout(() => {
          navigate('/hub');
        }, 2000);
      }
    };

    generateWeeklyProgram();

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo animé */}
        <div className="relative">
          <div className={`w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center ${!isComplete ? 'animate-pulse' : ''}`}>
            <Dumbbell className={`w-12 h-12 ${isComplete ? 'text-green-500' : 'text-primary'}`} />
          </div>
          {!isComplete && (
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 rounded-full animate-spin" 
                 style={{ borderTopColor: 'hsl(var(--primary))' }}></div>
          )}
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isComplete ? "C'est prêt !" : "Création de ton programme"}
          </h1>
          <p className="text-muted-foreground">
            {isComplete ? "Redirection vers ton hub..." : "Nous analysons tes données pour créer ton programme personnalisé"}
          </p>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ease-out ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-primary/80'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>

        {/* Étapes */}
        <div className="space-y-3 pt-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary/10 scale-105'
                    : index < currentStep
                    ? 'bg-secondary/50 opacity-60'
                    : 'opacity-30'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${
                  index === currentStep ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  index === currentStep ? 'text-primary' : 'text-foreground'
                }`}>
                  {step.text}
                </span>
                {index < currentStep && (
                  <CheckCircle2 className="ml-auto w-4 h-4 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Message de patience */}
        {!isComplete && (
          <p className="text-xs text-muted-foreground pt-4 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Quelques secondes...
          </p>
        )}
      </div>
    </div>
  );
};

export default GeneratingSession;
