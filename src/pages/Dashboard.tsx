import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Dumbbell, TrendingUp, Settings, PlayCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  // Mock data - sera remplacé par des vraies données de Supabase
  const upcomingSessions = [
    { id: 1, name: "Full Body #2", date: "Aujourd'hui", time: "18:00" },
    { id: 2, name: "Upper Body", date: "Demain", time: "18:00" },
    { id: 3, name: "Lower Body", date: "Vendredi", time: "18:00" },
  ];

  const stats = {
    sessionsThisWeek: 2,
    totalSessions: 8,
    weekStreak: 3,
    nextCheckIn: "Dans 3 jours"
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Salut {user?.user_metadata?.name || 'Champion'} ! 👋
              </h1>
              <p className="text-primary-foreground/90">
                Bienvenue sur ton tableau de bord Pulse.ai
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/legal">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={signOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 gradient-primary text-primary-foreground">
            <h2 className="text-2xl font-bold mb-3">Prêt(e) pour ta séance ?</h2>
            <p className="mb-6 text-primary-foreground/90">
              Séance du jour : Full Body #2 (45 min)
            </p>
            <Link to="/session">
              <Button size="lg" variant="hero" className="w-full">
                <PlayCircle className="w-5 h-5 mr-2" />
                Lancer la séance
              </Button>
            </Link>
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

        {/* Upcoming Sessions */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Prochaines séances</h2>
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
        </Card>

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
  );
};

export default Dashboard;
