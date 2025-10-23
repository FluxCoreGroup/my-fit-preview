import { BackButton } from "@/components/BackButton";
import { LineChart as LineChartIcon } from "lucide-react";
import { WeeklyRecommendationCard } from "@/components/weekly/WeeklyRecommendationCard";
import { WeightChart } from "@/components/weekly/WeightChart";
import { AdherenceChart } from "@/components/weekly/AdherenceChart";
import { NextCheckInCTA } from "@/components/weekly/NextCheckInCTA";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWeeklyCheckInStatus } from "@/hooks/useWeeklyCheckInStatus";

const Progression = () => {
  const navigate = useNavigate();
  const { hasCheckInThisWeek, isLoading } = useWeeklyCheckInStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasCheckInThisWeek) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <EmptyState
            icon={LineChartIcon}
            title="Aucun check-in"
            description="Fais ton premier check-in pour débloquer ta progression"
            action={{
              label: "Faire mon check-in",
              onClick: () => navigate("/weekly"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-20 px-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <LineChartIcon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Ma progression</h1>
        </div>

        <WeeklyRecommendationCard />
        <WeightChart />
        <AdherenceChart />
        <NextCheckInCTA />
      </div>
    </div>
  );
};

export default Progression;
