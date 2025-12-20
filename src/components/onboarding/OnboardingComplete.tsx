import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Dumbbell, Compass } from "lucide-react";

interface OnboardingCompleteProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingComplete({ open, onClose }: OnboardingCompleteProps) {
  const navigate = useNavigate();

  const handleCreateSession = () => {
    onClose();
    navigate("/training");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-scale-in">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Tu es prêt ! 🎉</h2>
        <p className="text-muted-foreground mb-6">
          Tu connais maintenant tous les modules de Pulse.ai. Crée ta première séance d'entraînement personnalisée !
        </p>

        <div className="space-y-3">
          <Button 
            onClick={handleCreateSession}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            Créer ma première séance
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            <Compass className="w-4 h-4 mr-2" />
            Explorer le Hub d'abord
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
