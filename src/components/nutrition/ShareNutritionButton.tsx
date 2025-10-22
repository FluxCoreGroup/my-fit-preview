import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ShareNutritionButtonProps = {
  targetCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

export const ShareNutritionButton = ({ targetCalories, protein, carbs, fats }: ShareNutritionButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `🎯 Mon plan nutritionnel Pulse.ai\n\n` +
      `📊 Objectif: ${targetCalories || "-"} kcal/jour\n` +
      `💪 Protéines: ${protein || "-"}g\n` +
      `🍚 Glucides: ${carbs || "-"}g\n` +
      `🥑 Lipides: ${fats || "-"}g\n\n` +
      `#PulseAI #Nutrition #Fitness`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon plan nutritionnel",
          text: shareText,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copié !",
        description: "Partage ton plan sur tes réseaux sociaux",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="w-full"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Partager mes progrès
    </Button>
  );
};
