import { Card } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Dumbbell, TrendingUp, PlayCircle, Loader2, Settings, FileText, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useDashboardData } from "@/hooks/useDashboardData";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const sessionGenerated = searchParams.get('generated') === 'success';
  
  useSaveOnboardingData();
  const { loading, stats, upcomingSessions, latestSession } = useDashboardData();

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

        {/* Quick Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.sessionsThisWeek}</div>
                  <div className="text-xs text-muted-foreground">Cette semaine</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <div className="text-xs text-muted-foreground">Total séances</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.weekStreak}</div>
                  <div className="text-xs text-muted-foreground">Semaines actives</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-xl">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground">Prochain check-in</div>
                <div className="text-lg font-bold">{stats.nextCheckIn}</div>
              </div>
            </Card>
          </div>
        )}

        {/* Prochaine séance - Card CTA principale */}
        {!loading && (
          <Link to={latestSession ? "/session" : "/training-setup"}>
            <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 backdrop-blur-xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-lg shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/20 rounded-2xl">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">
                    {latestSession ? "Lancer ma séance" : "Générer ma première séance"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {latestSession 
                      ? `${latestSession.exercises?.[0]?.name || "Ta prochaine séance"} t'attend !`
                      : "Crée ton premier entraînement personnalisé"}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Autres cards cliquables */}
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardCard
            title="Check-in hebdomadaire"
            description="Partage tes progrès et ajuste ton plan"
            icon={TrendingUp}
            to="/weekly"
            variant="secondary"
          />
          
          <DashboardCard
            title="Voir mon plan"
            description="Consulte ton programme d'entraînement"
            icon={FileText}
            to="/preview"
            variant="outline"
          />
          
          <DashboardCard
            title="Générer nouvelle séance"
            description="Crée un nouvel entraînement personnalisé"
            icon={Zap}
            to="/training-setup"
            variant="outline"
          />
          
          <DashboardCard
            title="Réglages"
            description="Modifie tes infos et préférences"
            icon={Settings}
            to="/settings"
            variant="outline"
          />
        </div>

        {/* Progress Section - Collapsible */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Ta progression</h2>
          <ProgressCharts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
