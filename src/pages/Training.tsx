import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  TrendingUp,
  Target,
  Trophy,
  Settings
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { TrainingSkeleton } from "@/components/LoadingSkeleton";
import { useWeeklyTraining } from "@/hooks/useWeeklyTraining";
import { useNavigate } from "react-router-dom";
import { SessionPreviewCard } from "@/components/training/SessionPreviewCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Training = () => {
  const navigate = useNavigate();
  const { 
    loading, 
    isGenerating,
    sessions, 
    currentWeek, 
    changeWeek, 
    goToCurrentWeek, 
    generateWeeklyProgram,
    getWeekLabel,
    getCompletedCount,
    getProgressPercentage
  } = useWeeklyTraining();

  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  const handleStartSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      localStorage.setItem("currentSessionId", sessionId);
      localStorage.setItem("generatedSession", JSON.stringify(session.exercises));
      navigate("/session");
    }
  };

  const handleGenerate = async () => {
    await generateWeeklyProgram(false);
  };

  const handleRegenerate = async () => {
    setShowRegenerateDialog(false);
    await generateWeeklyProgram(true);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-20 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mes entraînements</h1>
              <p className="text-sm text-muted-foreground">Programme de la semaine</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  Pour modifier tes préférences (fréquence, durée, objectifs), va dans Paramètres
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Week Navigation & Stats */}
          <Card className="p-4 mb-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeWeek("prev")}
                disabled={isGenerating}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-bold mb-1">{getWeekLabel()}</h2>
                {sessions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getCompletedCount()}/{sessions.length} séances complétées</span>
                    <Badge variant="secondary" className="text-xs">
                      {getProgressPercentage()}%
                    </Badge>
                  </div>
                )}
                {currentWeek !== 0 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={goToCurrentWeek}
                    className="mt-1"
                  >
                    Retour à aujourd'hui
                  </Button>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeWeek("next")}
                disabled={isGenerating}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Progress Bar */}
            {sessions.length > 0 && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}
          </Card>

          {loading ? (
            <TrainingSkeleton />
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <EmptyState
                icon={Dumbbell}
                title={currentWeek === 0 ? "Aucun programme cette semaine" : "Aucune séance trouvée"}
                description={
                  currentWeek === 0 
                    ? "Génère ton programme d'entraînement personnalisé pour commencer !" 
                    : currentWeek > 0 
                    ? "Cette semaine n'a pas encore été programmée. Concentre-toi d'abord sur la semaine actuelle."
                    : "Explore les semaines précédentes pour voir ton historique."
                }
              />
              {currentWeek === 0 && (
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="mt-6 bg-gradient-to-r from-primary to-secondary"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Générer mon programme
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Sessions List */}
              <div className="space-y-4 mb-6">
                {sessions.map((session, idx) => (
                  <SessionPreviewCard
                    key={session.id}
                    session={session}
                    sessionNumber={idx + 1}
                    onStartSession={() => handleStartSession(session.id)}
                  />
                ))}
              </div>

              {/* Quick Actions */}
              {currentWeek === 0 && (
                <div className="mb-8">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 hover:bg-primary/5"
                    onClick={() => setShowRegenerateDialog(true)}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`mr-2 w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Régénérer cette semaine
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mini Stats */}
          {sessions.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-card/50 backdrop-blur-xl border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{getCompletedCount()}</p>
                    <p className="text-xs text-muted-foreground">Séances ce mois</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur-xl border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">Objectif hebdo</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-secondary/10 to-card/50 backdrop-blur-xl border-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{getProgressPercentage()}%</p>
                    <p className="text-xs text-muted-foreground">Progression</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer cette semaine ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va supprimer toutes les séances non complétées de cette semaine et en générer de nouvelles.
              Les séances déjà terminées seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} className="bg-gradient-to-r from-primary to-secondary">
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Training;
