import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Dumbbell, TrendingUp, PlayCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const sessionGenerated = searchParams.get('generated') === 'success';
  
  useSaveOnboardingData();
  const { loading, stats, upcomingSessions, latestSession } = useDashboardData();

  return (
    <>
      <Header variant="app" />
      <div className="min-h-screen bg-muted/30 pt-16">
      {/* Hero Section */}
      <div className="gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Salut {user?.user_metadata?.name || 'Champion'} ! 👋
          </h1>
          <p className="text-primary-foreground/90">
            Bienvenue sur ton tableau de bord Pulse.ai
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Success Messages */}
        {subscriptionSuccess && (
          <Card className="p-6 bg-accent/10 border-accent">
            <h2 className="text-xl font-bold mb-2">🎉 Bienvenue dans Pulse.ai Premium !</h2>
            <p className="text-muted-foreground">
              Ton abonnement est activé. Tu as maintenant accès à toutes les fonctionnalités !
            </p>
          </Card>
        )}
        
        {sessionGenerated && (
          <Card className="p-6 bg-primary/10 border-primary">
            <h2 className="text-xl font-bold mb-2">✨ Ta séance est prête !</h2>
            <p className="text-muted-foreground">
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
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.sessionsThisWeek}</div>
                  <div className="text-sm text-muted-foreground">Cette semaine</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total séances</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.weekStreak}</div>
                  <div className="text-sm text-muted-foreground">Semaines actives</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Prochain check-in</div>
                <div className="text-xl font-bold">{stats.nextCheckIn}</div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 gradient-primary text-primary-foreground">
              <h2 className="text-2xl font-bold mb-3">Prêt(e) pour ta séance ?</h2>
              {latestSession ? (
                <>
                  <p className="mb-6 text-primary-foreground/90">
                    {latestSession.exercises?.[0]?.name || "Ta prochaine séance"} t'attend !
                  </p>
                  <Link to="/session">
                    <Button size="lg" variant="hero" className="w-full">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Lancer la séance
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="mb-6 text-primary-foreground/90">
                    Tu n'as pas encore de séance. Génère ton premier entraînement !
                  </p>
                  <Link to="/training-setup">
                    <Button size="lg" variant="hero" className="w-full">
                      <Dumbbell className="w-5 h-5 mr-2" />
                      Générer ma séance
                    </Button>
                  </Link>
                </>
              )}
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-3">Mettre à jour mon plan</h2>
              <p className="mb-6 text-muted-foreground">
                Objectif changé ? Nouveau matériel ? Ajuste ton programme en quelques clics.
              </p>
              <Link to="/start">
                <Button size="lg" variant="outline" className="w-full">
                  Modifier mes infos
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Upcoming Sessions */}
        {!loading && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Prochaines séances</h2>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{session.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.date} • {session.time}
                        </div>
                      </div>
                    </div>
                    <Link to="/session">
                      <Button variant="ghost">
                        Voir
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune séance à venir.</p>
                <p className="text-sm mt-2">Génère ta première séance pour commencer !</p>
              </div>
            )}
          </Card>
        )}

        {/* Progress Section (Placeholder) */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Ta progression</h2>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Tes graphiques de progression s'afficheront ici.</p>
            <p className="text-sm mt-2">Continue tes séances et check-ins pour voir ton évolution !</p>
          </div>
        </Card>

      {/* Quick Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/weekly">
            <Button variant="outline">Check-in hebdomadaire</Button>
          </Link>
          <Link to="/preview">
            <Button variant="outline">Voir mon plan</Button>
          </Link>
          <Link to="/support">
            <Button variant="outline">Support</Button>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
