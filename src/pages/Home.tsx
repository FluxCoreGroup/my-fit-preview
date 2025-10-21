import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Scale, Target, Dumbbell, Clock, Apple, Flame, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import { KPICard } from "@/components/dashboard/KPICard";
import { SessionSummaryCard } from "@/components/dashboard/SessionSummaryCard";
import { NutritionDayCard } from "@/components/dashboard/NutritionDayCard";
import { RemindersCard } from "@/components/dashboard/RemindersCard";
import { AdjustmentsJournal } from "@/components/dashboard/AdjustmentsJournal";
import { EmptyState } from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteOfTheDay } from "@/components/dashboard/QuoteOfTheDay";
import { DisclaimerCard } from "@/components/dashboard/DisclaimerCard";
import { ShareProgressButton } from "@/components/dashboard/ShareProgressButton";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { BackButton } from "@/components/BackButton";

const Home = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const sessionGenerated = searchParams.get('generated') === 'success';
  const [progressOpen, setProgressOpen] = useState(false);
  
  const { loading, error, stats, upcomingSessions, latestSession } = useDashboardData();

  const { data: goals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("goals")
        .select("frequency")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const frequency = goals?.frequency || 3;
  const hasNoData = stats.totalSessions === 0 && !latestSession;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="px-4 pt-8 pb-6">
          <div className="max-w-6xl mx-auto">
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="px-4 pt-8 pb-6">
          <div className="max-w-6xl mx-auto">
            <EmptyState
              icon={AlertCircle}
              title="Erreur de chargement"
              description={error}
              action={{ label: "Réessayer", to: "/home" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <BackButton to="/hub" label="Hub" />
      <div className="max-w-4xl mx-auto px-3 pt-16 pb-6 space-y-4">
        {/* Success Messages */}
        {subscriptionSuccess && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <h2 className="text-sm font-semibold mb-0.5">Bienvenue Premium</h2>
            <p className="text-xs text-muted-foreground">
              Toutes les fonctionnalités sont activées
            </p>
          </Card>
        )}
        
        {sessionGenerated && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <h2 className="text-sm font-semibold mb-0.5">Séance générée</h2>
            <p className="text-xs text-muted-foreground">
              Ton programme est prêt
            </p>
          </Card>
        )}

        {hasNoData ? (
          <Card className="p-6 text-center border-primary/10">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h2 className="text-lg font-semibold mb-2">Bienvenue sur Pulse.ai</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Commence ton parcours de transformation
            </p>
            <div className="space-y-2 text-left max-w-xs mx-auto text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <span className="text-muted-foreground">Retourne au Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <span className="text-muted-foreground">Clique sur "Entraînements"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <span className="text-muted-foreground">Génère ta première séance</span>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Citation du jour */}
            <QuoteOfTheDay />

            {/* KPIs avec sparklines */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <KPICard 
                title="Poids actuel" 
                value={stats.currentWeight ? `${stats.currentWeight}kg` : "-"} 
                subtitle={stats.weightChange7d ? `${stats.weightChange7d > 0 ? '+' : ''}${stats.weightChange7d}kg (7j)` : undefined}
                icon={Scale}
                trend={stats.weightChange7d ? (stats.weightChange7d < 0 ? "down" : "up") : undefined}
                sparklineData={stats.weightSparkline}
              />
              <KPICard 
                title="Objectif" 
                value={stats.goalWeight ? `${stats.goalWeight}kg` : "-"} 
                subtitle={stats.weeksToGoal ? `${stats.weeksToGoal} sem.` : undefined}
                icon={Target}
              />
              <KPICard 
                title="Séances / sem" 
                value={`${stats.sessionsThisWeek}/${frequency}`}
                icon={Dumbbell}
              />
              <KPICard 
                title="Minutes (7j)" 
                value={stats.trainingMinutes7d}
                icon={Clock}
                sparklineData={stats.trainingMinutesSparkline}
              />
              <KPICard 
                title="Adhérence diet" 
                value={stats.nutritionAdherence ? `${stats.nutritionAdherence}%` : "-"}
                icon={Apple}
              />
              <KPICard 
                title="Streak" 
                value={stats.activeStreak}
                subtitle="jours"
                icon={Flame}
              />
            </div>

            {/* Leaderboard */}
            <LeaderboardCard />

            {/* Partage progression */}
            <ShareProgressButton 
              streak={stats.activeStreak}
              sessionsThisWeek={stats.sessionsThisWeek}
              weightChange={stats.weightChange7d || 0}
            />

            {/* Séance du jour */}
            {latestSession ? (
              <SessionSummaryCard session={latestSession} />
            ) : (
              <Card className="p-4 border-dashed">
                <div className="text-center space-y-2">
                  <Zap className="w-10 h-10 mx-auto text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Pas de séance planifiée</h3>
                  <p className="text-xs text-muted-foreground">
                    Retourne au Hub → Entraînements pour générer ta semaine
                  </p>
                </div>
              </Card>
            )}

            {/* Nutrition du jour */}
            <NutritionDayCard />

            {/* Rappels */}
            <RemindersCard nextCheckIn={stats.nextCheckIn} />

            {/* Journal des ajustements */}
            <AdjustmentsJournal />

            {/* Progress Section - Collapsible */}
            <Collapsible open={progressOpen} onOpenChange={setProgressOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-0 py-2 h-auto hover:bg-transparent">
                  <h3 className="text-sm font-semibold">Progression (12 semaines)</h3>
                  <ChevronDown className={`w-4 h-4 transition-transform ${progressOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ProgressCharts />
              </CollapsibleContent>
            </Collapsible>

            {/* Disclaimer médical */}
            <DisclaimerCard />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
