import { useState, useEffect } from "react";
import { Dumbbell, ChevronLeft, ChevronRight, Home, Settings as SettingsIcon, Calendar, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { SessionPreviewCard } from "@/components/training/SessionPreviewCard";
import { useWeeklyTraining } from "@/hooks/useWeeklyTraining";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Training = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    getProgressPercentage,
    canGenerateWeek,
    historicalPrograms,
  } = useWeeklyTraining();

  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);

  useEffect(() => {
    const checkGeneration = async () => {
      const { allowed } = await canGenerateWeek();
      setNeedsCheckIn(!allowed && sessions.length === 0 && currentWeek === 0);
    };
    checkGeneration();
  }, [currentWeek, sessions]);

  const handleStartSession = (session: any) => {
    localStorage.setItem("currentSessionId", session.id);
    localStorage.setItem("generatedSession", JSON.stringify(session.exercises));
    navigate("/session");
  };

  const handleGenerate = async () => {
    await generateWeeklyProgram(false);
  };

  const handleRegenerate = async () => {
    setShowRegenerateDialog(false);
    await generateWeeklyProgram(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/hub" />
      
      <div className={`${isMobile ? 'pt-16 px-3' : 'pt-20 px-4'}`}>
        <div className={isMobile ? '' : 'max-w-4xl mx-auto'}>
          <div className={`${isMobile ? 'flex flex-col items-start gap-3' : 'flex items-center justify-between'} mb-6`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl backdrop-blur-xl border border-white/10">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
                Mes Entraînements
              </h1>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "icon"}
                    className={`rounded-xl border-white/10 hover:bg-white/5 ${isMobile ? 'w-full' : ''}`}
                    onClick={() => navigate('/settings/training-program')}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    {isMobile && <span className="ml-2">Modifier mes préférences</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pour modifier tes préférences (fréquence, durée), va dans Paramètres</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {needsCheckIn && (
            <Card className="p-4 mb-4 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Check-in requis</p>
                  <p className="text-xs text-muted-foreground">
                    Complète ton check-in hebdomadaire pour débloquer la génération.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={() => navigate('/weekly')}
              >
                Faire mon check-in →
              </Button>
            </Card>
          )}

          <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10 mb-6 rounded-2xl`}>
            <div className="text-center">
              <p className="font-semibold text-lg mb-2">{getWeekLabel()}</p>
              {sessions.length > 0 && (
                <div className="space-y-2">
                  <Badge variant="secondary">{getCompletedCount()}/{sessions.length} séances</Badge>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>
              )}
            </div>
          </Card>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : sessions.length > 0 ? (
            <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
              {sessions.map((session, index) => (
                <SessionPreviewCard
                  key={session.id}
                  session={session}
                  sessionNumber={index + 1}
                  onStartSession={handleStartSession}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Aucune séance cette semaine"
              description={currentWeek === 0 ? "Génère ton programme hebdomadaire" : "Cette semaine n'est pas encore générée"}
            >
              {currentWeek === 0 && !needsCheckIn && (
                <Button onClick={handleGenerate} disabled={isGenerating} className="mt-4">
                  {isGenerating ? "Génération..." : "Générer mon programme"}
                </Button>
              )}
            </EmptyState>
          )}

          {historicalPrograms.length > 0 && (
            <Card className="p-4 mt-8">
              <h3 className="text-lg font-bold mb-4">Historique des programmes</h3>
              <div className="space-y-3">
                {historicalPrograms.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(program.week_start_date), "dd MMM", { locale: fr })} - {format(new Date(program.week_end_date), "dd MMM", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {program.completed_sessions}/{program.total_sessions} séances
                      </p>
                    </div>
                    <Badge variant={program.check_in_completed ? "default" : "secondary"}>
                      {program.check_in_completed ? "✓ Check-in" : "⏳ En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer cette semaine ?</AlertDialogTitle>
            <AlertDialogDescription>Les séances non complétées seront supprimées.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>Régénérer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Training;
