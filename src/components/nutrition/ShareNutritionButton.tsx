import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ShareNutritionButtonProps = {
  targetCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  goalType?: string | string[];
};

export const ShareNutritionButton = ({ targetCalories, protein, carbs, fats, goalType }: ShareNutritionButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const goalLabel = Array.isArray(goalType)
    ? goalType.includes("weight-loss")
      ? "Perte de poids 🔥"
      : goalType.includes("muscle-gain")
      ? "Prise de masse 💪"
      : "Maintien & santé ⚖️"
    : typeof goalType === "string"
    ? goalType.includes("weight-loss")
      ? "Perte de poids 🔥"
      : goalType.includes("muscle-gain")
      ? "Prise de masse 💪"
      : "Maintien & santé ⚖️"
    : "Maintien & santé ⚖️";

  const shareText =
    `🥗 Mon plan nutritionnel sur Pulse.ai\n\n` +
    `🎯 Objectif : ${goalLabel}\n` +
    `📊 Calories : ${targetCalories || "-"} kcal/jour\n` +
    `💪 Protéines : ${protein || "-"}g | 🍚 Glucides : ${carbs || "-"}g | 🥑 Lipides : ${fats || "-"}g\n\n` +
    `🤖 Plan généré par mon coach IA Pulse.ai\n` +
    `👉 https://www.pulse-ai.app`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon plan nutritionnel Pulse.ai",
          text: shareText,
          url: "https://www.pulse-ai.app",
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copié !",
          description: "Colle ton plan sur tes réseaux sociaux 🚀",
        });
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {copied ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <Share2 className="w-4 h-4 mr-2" />
      )}
      {copied ? "Copié !" : "Partager mon plan"}
    </Button>
  );
};

