import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Dumbbell, Target, Flame, CheckCircle2, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: { icon: LucideIcon; text: string }[] = [
  { icon: ClipboardList, text: "Analyse de tes objectifs..." },
  { icon: Dumbbell, text: "Sélection des exercices adaptés..." },
  { icon: Target, text: "Optimisation des séries et répétitions..." },
  { icon: Flame, text: "Ajustement de l'intensité..." },
  { icon: CheckCircle2, text: "Ta séance est prête !" }
];

const GeneratingSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation des étapes
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    // Animation de la barre de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) return prev + 2;
        return prev;
      });
    }, 300);

    // Appel à l'edge function avec retry logic
    const generateSession = async (retryCount = 0) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase.functions.invoke('generate-training-session', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (error) throw error;

        // Sauvegarder dans localStorage
        localStorage.setItem('generatedSession', JSON.stringify(data));

        // Attendre que l'animation soit terminée
        setTimeout(() => {
          navigate('/dashboard?generated=success');
        }, 15000);

      } catch (error) {
        console.error('Error generating session:', error);
        
        // Retry logic pour les erreurs de données manquantes
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isDataMissing = errorMessage.includes('DATA_MISSING');
        
        if (isDataMissing && retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}/2`);
          // Attendre 2 secondes avant de réessayer
          setTimeout(() => {
            generateSession(retryCount + 1);
          }, 2000);
          return;
        }
        
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        
        // Message d'erreur personnalisé selon le type d'erreur
        let displayMessage = "Impossible de générer ta séance. Réessaie dans quelques instants.";
        
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

        // Fallback vers une séance démo
        setTimeout(() => {
          navigate('/session');
        }, 2000);
      }
    };

    generateSession();

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
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Dumbbell className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 rounded-full animate-spin" 
               style={{ borderTopColor: 'hsl(var(--primary))' }}></div>
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Création de ta séance
          </h1>
          <p className="text-muted-foreground">
            Nous analysons tes données pour créer un entraînement parfait pour toi
          </p>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>

        {/* Étapes */}
        <div className="space-y-4 pt-4">
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
                <IconComponent className={`w-6 h-6 ${
                  index === currentStep ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  index === currentStep ? 'text-primary' : 'text-foreground'
                }`}>
                  {step.text}
                </span>
                {index < currentStep && (
                  <CheckCircle2 className="ml-auto w-5 h-5 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Message de patience */}
        <p className="text-xs text-muted-foreground pt-4 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Cela prend environ 15 secondes...
        </p>
      </div>
    </div>
  );
};

export default GeneratingSession;
