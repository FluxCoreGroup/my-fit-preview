import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Scale, Target, Dumbbell, Clock, Apple, Flame, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useDashboardData } from "@/hooks/useDashboardData";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import { KPICard } from "@/components/dashboard/KPICard";
import { SessionSummaryCard } from "@/components/dashboard/SessionSummaryCard";
import { NutritionDayCard } from "@/components/dashboard/NutritionDayCard";
import { RemindersCard } from "@/components/dashboard/RemindersCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { AdjustmentsJournal } from "@/components/dashboard/AdjustmentsJournal";
import { EmptyState } from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const sessionGenerated = searchParams.get('generated') === 'success';
  const [progressOpen, setProgressOpen] = useState(false);
  
  useSaveOnboardingData();
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
      <div className="min-h-screen bg-background pb-24">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="px-4 pt-20 pb-6">
          <div className="max-w-6xl mx-auto">
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="px-4 pt-20 pb-6">
          <div className="max-w-6xl mx-auto">
            <EmptyState
              icon={AlertCircle}
              title="Erreur de chargement"
              description={error}
              action={{ label: "Réessayer", to: "/dashboard" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="max-w-6xl mx-auto px-4 pt-16 space-y-6">
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
          <EmptyState
            icon={Dumbbell}
            title="Bienvenue sur ton tableau de bord"
            description="Commence par générer ton premier programme d'entraînement pour voir tes statistiques"
            action={{ label: "Créer mon programme", to: "/training-setup" }}
          />
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
