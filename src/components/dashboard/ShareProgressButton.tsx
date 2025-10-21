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
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/5 border-accent/30">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <h3 className="font-semibold">Partage ta progression</h3>
            <p className="text-xs text-muted-foreground">
              Inspire ton entourage et invite-les à rejoindre Pulse.ai
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={shareToWhatsApp}
            size="sm"
            className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white"
          >
            WhatsApp
          </Button>
          <Button 
            onClick={shareToInstagram}
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
          >
            <Instagram className="w-4 h-4 mr-1" />
            Instagram
          </Button>
          <Button 
            onClick={shareGeneric}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Autre
          </Button>
        </div>
      </div>
    </Card>
  );
};
