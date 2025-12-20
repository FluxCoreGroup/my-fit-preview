import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Compass, Rocket, X } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  userName: string;
  onComplete: () => void;
  onStartTour: () => void;
  onSkipTour: () => void;
}

export function WelcomeModal({ open, userName, onComplete, onStartTour, onSkipTour }: WelcomeModalProps) {
  const handleSkip = () => {
    onSkipTour();
    onComplete();
  };

  const handleStartTour = () => {
    onComplete();
    onStartTour();
  };

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-scale-in">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-6">
          <h2 className="text-2xl font-bold">
            Bienvenue {userName} ! 👋
          </h2>
          <p className="text-muted-foreground">
            Ton espace fitness personnalisé est prêt. Laisse-moi te faire découvrir chaque module.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleStartTour}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            <Compass className="w-5 h-5 mr-2" />
            Commencer le tour guidé
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Je connais déjà, explorer seul
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
