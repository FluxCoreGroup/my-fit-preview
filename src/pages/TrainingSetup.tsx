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
import { useTranslation } from "react-i18next";
import { 
  getRecommendedSessionType, 
  getRecommendedCardioIntensity, 
  getRecommendedSplit 
} from "@/services/planner";

const TrainingSetup = () => {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: trainingData, saveProgress, clearTrainingSetup } = useTrainingSetup();
  const { data: onboardingData } = useOnboarding();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 6;

  const { data: userData, isLoading: checkingGoals } = useQuery({
    queryKey: ['training-setup-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      const [goalsResult, preferencesResult] = await Promise.all([
        supabase.from("goals").select("goal_type").eq("user_id", user.id).maybeSingle(),
        supabase.from('training_preferences').select('id').eq('user_id', user.id).maybeSingle()
      ]);
      return {
        goals: goalsResult.data,
        preferences: preferencesResult.data,
        goalsError: goalsResult.error,
        preferencesError: preferencesResult.error
      };
    },
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (authLoading || checkingGoals) return;
    if (!user) { navigate("/auth"); return; }
    if (userData?.preferences) {
      toast({ title: t("trainingSetup.alreadyConfigured"), description: t("trainingSetup.alreadyConfiguredDesc") });
      navigate('/hub');
      return;
    }
    if (!userData?.goals?.goal_type || userData.goals.goal_type.length === 0) {
      navigate("/start");
      return;
    }
  }, [user, authLoading, checkingGoals, userData, navigate, toast, t]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const [formData, setFormData] = useState({
    sessionType: trainingData.sessionType || undefined,
    experienceLevel: trainingData.experienceLevel || undefined,
    splitPreference: trainingData.splitPreference || undefined,
    cardioIntensity: trainingData.cardioIntensity || undefined,
    priorityZones: trainingData.priorityZones || [],
    limitations: trainingData.limitations || [],
    limitationsOther: trainingData.limitationsOther || "",
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
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateField(field, updated);
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1: return !!formData.sessionType;
      case 2: return !!formData.experienceLevel;
      case 3:
        if (formData.sessionType === "strength" || formData.sessionType === "mixed" || formData.sessionType === "mobility") return !!formData.splitPreference;
        if (formData.sessionType === "cardio") return !!formData.cardioIntensity;
        return true;
      case 4: return formData.priorityZones.length > 0;
      case 5: return formData.limitations.length > 0;
      case 6: return !!formData.progressionFocus && !!formData.mobilityPreference;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) { setStep(step + 1); } else { await handleSubmit(); }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

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
        limitations: formData.limitations.includes("other") && formData.limitationsOther
          ? [...formData.limitations.filter(l => l !== "other"), `other:${formData.limitationsOther}`]
          : formData.limitations,
        favorite_exercises: formData.favoriteExercises || null,
        exercises_to_avoid: formData.exercisesToAvoid || null,
        progression_focus: formData.progressionFocus!,
        mobility_preference: formData.mobilityPreference!,
      });
      if (error) throw error;

      const { data: goalsData } = await supabase.from("goals").select("id").eq("user_id", user.id).maybeSingle();
      if (!goalsData) {
        toast({ title: t("trainingSetup.missingData"), description: t("trainingSetup.missingDataDesc"), variant: "destructive" });
        navigate("/start");
        return;
      }
      clearTrainingSetup();
      localStorage.removeItem("onboardingData");
      navigate("/hub");
    } catch (error: any) {
      toast({ title: t("trainingSetup.error"), description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const recommendedSessionTypes = onboardingData.goal && onboardingData.goal.length > 0 ? getRecommendedSessionType(onboardingData.goal) : [];
  const recommendedCardioIntensities = onboardingData.goal && onboardingData.goal.length > 0 && formData.experienceLevel ? getRecommendedCardioIntensity(onboardingData.goal, formData.experienceLevel) : [];
  const recommendedSplits = onboardingData.frequency && formData.experienceLevel ? getRecommendedSplit(onboardingData.frequency, formData.experienceLevel) : [];

  const sessionTypeOptions = [
    { value: "strength", label: t("trainingSetup.sessionTypes.strength"), icon: Dumbbell },
    { value: "cardio", label: t("trainingSetup.sessionTypes.cardio"), icon: Flame },
    { value: "mixed", label: t("trainingSetup.sessionTypes.mixed"), icon: Heart },
    { value: "mobility", label: t("trainingSetup.sessionTypes.mobility"), icon: Wind },
  ];

  const experienceLevelOptions = [
    { value: "beginner", label: t("trainingSetup.experienceLevels.beginner"), desc: t("trainingSetup.experienceLevels.beginnerDesc") },
    { value: "intermediate", label: t("trainingSetup.experienceLevels.intermediate"), desc: t("trainingSetup.experienceLevels.intermediateDesc") },
    { value: "advanced", label: t("trainingSetup.experienceLevels.advanced"), desc: t("trainingSetup.experienceLevels.advancedDesc") },
    { value: "expert", label: t("trainingSetup.experienceLevels.expert"), desc: t("trainingSetup.experienceLevels.expertDesc") },
  ];

  const splitOptions = [
    { value: "full_body", label: t("trainingSetup.splits.full_body"), desc: t("trainingSetup.splits.full_bodyDesc") },
    { value: "upper_lower", label: t("trainingSetup.splits.upper_lower"), desc: t("trainingSetup.splits.upper_lowerDesc") },
    { value: "ppl", label: t("trainingSetup.splits.ppl"), desc: t("trainingSetup.splits.pplDesc") },
    { value: "body_part", label: t("trainingSetup.splits.body_part"), desc: t("trainingSetup.splits.body_partDesc") },
  ];

  const cardioIntensityOptions = [
    { value: "liss", label: t("trainingSetup.cardioIntensities.liss"), desc: t("trainingSetup.cardioIntensities.lissDesc") },
    { value: "miss", label: t("trainingSetup.cardioIntensities.miss"), desc: t("trainingSetup.cardioIntensities.missDesc") },
    { value: "hiit", label: t("trainingSetup.cardioIntensities.hiit"), desc: t("trainingSetup.cardioIntensities.hiitDesc") },
    { value: "mixed", label: t("trainingSetup.cardioIntensities.mixed"), desc: t("trainingSetup.cardioIntensities.mixedDesc") },
  ];

  const priorityZoneOptions = [
    { value: "upper", label: t("trainingSetup.priorityZones.upper") },
    { value: "legs", label: t("trainingSetup.priorityZones.legs") },
    { value: "glutes", label: t("trainingSetup.priorityZones.glutes") },
    { value: "core", label: t("trainingSetup.priorityZones.core") },
    { value: "balanced", label: t("trainingSetup.priorityZones.balanced") },
  ];

  const limitationOptions = [
    { value: "none", label: t("trainingSetup.limitations.none") },
    { value: "shoulders", label: t("trainingSetup.limitations.shoulders") },
    { value: "knees", label: t("trainingSetup.limitations.knees") },
    { value: "back", label: t("trainingSetup.limitations.back") },
    { value: "wrists", label: t("trainingSetup.limitations.wrists") },
    { value: "ankles", label: t("trainingSetup.limitations.ankles") },
    { value: "other", label: t("trainingSetup.limitations.other") },
  ];

  const progressionFocusOptions = [
    { value: "strength", label: t("trainingSetup.progressionOptions.strength") },
    { value: "reps", label: t("trainingSetup.progressionOptions.reps") },
    { value: "rest", label: t("trainingSetup.progressionOptions.rest") },
    { value: "technique", label: t("trainingSetup.progressionOptions.technique") },
    { value: "auto", label: t("trainingSetup.progressionOptions.auto") },
  ];

  const mobilityPreferenceOptions = [
    { value: "every_session", label: t("trainingSetup.mobilityOptions.every_session") },
    { value: "dedicated", label: t("trainingSetup.mobilityOptions.dedicated") },
    { value: "occasional", label: t("trainingSetup.mobilityOptions.occasional") },
    { value: "none", label: t("trainingSetup.mobilityOptions.none") },
  ];

  const renderRecommendedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
      <Sparkles className="w-3 h-3" />
      {t("trainingSetup.recommended")}
    </span>
  );

  if (authLoading || checkingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 gradient-hero rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("trainingSetup.loading")}</p>
        </div>
      </div>
    );
  }

  const stepLabels = [
    t("trainingSetup.stepLabels.type"),
    t("trainingSetup.stepLabels.level"),
    t("trainingSetup.stepLabels.split"),
    t("trainingSetup.stepLabels.zones"),
    t("trainingSetup.stepLabels.limits"),
    t("trainingSetup.stepLabels.goals"),
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header variant="onboarding" disableNavigation={true} />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <div className="mb-4 relative max-w-xs mx-auto md:max-w-xl">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-600" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
            <div className="relative flex justify-between">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = step === stepNumber;
                const isCompleted = step > stepNumber;
                return (
                  <div key={stepNumber} className="flex flex-col items-center top-1" style={{ position: 'absolute', left: `${(index / (stepLabels.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className={`mt-2 text-xs text-center hidden sm:block ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`} style={{ whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-16" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t("trainingSetup.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("trainingSetup.stepOf", { step, total: totalSteps, label: stepLabels[step - 1] })}</p>
          </div>
        </div>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">{t("trainingSetup.step1Title")}</h2>
              <RadioGroup value={formData.sessionType} onValueChange={(value) => updateField("sessionType", value)}>
                <div className="space-y-3">
                  {sessionTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isRecommended = recommendedSessionTypes.includes(option.value as any);
                    return (
                      <div key={option.value} className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.sessionType === option.value ? "border-primary bg-primary/5" : isRecommended ? "border-primary/40 hover:border-primary/60" : "border-border hover:border-primary/30"}`} onClick={() => updateField("sessionType", option.value)}>
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Icon className="w-5 h-5 text-primary" />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">{option.label}</Label>
                        {isRecommended && renderRecommendedBadge()}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">{t("trainingSetup.step2Title")}</h2>
              <RadioGroup value={formData.experienceLevel} onValueChange={(value) => updateField("experienceLevel", value)}>
                <div className="space-y-3">
                  {experienceLevelOptions.map((option) => (
                    <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.experienceLevel === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => updateField("experienceLevel", option.value)}>
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

          {step === 3 && (
            <div className="space-y-6">
              {(formData.sessionType === "strength" || formData.sessionType === "mixed" || formData.sessionType === "mobility") && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">{t("trainingSetup.step3SplitTitle")}</h2>
                  <RadioGroup value={formData.splitPreference} onValueChange={(value) => updateField("splitPreference", value)}>
                    <div className="space-y-3">
                      {splitOptions.map((option) => {
                        const isRecommended = recommendedSplits.includes(option.value as any);
                        return (
                          <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.splitPreference === option.value ? "border-primary bg-primary/5" : isRecommended ? "border-primary/40 hover:border-primary/60" : "border-border hover:border-primary/30"}`} onClick={() => updateField("splitPreference", option.value)}>
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

              {(formData.sessionType === "cardio" || formData.sessionType === "mixed") && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">{t("trainingSetup.step3CardioTitle")}</h2>
                  <RadioGroup value={formData.cardioIntensity} onValueChange={(value) => updateField("cardioIntensity", value)}>
                    <div className="space-y-3">
                      {cardioIntensityOptions.map((option) => {
                        const isRecommended = recommendedCardioIntensities.includes(option.value as any);
                        return (
                          <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.cardioIntensity === option.value ? "border-primary bg-primary/5" : isRecommended ? "border-primary/40 hover:border-primary/60" : "border-border hover:border-primary/30"}`} onClick={() => updateField("cardioIntensity", option.value)}>
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

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("trainingSetup.step4Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("trainingSetup.multipleSelection")}</p>
              </div>
              <div className="space-y-3">
                {priorityZoneOptions.map((option) => (
                  <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.priorityZones.includes(option.value) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => toggleArrayItem("priorityZones", option.value)}>
                    <Checkbox checked={formData.priorityZones.includes(option.value)} onCheckedChange={() => toggleArrayItem("priorityZones", option.value)} />
                    <Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("trainingSetup.step5Title")}</h2>
                <p className="text-sm text-muted-foreground">{t("trainingSetup.multipleSelection")}</p>
              </div>
              <div className="space-y-3">
                {limitationOptions.map((option) => (
                  <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.limitations.includes(option.value) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => toggleArrayItem("limitations", option.value)}>
                    <Checkbox checked={formData.limitations.includes(option.value)} onCheckedChange={() => toggleArrayItem("limitations", option.value)} />
                    <Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
                  </div>
                ))}

                {formData.limitations.includes("other") && (
                  <div className="mt-3">
                    <Label htmlFor="limitationsOther">{t("trainingSetup.otherDetails")}</Label>
                    <Textarea id="limitationsOther" placeholder={t("trainingSetup.otherPlaceholder")} value={formData.limitationsOther} onChange={(e) => updateField("limitationsOther", e.target.value)} rows={2} className="mt-1" />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="favorites">{t("trainingSetup.favoriteExercises")}</Label>
                  <Textarea id="favorites" placeholder={t("trainingSetup.favoriteExercisesPlaceholder")} value={formData.favoriteExercises} onChange={(e) => updateField("favoriteExercises", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avoid">{t("trainingSetup.exercisesToAvoid")}</Label>
                  <Textarea id="avoid" placeholder={t("trainingSetup.exercisesToAvoidPlaceholder")} value={formData.exercisesToAvoid} onChange={(e) => updateField("exercisesToAvoid", e.target.value)} rows={3} />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{t("trainingSetup.step6ProgressionTitle")}</h2>
                <RadioGroup value={formData.progressionFocus} onValueChange={(value) => updateField("progressionFocus", value)}>
                  <div className="space-y-3">
                    {progressionFocusOptions.map((option) => (
                      <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.progressionFocus === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => updateField("progressionFocus", option.value)}>
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{t("trainingSetup.step6MobilityTitle")}</h2>
                <RadioGroup value={formData.mobilityPreference} onValueChange={(value) => updateField("mobilityPreference", value)}>
                  <div className="space-y-3">
                    {mobilityPreferenceOptions.map((option) => (
                      <div key={option.value} className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${formData.mobilityPreference === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => updateField("mobilityPreference", option.value)}>
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("trainingSetup.back")}
          </Button>
          <Button onClick={handleNext} disabled={!isStepValid() || submitting}>
            {step === totalSteps ? (
              submitting ? t("trainingSetup.submitting") : t("trainingSetup.submit")
            ) : (
              <>
                {t("trainingSetup.next")}
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
