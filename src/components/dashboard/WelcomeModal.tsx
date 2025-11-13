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
    title: "Bienvenue sur ton tableau de bord !",
    description: "Voici où tout commence. Chaque module est conçu pour te guider vers tes objectifs.",
    content: "Laisse-moi te faire un tour rapide des différents modules (30 secondes)",
  },
  {
    icon: Grid3x3,
    title: "Tes entraînements personnalisés",
    description: "Accède à tes séances adaptées à ton niveau, génère de nouvelles sessions, et suis ta progression semaine après semaine.",
    content: (
      <p className="text-sm text-muted-foreground">
        Par exemple, tu peux lancer une séance maintenant ou programmer celles de la semaine. Chaque entraînement s'adapte à ton équipement et tes préférences.
      </p>
    ),
  },
  {
    icon: Rocket,
    title: "Ta nutrition sur mesure",
    description: "Consulte ton plan alimentaire, génère des repas adaptés à tes goûts, et suis ton hydratation quotidienne.",
    content: (
      <p className="text-sm text-muted-foreground">
        Tu peux générer un repas healthy en 30 secondes. Julie, ta nutritionniste IA, est aussi disponible 24/7 pour répondre à toutes tes questions.
      </p>
    ),
  },
  {
    icon: Grid3x3,
    title: "Ton check-in hebdomadaire",
    description: "Chaque semaine, fais le point sur ton poids, ton adhérence, et reçois des recommandations pour ajuster ton programme.",
    content: (
      <p className="text-sm text-muted-foreground">
        Je te recommande de faire ton premier check-in maintenant ! Ça prend 2 minutes et ça permet d'optimiser ton programme en continu.
      </p>
    ),
  },
  {
    icon: Rocket,
    title: "C'est parti ! 🚀",
    description: "Tu es prêt à commencer. N'hésite pas à explorer chaque module et à revenir ici quand tu veux.",
    content: (
      <p className="text-sm text-muted-foreground">
        Alex (coach sport) et Julie (nutritionniste) sont là pour t'aider 24/7. Pose-leur toutes tes questions !
      </p>
    ),
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
