import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type Exercise } from "@/services/planner";
import { useNavigate } from "react-router-dom";
import { Play, Pause, ChevronRight, RefreshCw, Lightbulb, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";
import { BackButton } from "@/components/BackButton";
import { SessionFeedbackModal } from "@/components/training/SessionFeedbackModal";
import { ExerciseImage } from "@/components/training/ExerciseImage";
import { ExerciseHelpDrawer } from "@/components/training/ExerciseHelpDrawer";
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

const Session = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  useSaveOnboardingData();
  const { exerciseLogs, logSet, getSuggestedWeight } = useSessionFeedback();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentRPE, setCurrentRPE] = useState(7);
  const [advancedTracking, setAdvancedTracking] = useState(false);

  // Check for first-time tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('firstSessionTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    // Load tracking preference
    const trackingPref = localStorage.getItem('advancedTracking');
    if (trackingPref) {
      setAdvancedTracking(trackingPref === 'true');
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const currentSessionId = localStorage.getItem("currentSessionId");
      
      if (currentSessionId) {
        const { data: session } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', currentSessionId)
          .eq('user_id', user.id)
          .single();
        
        if (session?.exercises) {
          // Handle both array format and object format { exercises: [], warmup: [] }
          const sessionData = session.exercises as any;
          const exercisesArray = Array.isArray(sessionData) 
            ? sessionData 
            : (sessionData.exercises || []);
          
          if (exercisesArray.length > 0) {
            setExercises(exercisesArray);
            setSessionId(session.id);
            return;
          }
        }
      }

      const { data: lastSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (lastSession?.exercises) {
        // Handle both array format and object format { exercises: [], warmup: [] }
        const sessionData = lastSession.exercises as any;
        const exercisesArray = Array.isArray(sessionData) 
          ? sessionData 
          : (sessionData.exercises || []);
        
        if (exercisesArray.length > 0) {
          setExercises(exercisesArray);
          setSessionId(lastSession.id);
          return;
        }
      }
      navigate("/training");
    };

    loadSession();
  }, [navigate, user]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isResting) {
      setIsResting(false);
      setIsPaused(true);
      toast({
        title: "Temps de repos terminé !",
        description: "Prêt(e) pour la prochaine série ?",
      });
    }
  }, [timeLeft, isPaused, isResting, toast]);

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = currentExercise?.sets || 0;

  const getTotalSets = () => exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const getCompletedSets = () => {
    let completed = 0;
    for (let i = 0; i < currentExerciseIndex; i++) {
      completed += exercises[i].sets;
    }
    completed += (currentSet - 1);
    return completed;
  };
  const totalSetsAll = getTotalSets();
  const completedSetsAll = getCompletedSets();

  const startRest = () => {
    setIsResting(true);
    setTimeLeft(currentExercise.rest);
    setIsPaused(false);
  };

  const skipRest = () => {
    setIsResting(false);
    setTimeLeft(0);
    setIsPaused(true);
  };

  const handleSetComplete = async () => {
    if (advancedTracking) {
      const weight = parseFloat(currentWeight) || 0;
      if (weight > 0) {
        logSet(currentExercise.name, currentSet, weight, currentRPE);
      }
    }

    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
      setCurrentWeight("");
      startRest();
    } else {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        setCurrentWeight("");
        setCurrentRPE(7);
        
        const nextExercise = exercises[currentExerciseIndex + 1];
        const suggested = getSuggestedWeight(nextExercise.name);
        if (suggested && advancedTracking) {
          setCurrentWeight(suggested.toString());
        }
        
        toast({
          title: "Exercice terminé !",
          description: "Prends une petite pause et passe au suivant.",
        });
      } else {
        if (user && sessionId) {
          await supabase
            .from('sessions')
            .update({ completed: true })
            .eq('id', sessionId);

          const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);

          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (count === 1 && !subscription) {
            navigate("/paywall");
            return;
          }
        }
        
        setShowFeedbackModal(true);
      }
    }
  };

  const handleTrackingToggle = (enabled: boolean) => {
    setAdvancedTracking(enabled);
    localStorage.setItem('advancedTracking', enabled.toString());
  };

  const showAlternative = () => {
    toast({
      title: "Alternatives disponibles",
      description: currentExercise.alternatives.join(" • "),
      duration: 5000,
    });
  };

  const handlePauseSession = () => {
    setShowPauseDialog(false);
    navigate("/hub");
  };

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement de ta séance...</p>
          <p className="text-sm text-muted-foreground/60">
            Si le chargement persiste, retourne à l'entraînement.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/training")}
            className="mt-2"
          >
            Retour à l'entraînement
          </Button>
        </div>
      </div>
    );
  }

  const progress = totalSetsAll > 0 ? (completedSetsAll / totalSetsAll) * 100 : 0;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton label="Pause" onClick={() => setShowPauseDialog(true)} />
      
      <div className="pt-20 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Progress Bar - Simplified */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl p-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Série {completedSetsAll + 1}/{totalSetsAll}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          {/* Rest Timer - Full Focus Mode with prominent Skip */}
          {isResting && (
            <Card className="p-8 bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-xl border-secondary/20 rounded-2xl animate-fade-in">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Temps de repos</p>
                <p className="text-xs text-muted-foreground/60 mb-4">Tu peux passer dès que tu es prêt(e)</p>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - timeLeft / currentExercise.rest)}`}
                      className="text-secondary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-secondary">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                {/* Skip button - Most prominent */}
                <Button
                  onClick={skipRest}
                  size="lg"
                  className="w-full mb-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-lg py-6"
                >
                  <SkipForward className="w-6 h-6 mr-2" />
                  Passer le repos
                </Button>
                {/* Play/Pause - Secondary */}
                <Button
                  variant="ghost"
                  onClick={() => setIsPaused(!isPaused)}
                  size="sm"
                  className="text-muted-foreground"
                >
                  {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {isPaused ? "Reprendre" : "Pause"}
                </Button>
              </div>
            </Card>
          )}

          {/* Main Exercise Card - Focus Mode */}
          {!isResting && (
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl">
              {/* Exercise Image */}
              <div className="mb-4">
                <ExerciseImage 
                  exerciseName={currentExercise.name} 
                  size="lg"
                  showGif={true}
                />
              </div>

              {/* Exercise Name & Stats */}
              <h2 className="text-2xl font-bold mb-2">{currentExercise.name}</h2>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                  Série {currentSet}/{totalSets}
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full font-medium">
                  {currentExercise.reps} reps
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                  RPE {currentExercise.rpe}
                </span>
              </div>

              {/* Advanced Tracking Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl mb-4">
                <Label htmlFor="tracking" className="text-sm cursor-pointer">
                  Tracking avancé (poids + RPE)
                </Label>
                <Switch
                  id="tracking"
                  checked={advancedTracking}
                  onCheckedChange={handleTrackingToggle}
                />
              </div>

              {/* Tracking Inputs - Conditional */}
              {advancedTracking && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Poids (kg)
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      placeholder="Ex: 20"
                      className="text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      RPE ressenti
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={currentRPE}
                      onChange={(e) => setCurrentRPE(parseInt(e.target.value) || 7)}
                      className="text-center font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="lg"
                  onClick={handleSetComplete}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary rounded-xl"
                >
                  Série terminée
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowHelpDrawer(true)}
                  className="rounded-xl"
                >
                  <Lightbulb className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={showAlternative}
                  className="rounded-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Help Drawer */}
      <ExerciseHelpDrawer
        open={showHelpDrawer}
        onOpenChange={setShowHelpDrawer}
        exerciseName={currentExercise?.name || ""}
        tips={currentExercise?.tips || []}
        commonMistakes={currentExercise?.commonMistakes || []}
      />

      {/* Tutorial Dialog - Updated with skip rest info */}
      <AlertDialog open={showTutorial} onOpenChange={setShowTutorial}>
        <AlertDialogContent className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Bienvenue ! 🎯</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left pt-2">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Clique sur <strong>"Série terminée"</strong> après chaque série</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Tu peux <strong>passer le repos</strong> à tout moment</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Utilise <Lightbulb className="w-4 h-4 inline text-primary" /> pour voir les conseils</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                localStorage.setItem('firstSessionTutorial', 'seen');
                setShowTutorial(false);
              }}
              className="bg-gradient-to-r from-primary to-secondary w-full"
            >
              C'est parti !
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pause Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Mettre la séance en pause ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu peux reprendre ta séance plus tard depuis le hub.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer</AlertDialogCancel>
            <AlertDialogAction onClick={handlePauseSession}>Mettre en pause</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Modal */}
      {sessionId && (
        <SessionFeedbackModal
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          sessionId={sessionId}
          exerciseLogs={exerciseLogs}
        />
      )}
    </div>
  );
};

export default Session;
