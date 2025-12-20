import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Sparkles, Dumbbell, Heart, Flame, Wind } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainingSetup } from "@/hooks/useTrainingSetup";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getRecommendedSessionType, 
  getRecommendedCardioIntensity, 
  getRecommendedSplit 
} from "@/services/planner";

const TrainingSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: trainingData, saveProgress, clearTrainingSetup } = useTrainingSetup();
  const { data: onboardingData } = useOnboarding();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 6;

  // Requête combinée optimisée avec React Query
  const { data: userData, isLoading: checkingGoals } = useQuery({
    queryKey: ['training-setup-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Requête parallèle optimisée
      const [goalsResult, preferencesResult] = await Promise.all([
        supabase
          .from("goals")
          .select("goal_type")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from('training_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      return {
        goals: goalsResult.data,
        preferences: preferencesResult.data,
        goalsError: goalsResult.error,
        preferencesError: preferencesResult.error
      };
    },
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });

  // Gestion de la redirection
  useEffect(() => {
    if (authLoading || checkingGoals) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    if (userData?.preferences) {
      toast({
        title: "Préférences déjà configurées",
        description: "Tu peux les modifier dans Paramètres > Programme d'entraînement",
      });
      navigate('/hub');
      return;
    }

    if (!userData?.goals?.goal_type) {
      navigate("/start");
      return;
    }
  }, [user, authLoading, checkingGoals, userData, navigate, toast]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const [formData, setFormData] = useState({
    sessionType: trainingData.sessionType || undefined,
    experienceLevel: trainingData.experienceLevel || undefined,
    splitPreference: trainingData.splitPreference || undefined,
    cardioIntensity: trainingData.cardioIntensity || undefined,
    priorityZones: trainingData.priorityZones || [],
    limitations: trainingData.limitations || [],
    favoriteExercises: trainingData.favoriteExercises || "",
    exercisesToAvoid: trainingData.exercisesToAvoid || "",
    progressionFocus: trainingData.progressionFocus || undefined,
    mobilityPreference: trainingData.mobilityPreference || undefined,
  });

  const updateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveProgress(updated);
  };

  const toggleArrayItem = (field: "priorityZones" | "limitations", value: string) => {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField(field, updated);
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return !!formData.sessionType;
      case 2:
        return !!formData.experienceLevel;
      case 3:
        if (formData.sessionType === "strength" || formData.sessionType === "mixed" || formData.sessionType === "mobility") {
          return !!formData.splitPreference;
        }
        if (formData.sessionType === "cardio") {
          return !!formData.cardioIntensity;
        }
        return true;
      case 4:
        return formData.priorityZones.length > 0;
      case 5:
        return formData.limitations.length > 0;
      case 6:
        return !!formData.progressionFocus && !!formData.mobilityPreference;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("training_preferences").insert({
        user_id: user.id,
        session_type: formData.sessionType!,
        experience_level: formData.experienceLevel!,
        split_preference: formData.splitPreference,
        cardio_intensity: formData.cardioIntensity,
        priority_zones: formData.priorityZones,
        limitations: formData.limitations,
        favorite_exercises: formData.favoriteExercises || null,
        exercises_to_avoid: formData.exercisesToAvoid || null,
        progression_focus: formData.progressionFocus!,
        mobility_preference: formData.mobilityPreference!,
      });

      if (error) throw error;

      // Vérifier que les données goals existent avant de continuer
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (goalsError) {
        console.error("Error checking goals:", goalsError);
      }

      if (!goalsData) {
        toast({
          title: "Données manquantes",
          description: "Complète d'abord le questionnaire d'onboarding.",
          variant: "destructive",
        });
        navigate("/start");
        return;
      }

      clearTrainingSetup();
      localStorage.removeItem("onboardingData");
      
      // Redirect to Hub for the guided tour
      navigate("/hub");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const recommendedSessionTypes = onboardingData.goal 
    ? getRecommendedSessionType(onboardingData.goal) 
    : [];

  const recommendedCardioIntensities = 
    onboardingData.goal && formData.experienceLevel
      ? getRecommendedCardioIntensity(onboardingData.goal, formData.experienceLevel)
      : [];

  const recommendedSplits = 
    onboardingData.frequency && formData.experienceLevel
      ? getRecommendedSplit(onboardingData.frequency, formData.experienceLevel)
      : [];

  const sessionTypeOptions = [
    { value: "strength", label: "Musculation / Renfo", icon: Dumbbell },
    { value: "cardio", label: "Cardio / HIIT", icon: Flame },
    { value: "mixed", label: "Mixte", icon: Heart },
    { value: "mobility", label: "Mobilité / Stretching", icon: Wind },
  ];

  const experienceLevelOptions = [
    { value: "beginner", label: "Débutant", desc: "moins de 6 mois" },
    { value: "intermediate", label: "Intermédiaire", desc: "6 mois - 2 ans" },
    { value: "advanced", label: "Avancé", desc: "plus de 2 ans" },
    { value: "expert", label: "Expert", desc: "compétiteur / athlète" },
  ];

  const splitOptions = [
    { value: "full_body", label: "Full Body", desc: "tout le corps à chaque séance" },
    { value: "upper_lower", label: "Upper/Lower", desc: "haut puis bas alterné" },
    { value: "ppl", label: "Push/Pull/Legs", desc: "poussée, tirage, jambes" },
    { value: "body_part", label: "Split par muscle", desc: "pecs, dos, épaules, etc." },
  ];

  const cardioIntensityOptions = [
    { value: "liss", label: "LISS", desc: "effort faible, longue durée" },
    { value: "miss", label: "MISS", desc: "effort modéré" },
    { value: "hiit", label: "HIIT", desc: "effort maximal par intervalles" },
    { value: "mixed", label: "Mixte", desc: "varier selon les séances" },
  ];

  const priorityZoneOptions = [
    { value: "upper", label: "Haut du corps" },
    { value: "legs", label: "Jambes" },
    { value: "glutes", label: "Fessiers" },
    { value: "core", label: "Abdos / Core" },
    { value: "balanced", label: "Pas de préférence (équilibré)" },
  ];

  const limitationOptions = [
    { value: "none", label: "Aucune limitation" },
    { value: "shoulders", label: "Problèmes d'épaules" },
    { value: "knees", label: "Problèmes de genoux" },
    { value: "back", label: "Problèmes de dos (lombaires)" },
    { value: "wrists", label: "Problèmes de poignets" },
    { value: "ankles", label: "Problèmes de chevilles" },
  ];

  const progressionFocusOptions = [
    { value: "strength", label: "Augmenter les charges (force)" },
    { value: "reps", label: "Augmenter les répétitions (endurance musculaire)" },
    { value: "rest", label: "Réduire les temps de repos (capacité cardiovasculaire)" },
    { value: "technique", label: "Améliorer la technique (qualité de mouvement)" },
    { value: "auto", label: "Pas de préférence (automatique)" },
  ];

  const mobilityPreferenceOptions = [
    { value: "every_session", label: "Oui, à chaque séance (5-10 min)" },
    { value: "dedicated", label: "Oui, en séance dédiée (1x/semaine)" },
    { value: "occasional", label: "Occasionnellement" },
    { value: "none", label: "Non merci" },
  ];

  const renderRecommendedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
      <Sparkles className="w-3 h-3" />
      Recommandé
    </span>
  );

  if (authLoading || checkingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 gradient-hero rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const stepLabels = [
    "Type",
    "Niveau", 
    "Split",
    "Zones",
    "Limites",
    "Objectifs"
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header variant="onboarding" disableNavigation={true} />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
        {/* Stepper visuel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              
              return (
                <div key={stepNumber} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {/* Ligne gauche */}
                    {index > 0 && (
                      <div 
                        className={`flex-1 h-0.5 ${
                          isCompleted || isActive ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                    
                    {/* Cercle */}
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    
                    {/* Ligne droite */}
                    {index < stepLabels.length - 1 && (
                      <div 
                        className={`flex-1 h-0.5 ${
                          isCompleted ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  
                  {/* Label (visible seulement sur desktop ou pour l'étape active) */}
                  <span 
                    className={`mt-2 text-xs text-center hidden sm:block ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Titre et description */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Configure ton entraînement</h1>
            <p className="text-muted-foreground mt-1">
              Étape {step} sur {totalSteps} — {stepLabels[step - 1]}
            </p>
          </div>
        </div>

        <Card className="p-6">
          {/* STEP 1: Type de séances */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Quels types de séances te motivent le plus ?
                </h2>
              </div>
              <RadioGroup
                value={formData.sessionType}
                onValueChange={(value) => updateField("sessionType", value)}
              >
                <div className="space-y-3">
                  {sessionTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isRecommended = recommendedSessionTypes.includes(option.value as any);
                    return (
                      <div
                        key={option.value}
                        className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          formData.sessionType === option.value
                            ? "border-primary bg-primary/5"
                            : isRecommended
                            ? "border-primary/40 hover:border-primary/60"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => updateField("sessionType", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Icon className="w-5 h-5 text-primary" />
                        <Label
                          htmlFor={option.value}
                          className="flex-1 cursor-pointer font-medium"
                        >
                          {option.label}
                        </Label>
                        {isRecommended && renderRecommendedBadge()}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* STEP 2: Niveau d'expérience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Quel est ton niveau en musculation ?
                </h2>
              </div>
              <RadioGroup
                value={formData.experienceLevel}
                onValueChange={(value) => updateField("experienceLevel", value)}
              >
                <div className="space-y-3">
                  {experienceLevelOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        formData.experienceLevel === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => updateField("experienceLevel", option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* STEP 3: Split / Cardio intensity (conditional) */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Show split preference if strength or mixed */}
              {(formData.sessionType === "strength" || formData.sessionType === "mixed" || formData.sessionType === "mobility") && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    Comment préfères-tu organiser tes séances ?
                  </h2>
                  <RadioGroup
                    value={formData.splitPreference}
                    onValueChange={(value) => updateField("splitPreference", value)}
                  >
                    <div className="space-y-3">
                      {splitOptions.map((option) => {
                        const isRecommended = recommendedSplits.includes(option.value as any);
                        return (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                              formData.splitPreference === option.value
                                ? "border-primary bg-primary/5"
                                : isRecommended
                                ? "border-primary/40 hover:border-primary/60"
                                : "border-border hover:border-primary/30"
                            }`}
                            onClick={() => updateField("splitPreference", option.value)}
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.desc}</div>
                            </Label>
                            {isRecommended && renderRecommendedBadge()}
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Show cardio intensity if cardio or mixed */}
              {(formData.sessionType === "cardio" || formData.sessionType === "mixed") && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    Quelle intensité de cardio préfères-tu ?
                  </h2>
                  <RadioGroup
                    value={formData.cardioIntensity}
                    onValueChange={(value) => updateField("cardioIntensity", value)}
                  >
                    <div className="space-y-3">
                      {cardioIntensityOptions.map((option) => {
                        const isRecommended = recommendedCardioIntensities.includes(option.value as any);
                        return (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                              formData.cardioIntensity === option.value
                                ? "border-primary bg-primary/5"
                                : isRecommended
                                ? "border-primary/40 hover:border-primary/60"
                                : "border-border hover:border-primary/30"
                            }`}
                            onClick={() => updateField("cardioIntensity", option.value)}
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.desc}</div>
                            </Label>
                            {isRecommended && renderRecommendedBadge()}
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Priority zones */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Sur quelles zones veux-tu mettre l'accent ?
                </h2>
                <p className="text-sm text-muted-foreground">Sélection multiple possible</p>
              </div>
              <div className="space-y-3">
                {priorityZoneOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      formData.priorityZones.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => toggleArrayItem("priorityZones", option.value)}
                  >
                    <Checkbox
                      checked={formData.priorityZones.includes(option.value)}
                      onCheckedChange={() => toggleArrayItem("priorityZones", option.value)}
                    />
                    <Label className="flex-1 cursor-pointer font-medium">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Limitations */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  As-tu des limitations physiques ou blessures actuelles ?
                </h2>
                <p className="text-sm text-muted-foreground">Sélection multiple possible</p>
              </div>
              <div className="space-y-3">
                {limitationOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      formData.limitations.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => toggleArrayItem("limitations", option.value)}
                  >
                    <Checkbox
                      checked={formData.limitations.includes(option.value)}
                      onCheckedChange={() => toggleArrayItem("limitations", option.value)}
                    />
                    <Label className="flex-1 cursor-pointer font-medium">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="favorites">
                    Y a-t-il des exercices que tu aimes particulièrement ? (optionnel)
                  </Label>
                  <Textarea
                    id="favorites"
                    placeholder="Ex: J'adore les tractions, je préfère les exercices avec haltères..."
                    value={formData.favoriteExercises}
                    onChange={(e) => updateField("favoriteExercises", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avoid">
                    Y a-t-il des exercices que tu veux absolument éviter ? (optionnel)
                  </Label>
                  <Textarea
                    id="avoid"
                    placeholder="Ex: Pas de burpees, je déteste le squat..."
                    value={formData.exercisesToAvoid}
                    onChange={(e) => updateField("exercisesToAvoid", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Progression & Mobility */}
          {step === 6 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  Comment veux-tu suivre ta progression ?
                </h2>
                <RadioGroup
                  value={formData.progressionFocus}
                  onValueChange={(value) => updateField("progressionFocus", value)}
                >
                  <div className="space-y-3">
                    {progressionFocusOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          formData.progressionFocus === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => updateField("progressionFocus", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  Veux-tu inclure du travail de mobilité / stretching ?
                </h2>
                <RadioGroup
                  value={formData.mobilityPreference}
                  onValueChange={(value) => updateField("mobilityPreference", value)}
                >
                  <div className="space-y-3">
                    {mobilityPreferenceOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          formData.mobilityPreference === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => updateField("mobilityPreference", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || submitting}
          >
            {step === totalSteps ? (
              submitting ? "Enregistrement..." : "Terminer"
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default TrainingSetup;
