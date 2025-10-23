import { Card } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyRecommendation } from "@/hooks/useWeeklyRecommendation";

export const WeeklyRecommendationCard = () => {
  const { data: recommendation, isLoading } = useWeeklyRecommendation();

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />;
  if (!recommendation) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-xl">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            Recommandation de la semaine
          </h3>
          <p className="text-base mb-3">{recommendation.message}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Raison : {recommendation.reason}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
