import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dumbbell, MoreVertical, RefreshCw, ChevronLeft, ChevronRight, Play, Clock, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useWeeklyTraining } from "@/hooks/useWeeklyTraining";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Training = () => {
  const { loading, sessions, currentWeek, changeWeek, goToCurrentWeek, regenerateWeek, getWeekLabel } = useWeeklyTraining();

  const getSessionDay = (sessionDate: string) => {
    const date = new Date(sessionDate);
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return `${days[date.getDay()]} ${format(date, "dd/MM")}`;
  };

  const getSessionDuration = (exercises: any) => {
    const exercisesArray = Array.isArray(exercises) ? exercises : [];
    return exercisesArray.length * 5; // Estimate 5min per exercise
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton />
      
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Mes entraînements</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => changeWeek("prev")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold">{getWeekLabel()}</span>
              {currentWeek !== 0 && (
                <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
                  Semaine actuelle
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => changeWeek("next")}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Aucune séance cette semaine"
              description="Génère ton programme d'entraînement pour cette semaine"
              action={{ label: "Générer ma semaine", to: "/training-setup" }}
            />
          ) : (
            <>
              {/* Sessions List */}
              <div className="space-y-3 mb-6">
                {sessions.map((session, idx) => (
                  <Card key={session.id} className="p-4 bg-card/50 backdrop-blur-xl border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 rounded-full">
                            J{idx + 1}
                          </span>
                          <h3 className="font-bold">
                            {Array.isArray(session.exercises) && session.exercises[0]?.name || "Séance d'entraînement"}
                          </h3>
                          {session.completed && (
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                              Terminée
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{getSessionDay(session.session_date)}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>~{getSessionDuration(session.exercises)}min</span>
                          </div>
                          <span>{Array.isArray(session.exercises) ? session.exercises.length : 0} exercices</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!session.completed && (
                          <Button size="sm" asChild>
                            <Link to="/session">
                              <Play className="w-4 h-4 mr-1" />
                              Lancer
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Voir détails</DropdownMenuItem>
                            <DropdownMenuItem>Remplacer un exo</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Regenerate Week Button */}
              {currentWeek === 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={regenerateWeek}
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Régénérer ma semaine
                </Button>
              )}
            </>
          )}

          {/* Historique & Progression */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold">Historique</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
                <h3 className="font-bold mb-3">Dernières séances</h3>
                <p className="text-sm text-muted-foreground">Bientôt disponible</p>
              </Card>
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
                <h3 className="font-bold mb-3">Meilleures perfs</h3>
                <p className="text-sm text-muted-foreground">Bientôt disponible</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
