import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Instagram, MessageCircle } from "lucide-react";
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

  const shareText = `🔥 ${streak} jours de streak sur Pulse.ai !
💪 ${sessionsThisWeek} séances cette semaine
${weightChange !== 0 ? `⚖️ ${weightChange > 0 ? '+' : ''}${weightChange}kg de progression\n` : ''}📈 Je transforme mon corps avec l'IA

🚀 Rejoins-moi sur Pulse.ai et obtiens ton coach IA personnalisé !
👉 pulse.ai

#PulseAI #Fitness #Transformation #CoachIA`;

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    toast({
      title: "Partagé ! 🎉",
      description: "Ouverture de WhatsApp...",
    });
  };

  const shareToInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Texte copié ! 📋",
        description: "Ouvre Instagram et colle ce texte dans une story ou un post",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const shareGeneric = async () => {
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
        if ((err as Error).name !== 'AbortError') {
          console.error('Erreur partage:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copié ! 📋",
          description: "Partage-le où tu veux",
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
    <Card className="p-4 bg-primary/5 border-primary/10">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <Share2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Partage ta progression
          </p>
          <p className="text-xs text-muted-foreground">
            Invite tes amis à rejoindre Pulse.ai
          </p>
          
          <div className="flex flex-wrap gap-2 pt-1">
            <Button 
              onClick={shareToWhatsApp} 
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </Button>
            <Button 
              onClick={shareToInstagram} 
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <Instagram className="w-3.5 h-3.5 mr-1.5" />
              Instagram
            </Button>
            <Button 
              onClick={shareGeneric} 
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Autre
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
