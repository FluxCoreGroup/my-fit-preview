import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Rocket } from "lucide-react";

interface OnboardingCompleteProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingComplete({ open, onClose }: OnboardingCompleteProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-scale-in">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Tour terminé ! 🎉</h2>
        <p className="text-muted-foreground mb-6">
          Tu connais maintenant tous les modules de Pulse.ai. Tu peux explorer librement et revenir quand tu veux !
        </p>

        <Button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-primary to-secondary"
          size="lg"
        >
          C'est parti !
          <Rocket className="w-5 h-5 ml-2" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
