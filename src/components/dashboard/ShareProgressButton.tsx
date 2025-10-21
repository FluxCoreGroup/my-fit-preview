import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareProgressButtonProps {
  streak?: number;
  sessionsThisWeek?: number;
  weightChange?: number;
}

export const ShareProgressButton = ({ 
  streak = 0, 
  sessionsThisWeek = 0, 
  weightChange = 0 
}: ShareProgressButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `🔥 ${streak} jours de streak sur Pulse.ai !\n💪 ${sessionsThisWeek} séances cette semaine\n${weightChange !== 0 ? `⚖️ ${weightChange > 0 ? '+' : ''}${weightChange}kg de progression\n` : ''}📈 Continue de suivre ma progression !`;

    // Si l'API Web Share est disponible (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ma progression Pulse.ai",
          text: shareText,
        });
        toast({
          title: "Partagé ! 🎉",
          description: "Ta progression a été partagée",
        });
      } catch (err) {
        // L'utilisateur a annulé le partage
        if ((err as Error).name !== 'AbortError') {
          console.error('Erreur partage:', err);
        }
      }
    } else {
      // Fallback : copier dans le presse-papier
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copié ! 📋",
          description: "Texte copié dans le presse-papier, colle-le sur Instagram",
        });
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le texte",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/5 border-accent/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Partage ta progression
          </h3>
          <p className="text-xs text-muted-foreground">
            Inspire ton entourage avec tes résultats
          </p>
        </div>
        <Button 
          onClick={handleShare}
          size="sm"
          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 shrink-0"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>
    </Card>
  );
};
