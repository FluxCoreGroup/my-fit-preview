import { useState, useEffect } from "react";
import { Dumbbell, Settings as SettingsIcon, AlertCircle, TrendingUp, ChevronDown, BarChart3 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { SessionPreviewCard } from "@/components/training/SessionPreviewCard";
import { WeeklyFeedbackModal } from "@/components/training/WeeklyFeedbackModal";
import { useWeeklyTraining } from "@/hooks/useWeeklyTraining";
import { TrainingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WeightChart } from "@/components/weekly/WeightChart";
import { AdherenceChart } from "@/components/weekly/AdherenceChart";
import { cn } from "@/lib/utils";
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
    generateWeeklyProgram,
    getWeekLabel,
    getCompletedCount,
    getProgressPercentage,
    canGenerateWeek,
    historicalPrograms,
    isWeekComplete,
    needsFeedback,
    refreshData,
  } = useWeeklyTraining();

  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);
  const [showProgression, setShowProgression] = useState(false);

  // Auto-open feedback modal when week is complete
  useEffect(() => {
    if (isWeekComplete && needsFeedback && !loading) {
      setShowFeedbackModal(true);
    }
  }, [isWeekComplete, needsFeedback, loading]);

  useEffect(() => {
    const checkGeneration = async () => {
      const { allowed } = await canGenerateWeek();
      setNeedsCheckIn(!allowed && sessions.length === 0 && currentWeek === 0);
    };
    checkGeneration();
  }, [currentWeek, sessions, canGenerateWeek]);

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

  const handleFeedbackComplete = async () => {
    setShowFeedbackModal(false);
    // Auto-generate next week after feedback
    await generateWeeklyProgram(false);
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

          {/* Week complete banner */}
          {isWeekComplete && !needsFeedback && (
            <Card className="p-4 mb-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Bravo, semaine complétée ! 🎉</p>
                  <p className="text-xs text-muted-foreground">
                    Tu as terminé toutes tes séances. Continue sur cette lancée !
                  </p>
                </div>
              </div>
            </Card>
          )}

          {needsCheckIn && (
            <Card className="p-4 mb-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Check-in hebdomadaire requis</p>
                  <p className="text-xs text-muted-foreground">
                    2 minutes pour faire le point et débloquer ta prochaine semaine d'entraînement.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20"
                onClick={() => setShowFeedbackModal(true)}
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
            <TrainingSkeleton />
          ) : sessions.length > 0 ? (
            <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
              {sessions.map((session, index) => (
                <SessionPreviewCard
                  key={session.id}
                  session={session}
                  sessionNumber={index + 1}
                  onStartSession={() => handleStartSession(session)}
                />
              ))}
            </div>
          ) : (
            <>
              <EmptyState 
                icon={Dumbbell}
                title="Aucune séance cette semaine"
                description={currentWeek === 0 ? "Génère ton programme hebdomadaire pour commencer tes entraînements" : "Cette semaine n'a pas encore été générée"}
              />
              {currentWeek === 0 && !needsCheckIn && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating} 
                    size={isMobile ? "default" : "lg"}
                    className="rounded-xl bg-gradient-to-r from-primary to-secondary"
                  >
                    {isGenerating ? "Génération..." : "Générer mon programme"}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Section Progression */}
          <Collapsible open={showProgression} onOpenChange={setShowProgression} className="mt-6">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between rounded-xl border-white/10"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Voir ma progression</span>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  showProgression && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <WeightChart />
              <AdherenceChart />
            </CollapsibleContent>
          </Collapsible>

          {historicalPrograms.length > 0 && (
            <Card className="p-4 mt-6">
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

      {/* Weekly Feedback Modal */}
      <WeeklyFeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onComplete={handleFeedbackComplete}
      />

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
