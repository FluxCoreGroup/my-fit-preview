import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, Info, CheckCircle2, AlertCircle, Loader2, 
  Brain, Target, Sparkles, Dumbbell, Check, Zap, RefreshCcw,
  Calendar, PartyPopper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfWeek, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ModalStep = "form" | "generating" | "success" | "error";

interface WeeklyFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const generatingSteps = [
  { icon: Brain, text: "Analyse de ton profil et objectifs", subtext: "Récupération de tes données..." },
  { icon: Target, text: "Sélection des meilleurs exercices", subtext: "Adaptation à ton niveau..." },
  { icon: Sparkles, text: "Personnalisation intelligente", subtext: "Optimisation des séries et répétitions..." },
  { icon: Dumbbell, text: "Création de tes séances sur mesure", subtext: "Finalisation du programme..." },
];

export const WeeklyFeedbackModal = ({ open, onClose, onComplete }: WeeklyFeedbackModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Step management
  const [step, setStep] = useState<ModalStep>("form");
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [weight1, setWeight1] = useState<number | null>(null);
  const [weight2, setWeight2] = useState<number | null>(null);
  const [weight3, setWeight3] = useState<number | null>(null);
  const [adherence, setAdherence] = useState(80);
  const [rpe, setRpe] = useState<number | null>(null);
  const [hasPain, setHasPain] = useState("no");
  const [energy, setEnergy] = useState("normal");
  const [comment, setComment] = useState("");
  
  // Generation state
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [generatedSessionsCount, setGeneratedSessionsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep("form");
      resetForm();
    }
  }, [open]);

  // Animate progress when generating
  useEffect(() => {
    if (step !== "generating") {
      setGeneratingProgress(0);
      setGeneratingStep(0);
      setCompletedSteps([]);
      return;
    }

    const progressInterval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 150);

    const stepInterval = setInterval(() => {
      setGeneratingStep(prev => {
        const next = prev + 1;
        if (next < generatingSteps.length) {
          setCompletedSteps(completed => [...completed, prev]);
          return next;
        }
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [step]);

  const resetForm = () => {
    setWeight1(null);
    setWeight2(null);
    setWeight3(null);
    setAdherence(80);
    setRpe(null);
    setHasPain("no");
    setEnergy("normal");
    setComment("");
    setGeneratingProgress(0);
    setGeneratingStep(0);
    setCompletedSteps([]);
    setGeneratedSessionsCount(0);
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!user) return;

    const weights = [weight1, weight2, weight3].filter(w => w !== null);
    if (weights.length === 0) {
      toast({
        title: "Poids manquant",
        description: "Entre au moins une mesure de poids",
        variant: "destructive",
      });
      return;
    }

    if (!rpe) {
      toast({
        title: "Champs requis",
        description: "Complète tous les champs obligatoires (*)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const currentWeekISO = format(new Date(), "yyyy-'W'II");
      const avgWeight = weights.reduce((a, b) => a + (b || 0), 0) / weights.length;

      // Check if check-in already exists for this week (avoid duplicate insert)
      const { data: existingCheckin } = await supabase
        .from("weekly_checkins")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_iso", currentWeekISO)
        .maybeSingle();

      let checkinId: string | null = existingCheckin?.id || null;

      if (!existingCheckin) {
        // Save new check-in
        const { data: checkinData, error } = await supabase.from("weekly_checkins").insert({
          user_id: user.id,
          week_iso: currentWeekISO,
          weight_measure_1: weight1,
          weight_measure_2: weight2,
          weight_measure_3: weight3,
          average_weight: avgWeight,
          adherence_diet: adherence,
          rpe_avg: rpe,
          has_pain: hasPain === "yes",
          energy_level: energy,
          blockers: comment || null,
          pain_zones: hasPain === "yes" ? ["non_specifie"] : [],
        }).select().single();

        if (error) throw error;
        checkinId = checkinData?.id || null;
      }

      // Mark all past uncompleted programs as completed (handles inactivity edge cases)
      await supabase
        .from("weekly_programs")
        .update({ check_in_completed: true, check_in_id: checkinId })
        .eq("user_id", user.id)
        .eq("check_in_completed", false)
        .lt("week_end_date", new Date().toISOString());

      setLoading(false);

      // Move to generation step
      setStep("generating");
      await generateNextWeek();
      
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer ton check-in",
        variant: "destructive",
      });
    }
  };

  const generateNextWeek = async () => {
    if (!user) return;

    try {
      // Bug fix: Calculate next week's start based on current week's Monday, not new Date()
      // Using new Date() could generate for 2 weeks ahead if user does check-in on Monday
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const nextWeekStart = addWeeks(currentWeekStart, 1);

      const { data, error } = await supabase.functions.invoke('generate-weekly-program', {
        body: {
          week_start_date: nextWeekStart.toISOString(),
          regenerate: false
        }
      });

      if (error) throw error;

      // Count generated sessions
      const sessionsCount = data?.sessions?.length || 0;
      setGeneratedSessionsCount(sessionsCount);
      
      // Complete progress animation
      setGeneratingProgress(100);
      setCompletedSteps([0, 1, 2, 3]);
      
      // Wait a bit for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStep("success");
    } catch (error) {
      console.error("Error generating weekly program:", error);
      setErrorMessage("Impossible de générer le programme. Vérifie ta connexion.");
      setStep("error");
    }
  };

  const handleRetry = async () => {
    setStep("generating");
    setGeneratingProgress(0);
    setGeneratingStep(0);
    setCompletedSteps([]);
    await generateNextWeek();
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const completedFields = [
    weight1 || weight2 || weight3,
    adherence,
    rpe,
    hasPain,
    energy,
  ].filter(Boolean).length;

  const isValid = (weight1 || weight2 || weight3) && adherence && rpe && hasPain && energy;
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(currentWeekStart, 1);
  const nextWeekLabel = format(nextWeekStart, "dd MMMM", { locale: fr });

  const CurrentStepIcon = generatingSteps[generatingStep]?.icon || Brain;

  // Prevent closing during generation
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && step === "generating") return;
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        "max-w-lg max-h-[90vh] overflow-y-auto",
        step === "generating" && "bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl"
      )}>
        {/* FORM STEP */}
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Semaine terminée ! 🎉
              </DialogTitle>
              <DialogDescription>
                Complète ton check-in pour débloquer ta nouvelle semaine d'entraînement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{completedFields}/5 champs</span>
                <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${(completedFields / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Poids */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Poids cette semaine (kg)</Label>
                  <span className="text-xs text-muted-foreground">(1 mesure min.)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Lun *</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="75"
                      className="h-10 rounded-xl"
                      value={weight1 || ""}
                      onChange={(e) => setWeight1(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Mer</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="74.8"
                      className="h-10 rounded-xl opacity-70"
                      value={weight2 || ""}
                      onChange={(e) => setWeight2(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ven</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="74.5"
                      className="h-10 rounded-xl opacity-70"
                      value={weight3 || ""}
                      onChange={(e) => setWeight3(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>

              {/* Adhérence nutrition */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Adhérence nutrition *</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[adherence]}
                    onValueChange={([v]) => setAdherence(v)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <div className="w-14 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="font-bold">{adherence}%</span>
                  </div>
                </div>
              </div>

              {/* RPE */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  Difficulté ressentie *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">1-3: Facile · 4-6: Modéré · 7-8: Difficile · 9-10: Max</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="grid grid-cols-10 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={rpe === level ? "default" : "outline"}
                      size="sm"
                      className={cn("h-9 text-sm font-bold rounded-lg p-0", rpe === level && "bg-primary")}
                      onClick={() => setRpe(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Douleur + Énergie */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Douleur ? *</Label>
                  <RadioGroup value={hasPain} onValueChange={setHasPain}>
                    <div className="flex gap-2">
                      <label className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm",
                        hasPain === "no" ? "border-primary bg-primary/10" : "border-border"
                      )}>
                        <RadioGroupItem value="no" className="sr-only" />
                        <CheckCircle2 className="w-4 h-4" />
                        Non
                      </label>
                      <label className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm",
                        hasPain === "yes" ? "border-destructive bg-destructive/10" : "border-border"
                      )}>
                        <RadioGroupItem value="yes" className="sr-only" />
                        <AlertCircle className="w-4 h-4" />
                        Oui
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Énergie *</Label>
                  <RadioGroup value={energy} onValueChange={setEnergy}>
                    <div className="flex gap-1">
                      {[
                        { value: "low", label: "↓", text: "Faible" },
                        { value: "normal", label: "→", text: "Normal" },
                        { value: "high", label: "↑", text: "Élevée" }
                      ].map(({ value, label, text }) => (
                        <label key={value} className={cn(
                          "flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all",
                          energy === value ? "border-primary bg-primary/10" : "border-border"
                        )}>
                          <RadioGroupItem value={value} className="sr-only" />
                          <span className="text-lg">{label}</span>
                          <span className="text-xs text-muted-foreground">{text}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Commentaire */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Commentaire (optionnel)</Label>
                <Textarea
                  placeholder="Ex: Blessure, semaine chargée..."
                  className="rounded-xl min-h-[60px] text-sm"
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-secondary mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Valider et générer ma nouvelle semaine
                </>
              )}
            </Button>
          </>
        )}

        {/* GENERATING STEP */}
        {step === "generating" && (
          <div className="py-4 text-center">
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
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-xl font-bold">Création de ton programme</h3>
            </div>
            
            <p className="text-muted-foreground text-sm mb-8">
              Semaine du {nextWeekLabel}
            </p>
            
            {/* Steps list */}
            <div className="space-y-3 mb-8 text-left">
              {generatingSteps.map((stepItem, idx) => {
                const StepIcon = stepItem.icon;
                const isCompleted = completedSteps.includes(idx);
                const isCurrent = idx === generatingStep;
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
                      isCompleted && "bg-primary/10",
                      isCurrent && "bg-primary/5 ring-1 ring-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : isCurrent 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <StepIcon className={cn("w-4 h-4", isCurrent && "animate-pulse")} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium transition-colors",
                        isCompleted && "text-primary",
                        isCurrent && "text-foreground",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}>
                        {stepItem.text}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground animate-pulse">
                          {stepItem.subtext}
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
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <div className="py-8 text-center">
            {/* Celebration icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <PartyPopper className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Ta semaine est prête ! 🎉</h3>
            <p className="text-muted-foreground mb-6">
              {generatedSessionsCount} séances t'attendent à partir du {nextWeekLabel}
            </p>
            
            {/* Session preview */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{generatedSessionsCount} séances générées</p>
                  <p className="text-sm text-muted-foreground">
                    Semaine du {nextWeekLabel}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleFinish}
              className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-secondary"
            >
              <Dumbbell className="w-5 h-5 mr-2" />
              Voir mon programme
            </Button>
          </div>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <div className="py-8 text-center">
            {/* Error icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Oups, une erreur est survenue</h3>
            <p className="text-muted-foreground mb-6">
              {errorMessage || "Impossible de générer ton programme. Réessaie."}
            </p>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-secondary"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                Réessayer
              </Button>
              <Button
                onClick={handleFinish}
                variant="outline"
                className="w-full rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
