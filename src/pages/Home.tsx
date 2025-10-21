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
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* Success Messages */}
        {subscriptionSuccess && (
          <Card className="p-4 bg-accent/10 border-accent rounded-2xl">
            <h2 className="text-lg font-bold mb-1">🎉 Bienvenue dans Pulse.ai Premium !</h2>
            <p className="text-sm text-muted-foreground">
              Ton abonnement est activé. Tu as maintenant accès à toutes les fonctionnalités !
            </p>
          </Card>
        )}
        
        {sessionGenerated && (
          <Card className="p-4 bg-primary/10 border-primary rounded-2xl">
            <h2 className="text-lg font-bold mb-1">✨ Ta séance est prête !</h2>
            <p className="text-sm text-muted-foreground">
              Ton programme d'entraînement personnalisé vient d'être généré. Lance-toi quand tu veux !
            </p>
          </Card>
        )}

        {hasNoData ? (
          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">🎉 Bienvenue sur Pulse.ai !</h2>
            <p className="text-muted-foreground mb-6">
              Tu es à un clic de transformer ton corps avec l'IA
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  1
                </div>
                <span>Retourne au Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  2
                </div>
                <span>Clique sur "Entraînements"</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  3
                </div>
                <span>Génère ta première séance 🚀</span>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Citation du jour */}
            <QuoteOfTheDay />

            {/* KPIs avec sparklines */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
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
                variant="primary"
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
                variant="secondary"
              />
              <KPICard 
                title="Streak" 
                value={stats.activeStreak}
                subtitle="jours"
                icon={Flame}
                variant="accent"
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

            {/* Séance du jour - Card CTA principale */}
            {latestSession ? (
              <SessionSummaryCard session={latestSession} />
            ) : (
              <Card className="p-6 border-dashed border-2">
                <div className="text-center space-y-3">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">Pas de séance planifiée</h3>
                  <p className="text-sm text-muted-foreground">
                    Retourne au Hub → Entraînements pour générer ta semaine d'entraînement personnalisée 💪
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
            <Collapsible open={progressOpen} onOpenChange={setProgressOpen} className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                  <h2 className="text-xl font-semibold">Ta progression (12 dernières semaines)</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${progressOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
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
