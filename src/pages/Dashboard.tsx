import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { Scale, Target, Dumbbell, Clock, Apple, Flame, Loader2, Zap, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useDashboardData } from "@/hooks/useDashboardData";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import { KPICard } from "@/components/dashboard/KPICard";
import { SessionSummaryCard } from "@/components/dashboard/SessionSummaryCard";
import { NutritionDayCard } from "@/components/dashboard/NutritionDayCard";
import { RemindersCard } from "@/components/dashboard/RemindersCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { EmptyState } from "@/components/EmptyState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const sessionGenerated = searchParams.get('generated') === 'success';
  const [progressOpen, setProgressOpen] = useState(false);
  
  useSaveOnboardingData();
  const { loading, stats, upcomingSessions, latestSession } = useDashboardData();

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero compact */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">
            Salut {user?.user_metadata?.name || 'Champion'} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Bienvenue sur ton espace d'entraînement
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
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

        {/* KPI Grid - 3 colonnes mobile, 6 desktop */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <KPICard 
                title="Poids actuel" 
                value={stats.currentWeight ? `${stats.currentWeight}kg` : "-"} 
                subtitle={stats.weightChange7d ? `${stats.weightChange7d > 0 ? '+' : ''}${stats.weightChange7d}kg (7j)` : undefined}
                icon={Scale}
                trend={stats.weightChange7d ? (stats.weightChange7d < 0 ? "down" : "up") : undefined}
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

            {/* Séance du jour - Card CTA principale */}
            {latestSession ? (
              <SessionSummaryCard session={latestSession} />
            ) : (
              <EmptyState
                icon={Zap}
                title="Aucune séance planifiée"
                description="Génère ton programme pour commencer 🚀"
                action={{ label: "Générer ma semaine", to: "/training-setup" }}
              />
            )}

            {/* Nutrition du jour */}
            <NutritionDayCard />

            {/* Rappels */}
            <RemindersCard nextCheckIn={stats.nextCheckIn} />

            {/* Actions rapides */}
            <QuickActionsCard />

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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
