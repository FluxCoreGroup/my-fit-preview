import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostWorkoutShareModalProps {
  open: boolean;
  onClose: () => void;
  rpe: number;
  difficultyLabel: string;
  setsCompleted: number;
  sessionName?: string;
}

export const PostWorkoutShareModal = ({
  open,
  onClose,
  setsCompleted,
}: PostWorkoutShareModalProps) => {
  const { toast } = useToast();

  const shareText =
    `🏋️ Séance validée.\n\n` +
    `${setsCompleted} séries réalisées.\n\n` +
    `Une de plus vers l'objectif.\n` +
    `Qui s'entraîne aujourd'hui ?\n\n` +
    `👉 https://www.pulse-ai.app`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ma séance Pulse.ai",
          text: shareText,
          url: "https://www.pulse-ai.app",
        });
        onClose();
      } catch {
        // user cancelled share sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copié !",
          description: "Colle ton message sur tes réseaux sociaux 💪",
        });
        onClose();
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de copier le texte.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        withClose={false}
        className="max-w-sm bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-border/20 p-0"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-5 flex flex-col items-center gap-1 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Séance enregistrée !</DialogTitle>
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <DialogHeader>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              Partage ta progression avec ta communauté 🚀
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Preview du texte */}
          <div className="bg-muted/40 border border-border/40 rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
              Aperçu du message
            </p>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {shareText}
            </pre>
          </div>

          {/* Boutons */}
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl py-5 text-base font-semibold shadow-lg shadow-primary/20"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager ma séance
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continuer sans partager
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
