import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trainingPlanner, type Exercise } from "@/services/planner";
import { useNavigate } from "react-router-dom";
import { Play, Pause, ChevronRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { useSaveOnboardingData } from "@/hooks/useSaveOnboardingData";

const Session = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  useSaveOnboardingData(); // Sauvegarder les données du questionnaire si nécessaire
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      // 1. Vérifier si une session générée existe dans localStorage
      const generatedSessionStr = localStorage.getItem("generatedSession");
      
      if (generatedSessionStr) {
        try {
          const generatedSession = JSON.parse(generatedSessionStr);
          setExercises(generatedSession.exercises);
          localStorage.removeItem("generatedSession");

          // Sauvegarder la session en DB
          if (user) {
            const { data: session, error } = await supabase
              .from("sessions")
              .insert({
                user_id: user.id,
                exercises: generatedSession.exercises,
                completed: false
              })
              .select()
              .single();

            if (session) setSessionId(session.id);
          }
          return;
        } catch (error) {
          console.error("Error loading generated session:", error);
        }
      }

      // 2. Fallback : récupérer la dernière session depuis Supabase
      if (!user) {
        navigate("/auth");
        return;
      }

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
        // 3. Pas de session trouvée → rediriger vers training-setup
        navigate("/training-setup");
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

  const startRest = () => {
    setIsResting(true);
    setTimeLeft(currentExercise.rest);
    setIsPaused(false);
  };

  const handleSetComplete = async () => {
    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
      startRest();
    } else {
      // Passer à l'exercice suivant
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        toast({
          title: "Exercice terminé !",
          description: "Prends une petite pause et passe au suivant.",
        });
      } else {
        // Fin de la séance - Marquer comme complétée
        if (user && sessionId) {
          await supabase
            .from('sessions')
            .update({ completed: true })
            .eq('id', sessionId);

          // Vérifier si c'est la première séance complétée
          const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);

          // Vérifier l'abonnement
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          // Si première séance ET pas d'abonnement actif → paywall
          if (count === 1 && !subscription) {
            navigate("/paywall");
            return;
          }
        }
        
        navigate("/feedback");
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

  const progress = ((currentExerciseIndex) / exercises.length) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Header variant="app" />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="bg-card rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Exercice {currentExerciseIndex + 1}/{exercises.length}</span>
            <span className="text-muted-foreground">{Math.round(progress)}% complété</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Exercise Card */}
        <Card className="p-8 animate-in">
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
            <div className="mb-6 p-6 bg-secondary/10 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-2">Temps de repos</div>
              <div className="text-5xl font-bold text-secondary mb-4">{formatTime(timeLeft)}</div>
              <Button
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                size="lg"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            </div>
          )}

          {/* Exercise Details */}
          {!isResting && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground">RPE cible</div>
                  <div className="text-xl font-bold">{currentExercise.rpe}</div>
                </Card>
                <Card className="p-4 bg-muted/50">
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
                  variant="success"
                  onClick={handleSetComplete}
                  className="flex-1"
                >
                  Série terminée
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={showAlternative}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Alternative
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Pause / End Session */}
        <div className="flex justify-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/preview")}>
            Mettre en pause
          </Button>
          <Button variant="ghost" onClick={() => navigate("/feedback")} className="text-destructive">
            Terminer la séance
          </Button>
        </div>
        </div>
      </div>
    </>
  );
};

export default Session;
