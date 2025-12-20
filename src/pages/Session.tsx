import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Exercise } from "@/services/planner";
import { useNavigate } from "react-router-dom";
import { Play, Pause, ChevronRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";
import { BackButton } from "@/components/BackButton";
import { SessionFeedbackModal } from "@/components/training/SessionFeedbackModal";
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
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentRPE, setCurrentRPE] = useState(7);

  // Check for first-time tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('firstSessionTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Try to load session from currentSessionId in localStorage
      const currentSessionId = localStorage.getItem("currentSessionId");
      
      if (currentSessionId) {
        const { data: session } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', currentSessionId)
          .eq('user_id', user.id)
          .single();
        
        if (session?.exercises && Array.isArray(session.exercises)) {
          setExercises(session.exercises as any);
          setSessionId(session.id);
          return;
        }
      }

      // Fallback: load most recent session
      const { data: lastSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (lastSession?.exercises && Array.isArray(lastSession.exercises)) {
        setExercises(lastSession.exercises as any);
        setSessionId(lastSession.id);
      } else {
        navigate("/training");
      }
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

  // Calculate granular progress (series by series)
  const getTotalSets = () => exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const getCompletedSets = () => {
    let completed = 0;
    // Count all sets from previous exercises
    for (let i = 0; i < currentExerciseIndex; i++) {
      completed += exercises[i].sets;
    }
    // Add completed sets from current exercise
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

  const handleSetComplete = async () => {
    // Log the set with weight and RPE
    const weight = parseFloat(currentWeight) || 0;
    if (weight > 0) {
      logSet(currentExercise.name, currentSet, weight, currentRPE);
    }

    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
      setCurrentWeight(""); // Reset for next set
      startRest();
    } else {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        setCurrentWeight("");
        setCurrentRPE(7);
        
        // Suggest weight for next exercise if available
        const nextExercise = exercises[currentExerciseIndex + 1];
        const suggested = getSuggestedWeight(nextExercise.name);
        if (suggested) {
          setCurrentWeight(suggested.toString());
        }
        
        toast({
          title: "Exercice terminé !",
          description: "Prends une petite pause et passe au suivant.",
        });
      } else {
        // Session complete - mark as completed and show feedback
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
        
        // Show feedback modal instead of navigating immediately
        setShowFeedbackModal(true);
      }
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de ta séance...</p>
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Série {completedSetsAll + 1}/{totalSetsAll}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% complété</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          {/* Main Exercise Card */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl min-h-[60vh] flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">{currentExercise.name}</h2>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                Série {currentSet}/{totalSets}
              </span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full font-medium">
                {currentExercise.reps} reps
              </span>
            </div>

            {/* Timer / Rest Display */}
            {isResting && (
              <div className="mb-6 p-8 bg-secondary/10 rounded-2xl text-center">
                <div className="text-sm text-muted-foreground mb-2">Temps de repos</div>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - timeLeft / currentExercise.rest)}`}
                      className="text-secondary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-secondary">{formatTime(timeLeft)}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                  size="lg"
                  className="rounded-xl"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
              </div>
            )}

            {/* Exercise Details */}
            {!isResting && (
              <>
                {/* Tracking Inputs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Poids utilisé (kg)
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

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-muted/50 rounded-xl">
                    <div className="text-sm text-muted-foreground">RPE cible</div>
                    <div className="text-xl font-bold">{currentExercise.rpe}</div>
                  </Card>
                  <Card className="p-4 bg-muted/50 rounded-xl">
                    <div className="text-sm text-muted-foreground">RIR cible</div>
                    <div className="text-xl font-bold">{currentExercise.rir}</div>
                  </Card>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      Consignes clés
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {currentExercise.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Erreurs fréquentes
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {currentExercise.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
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
                    onClick={showAlternative}
                    className="rounded-xl"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Alternative
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Tutorial Dialog */}
      <AlertDialog open={showTutorial} onOpenChange={setShowTutorial}>
        <AlertDialogContent className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Bienvenue dans ta séance ! 🎯</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left pt-2">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Réalise chaque série en suivant les consignes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Note ton poids et ton RPE après chaque série</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Clique sur "Série terminée" pour lancer le timer de repos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>La barre de progression avance série par série</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span>En fin de séance, donne ton feedback pour améliorer tes prochains entraînements</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                localStorage.setItem('firstSessionTutorial', 'seen');
                setShowTutorial(false);
              }}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              C'est parti ! 🚀
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
