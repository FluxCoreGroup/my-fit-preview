import { useState, useEffect } from "react";
import {
  Dumbbell,
  Settings as SettingsIcon,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  BarChart3,
  Loader2,
  Sparkles,
  Brain,
  Target,
  Check,
  Zap,
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Wait for data to be fully loaded before showing content
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
    setIsReady(false);
  }, [loading]);

  const generatingSteps = [
    {
      icon: Brain,
      text: "Analyse de ton profil et objectifs",
      subtext: "Récupération de tes données...",
    },
    {
      icon: Target,
      text: "Sélection des meilleurs exercices",
      subtext: "Adaptation à ton niveau...",
    },
    {
      icon: Sparkles,
      text: "Personnalisation intelligente",
      subtext: "Optimisation des séries et répétitions...",
    },
    {
      icon: Dumbbell,
      text: "Création de tes séances sur mesure",
      subtext: "Finalisation du programme...",
    },
  ];

  // Animate progress when generating
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingProgress(0);
      setGeneratingStep(0);
      setCompletedSteps([]);
      return;
    }

    const progressInterval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 300);

    // Move to next step and mark previous as completed
    const stepInterval = setInterval(() => {
      setGeneratingStep((prev) => {
        const next = prev + 1;
        if (next < generatingSteps.length) {
          setCompletedSteps((completed) => [...completed, prev]);
          return next;
        }
        return prev;
      });
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isGenerating]);

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
    // Refresh data to show newly generated sessions
    await refreshData();
  };

  const CurrentStepIcon = generatingSteps[generatingStep]?.icon || Brain;

  // Show skeleton while loading
  if (!isReady && loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <BackButton to="/hub" />
        <div className={`${isMobile ? "pt-16 px-3" : "pt-20 px-4"}`}>
          <div className={isMobile ? "" : "max-w-4xl mx-auto"}>
            <TrainingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background pb-24 transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Enhanced Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          <Card className="relative p-8 text-center max-w-md w-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border-white/10 shadow-2xl">
            {/* Floating icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <CurrentStepIcon className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold max-w-fit text-center mb-">
              Création de ton programme
            </h3>

            <p className="text-muted-foreground text-sm mb-8">
              L'IA analyse tes objectifs pour créer le programme parfait
            </p>

            {/* Steps list */}
            <div className="space-y-3 mb-8 text-left">
              {generatingSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = completedSteps.includes(idx);
                const isCurrent = idx === generatingStep;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
                      isCompleted && "bg-primary/10",
                      isCurrent && "bg-primary/5 ring-1 ring-primary/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <StepIcon
                          className={cn(
                            "w-4 h-4",
                            isCurrent && "animate-pulse",
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isCompleted && "text-primary",
                          isCurrent && "text-foreground",
                          !isCompleted && !isCurrent && "text-muted-foreground",
                        )}
                      >
                        {step.text}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground animate-pulse">
                          {step.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={generatingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Quelques secondes...
              </p>
            </div>
          </Card>
        </div>
      )}

      <BackButton to="/hub" />

      <div className={`${isMobile ? "pt-16 px-3" : "pt-20 px-4"}`}>
        <div className={isMobile ? "" : "max-w-4xl mx-auto"}>
          <div
            className={`${isMobile ? "flex flex-col items-start gap-3" : "flex items-center justify-between"} mb-6`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl backdrop-blur-xl border border-white/10">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <h1
                className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}
              >
                Mes Entraînements
              </h1>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size={isMobile ? "default" : "icon"}
                    className={`rounded-xl border-white/10 hover:bg-white/5 ${isMobile ? "w-full" : ""}`}
                    onClick={() => navigate("/settings/training-program")}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    {isMobile && (
                      <span className="ml-2">Modifier mes préférences</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Pour modifier tes préférences (fréquence, durée), va dans
                    Paramètres
                  </p>
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
                  <p className="font-semibold text-sm">
                    Bravo, semaine complétée ! 🎉
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tu as terminé toutes tes séances. Continue sur cette lancée
                    !
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
                  <p className="font-semibold text-sm">
                    Check-in hebdomadaire requis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 minutes pour faire le point et débloquer ta prochaine
                    semaine d'entraînement.
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

          {/* Week Progress Card - Simplified */}
          <Card
            className={`${isMobile ? "p-4" : "p-5"} bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10 mb-6 rounded-2xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{getWeekLabel()}</p>
              {sessions.length > 0 && (
                <Badge variant="secondary">
                  {getCompletedCount()}/{sessions.length}
                </Badge>
              )}
            </div>
            {sessions.length > 0 && (
              <Progress value={getProgressPercentage()} className="h-2" />
            )}
          </Card>

          {loading ? (
            <TrainingSkeleton />
          ) : sessions.length > 0 ? (
            <div className={isMobile ? "space-y-3" : "space-y-4"}>
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
                description={
                  currentWeek === 0
                    ? "Génère ton programme hebdomadaire pour commencer tes entraînements"
                    : "Cette semaine n'a pas encore été générée"
                }
              />
              {currentWeek === 0 && !needsCheckIn && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">
                        Génération de ton programme...
                      </p>
                    </>
                  ) : (
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      size={isMobile ? "default" : "lg"}
                      className="rounded-xl bg-gradient-to-r from-primary to-secondary"
                    >
                      Générer mon programme
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Section Progression - Now includes history */}
          <Collapsible
            open={showProgression}
            onOpenChange={setShowProgression}
            className="mt-6"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl border-white/10"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Progression & Historique</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    showProgression && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <WeightChart />
              <AdherenceChart />

              {/* Historical Programs - Now inside collapsible */}
              {historicalPrograms.length > 0 && (
                <Card className="p-4 bg-card/50 border-white/10">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Historique
                  </h3>
                  <div className="space-y-2">
                    {historicalPrograms.slice(0, 4).map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-2 bg-card/30 rounded-lg text-sm"
                      >
                        <span>
                          {format(new Date(program.week_start_date), "dd MMM", {
                            locale: fr,
                          })}{" "}
                          -{" "}
                          {format(new Date(program.week_end_date), "dd MMM", {
                            locale: fr,
                          })}
                        </span>
                        <span className="text-muted-foreground">
                          {program.completed_sessions}/{program.total_sessions}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Weekly Feedback Modal */}
      <WeeklyFeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onComplete={handleFeedbackComplete}
      />

      <AlertDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer cette semaine ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les séances non complétées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Training;
