import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PartyPopper, Grid3x3, Rocket, ChevronRight, ChevronLeft, X } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: PartyPopper,
    title: "Bienvenue {userName} !",
    description: "Voici ton hub d'entraînement personnalisé.",
    content: "Laisse-moi te faire un tour rapide (30 secondes)",
  },
  {
    icon: Grid3x3,
    title: "Tes modules",
    description: "Chaque carte te donne accès à une fonctionnalité :",
    content: (
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• <strong>Entraînements</strong> : tes séances personnalisées</li>
        <li>• <strong>Nutrition</strong> : ton plan alimentaire</li>
        <li>• <strong>Suivi</strong> : check-in hebdo et progression</li>
        <li>• <strong>Alex & Julie</strong> : tes coachs IA disponibles 24/7</li>
      </ul>
    ),
  },
  {
    icon: Rocket,
    title: "Prêt à commencer ?",
    description: "Tu peux revenir au hub à tout moment en cliquant sur \"Accueil\" dans le menu.",
    content: "Bonne chance pour ton aventure Pulse.ai ! 💪",
  },
];

export function WelcomeModal({ open, userName, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Étape {currentStep + 1} sur {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Passer
            </button>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-bold">
            {step.title.replace("{userName}", userName)}
          </h2>
          <p className="text-muted-foreground">{step.description}</p>
          <div className="pt-2">
            {typeof step.content === "string" ? (
              <p className="text-muted-foreground">{step.content}</p>
            ) : (
              step.content
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                C'est parti !
                <Rocket className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
