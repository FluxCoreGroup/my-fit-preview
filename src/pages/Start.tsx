import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { OnboardingInput } from "@/services/planner";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Header } from "@/components/Header";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { useTranslation } from "react-i18next";

const Start = () => {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, saveProgress } = useOnboarding();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;
  const [formData, setFormData] = useState<Partial<OnboardingInput>>({
    age: 31,
    birthDate: (() => {
      const date = new Date();
      const year = date.getFullYear() - 31;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    sex: undefined,
    height: undefined,
    weight: undefined,
    goal: [],
    goalHorizon: undefined,
    targetWeightLoss: undefined,
    hasCardio: undefined,
    cardioFrequency: undefined,
    activityLevel: undefined,
    frequency: undefined,
    sessionDuration: 60,
    location: undefined,
    equipment: [],
    allergies: "",
    restrictions: "",
    mealsPerDay: 3,
    hasBreakfast: true,
    healthConditions: "",
  });

  const monthNames = [
    t("start.months.january"), t("start.months.february"), t("start.months.march"),
    t("start.months.april"), t("start.months.may"), t("start.months.june"),
    t("start.months.july"), t("start.months.august"), t("start.months.september"),
    t("start.months.october"), t("start.months.november"), t("start.months.december")
  ];

  useEffect(() => {
    if (step === 1 && formData.birthDate) {
      const age = calculateAgeFromBirthDate(formData.birthDate);
      if (isNaN(age) || age < 15 || age > 100) {
        setErrors((prev) => ({
          ...prev,
          birthDate: age < 15 ? t("start.validationErrors.tooYoung") : age > 100 ? t("start.validationErrors.tooOld") : t("start.validationErrors.invalidDate")
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.birthDate;
          return newErrors;
        });
      }
    }
  }, [formData.birthDate, step, t]);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setFormData((prev) => ({ ...prev, ...data }));
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof OnboardingInput, value: any) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        saveProgress(updated);
        return updated;
      });
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors, saveProgress],
  );

  const calculateAgeFromBirthDate = (birthDateStr: string): number => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isStepValid = useMemo((): boolean => {
    switch (step) {
      case 1:
        const age = formData.birthDate ? calculateAgeFromBirthDate(formData.birthDate) : 0;
        return !!(formData.birthDate && age >= 15 && age <= 100 && formData.sex && formData.height && formData.height >= 120 && formData.height <= 250 && formData.weight && formData.weight >= 30 && formData.weight <= 300);
      case 2:
        return !!(formData.goal && formData.goal.length > 0 && formData.goalHorizon && (!formData.goal.includes("weight-loss") || !formData.targetWeightLoss || (formData.targetWeightLoss >= 1 && formData.targetWeightLoss <= 50)) && (formData.hasCardio === false || (formData.hasCardio === true && formData.cardioFrequency)));
      case 3:
        return !!formData.activityLevel;
      case 4:
        return !!(formData.frequency && formData.sessionDuration && formData.location && (formData.location === "gym" || (formData.equipment && formData.equipment.length > 0)));
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, formData]);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.birthDate) {
          newErrors.birthDate = t("start.validationErrors.birthDateRequired");
        } else {
          const age = calculateAgeFromBirthDate(formData.birthDate);
          if (isNaN(age) || age < 15 || age > 100) {
            newErrors.birthDate = t("start.validationErrors.ageRange");
          }
        }
        if (!formData.sex) newErrors.sex = t("start.validationErrors.sexRequired");
        if (!formData.height || formData.height < 120 || formData.height > 250)
          newErrors.height = t("start.validationErrors.heightRequired");
        if (!formData.weight || formData.weight < 30 || formData.weight > 300)
          newErrors.weight = t("start.validationErrors.weightRequired");
        break;
      case 2:
        if (!formData.goal || formData.goal.length === 0) newErrors.goal = t("start.validationErrors.goalRequired");
        if (!formData.goalHorizon) newErrors.goalHorizon = t("start.validationErrors.horizonRequired");
        if (formData.goal?.includes("weight-loss") && formData.targetWeightLoss && (formData.targetWeightLoss < 1 || formData.targetWeightLoss > 50)) {
          newErrors.targetWeightLoss = t("start.validationErrors.weightLossRange");
        }
        if (formData.hasCardio === undefined) newErrors.hasCardio = t("start.validationErrors.cardioRequired");
        if (formData.hasCardio === true && !formData.cardioFrequency) newErrors.cardioFrequency = t("start.validationErrors.cardioFreqRequired");
        break;
      case 3:
        if (!formData.activityLevel) newErrors.activityLevel = t("start.validationErrors.activityRequired");
        break;
      case 4:
        if (!formData.frequency) newErrors.frequency = t("start.validationErrors.frequencyRequired");
        if (!formData.sessionDuration) newErrors.sessionDuration = t("start.validationErrors.durationRequired");
        if (!formData.location) newErrors.location = t("start.validationErrors.locationRequired");
        if (formData.location === "home" && (!formData.equipment || formData.equipment.length === 0)) {
          newErrors.equipment = t("start.validationErrors.equipmentRequired");
        }
        break;
      case 5:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData, t]);

  const handleNext = useCallback(async () => {
    if (step < totalSteps) {
      if (validateStep()) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast({
          title: t("start.missingInfo"),
          description: t("start.fillRequired"),
          variant: "destructive",
        });
      }
    } else {
      if (!validateStep()) {
        toast({
          title: t("start.missingInfo"),
          description: t("start.fillRequired"),
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      try {
        localStorage.setItem("onboardingData", JSON.stringify(formData));
        navigate("/preview");
      } catch (error) {
        console.error("Error saving data:", error);
        toast({
          title: t("start.error"),
          description: t("start.saveError"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [step, totalSteps, validateStep, formData, toast, navigate, t]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const progress = (step / totalSteps) * 100;

  const equipmentItems = [
    { key: "dumbbells", label: t("start.equipmentOptions.dumbbells") },
    { key: "barbell", label: t("start.equipmentOptions.barbell") },
    { key: "bands", label: t("start.equipmentOptions.bands") },
    { key: "kettlebell", label: t("start.equipmentOptions.kettlebell") },
    { key: "bench", label: t("start.equipmentOptions.bench") },
    { key: "pullupBar", label: t("start.equipmentOptions.pullupBar") },
    { key: "none", label: t("start.equipmentOptions.none") },
  ];

  return (
    <>
      <Header variant="onboarding" showBack={true} backLabel={t("start.quit")} onBack={() => navigate("/")} onNext={handleNext} />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t("start.title")}</h1>
            <p className="text-muted-foreground">
              {t("start.stepOf", { step, total: totalSteps })}
            </p>
            <Progress value={progress} className="mt-4 h-2" />
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <Card className="p-8 animate-in">
              <h2 className="text-2xl font-bold mb-6">{t("start.step1Title")}</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("start.birthDate")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={formData.birthDate ? formData.birthDate.split("-")[2]?.replace(/^0/, "") : ""}
                      onValueChange={(day) => {
                        const parts = (formData.birthDate || "--").split("-");
                        const yyyy = parts[0] || "";
                        const mm = parts[1] || "";
                        const dd = day.padStart(2, "0");
                        if (yyyy && mm && dd) {
                          const date = `${yyyy}-${mm}-${dd}`;
                          updateField("birthDate", date);
                          updateField("age", calculateAgeFromBirthDate(date));
                        }
                      }}
                    >
                      <SelectTrigger className={errors.birthDate ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("start.day")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: (() => {
                          const parts = (formData.birthDate || "--").split("-");
                          const m = parseInt(parts[1]);
                          const y = parseInt(parts[0]);
                          if (!m) return 31;
                          return new Date(y || 2000, m, 0).getDate();
                        })() }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.birthDate ? String(parseInt(formData.birthDate.split("-")[1] || "0")) : ""}
                      onValueChange={(month) => {
                        const parts = (formData.birthDate || "--").split("-");
                        const yyyy = parts[0] || "";
                        const mm = month.padStart(2, "0");
                        const dd = parts[2] || "";
                        if (yyyy && mm && dd) {
                          const maxDay = new Date(parseInt(yyyy) || 2000, parseInt(mm), 0).getDate();
                          const safeDay = Math.min(parseInt(dd), maxDay).toString().padStart(2, "0");
                          const date = `${yyyy}-${mm}-${safeDay}`;
                          updateField("birthDate", date);
                          updateField("age", calculateAgeFromBirthDate(date));
                        } else {
                          updateField("birthDate", `${yyyy}-${mm}-${dd}`);
                        }
                      }}
                    >
                      <SelectTrigger className={errors.birthDate ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("start.month")} />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((label, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.birthDate ? formData.birthDate.split("-")[0] : ""}
                      onValueChange={(year) => {
                        const parts = (formData.birthDate || "--").split("-");
                        const mm = parts[1] || "";
                        const dd = parts[2] || "";
                        if (year && mm && dd) {
                          const maxDay = new Date(parseInt(year), parseInt(mm), 0).getDate();
                          const safeDay = Math.min(parseInt(dd), maxDay).toString().padStart(2, "0");
                          const date = `${year}-${mm}-${safeDay}`;
                          updateField("birthDate", date);
                          updateField("age", calculateAgeFromBirthDate(date));
                        } else {
                          updateField("birthDate", `${year}-${mm}-${dd}`);
                        }
                      }}
                    >
                      <SelectTrigger className={errors.birthDate ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("start.year")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 86 }, (_, i) => {
                          const y = new Date().getFullYear() - 15 - i;
                          return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.birthDate && !errors.birthDate && formData.birthDate.split("-").every(p => p && p !== "") && (
                    <p className="text-xs text-muted-foreground">
                      {t("start.yearsOld", { age: calculateAgeFromBirthDate(formData.birthDate) })}
                    </p>
                  )}
                  {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sex">{t("start.sex")}</Label>
                    <Select value={formData.sex} onValueChange={(value) => updateField("sex", value)}>
                      <SelectTrigger className={`mt-2 ${errors.sex ? "border-destructive" : ""}`}>
                        <SelectValue placeholder={t("start.choose")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("start.male")}</SelectItem>
                        <SelectItem value="female">{t("start.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sex && <p className="text-xs text-destructive mt-1">{errors.sex}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">{t("start.height")}</Label>
                    <Input id="height" type="number" placeholder="175" value={formData.height || ""} onChange={(e) => updateField("height", parseInt(e.target.value))} className={`mt-2 ${errors.height ? "border-destructive" : ""}`} />
                    {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
                  </div>
                  <div>
                    <Label htmlFor="weight">{t("start.weight")}</Label>
                    <Input id="weight" type="number" step="0.1" placeholder="70,5" value={formData.weight || ""} onChange={(e) => updateField("weight", parseFloat(e.target.value))} className={`mt-2 ${errors.weight ? "border-destructive" : ""}`} />
                    {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Card className="p-8 animate-in">
              <h2 className="text-2xl font-bold mb-2">{t("start.step2Title")}</h2>
              <p className="text-sm text-muted-foreground mb-6">{t("start.selectGoals")}</p>
              <div className="space-y-4">
                {[
                  { value: "weight-loss", label: t("start.goals.weight-loss") },
                  { value: "muscle-gain", label: t("start.goals.muscle-gain") },
                  { value: "endurance", label: t("start.goals.endurance") },
                  { value: "strength", label: t("start.goals.strength") },
                  { value: "wellness", label: t("start.goals.wellness") },
                ].map((option) => {
                  const isSelected = formData.goal?.includes(option.value as any) || false;
                  const isDisabled = !isSelected && (formData.goal?.length || 0) >= 2;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        const current = formData.goal || [];
                        if (isSelected) {
                          updateField("goal", current.filter((g) => g !== option.value));
                        } else if (current.length < 2) {
                          updateField("goal", [...current, option.value]);
                        }
                      }}
                      disabled={isDisabled}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected ? "border-primary bg-primary/5" : isDisabled ? "border-border opacity-50 cursor-not-allowed" : "border-border hover:border-primary"} ${errors.goal ? "border-destructive" : ""}`}
                    >
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  );
                })}
                {errors.goal && <p className="text-xs text-destructive">{errors.goal}</p>}
              </div>

              <div className="mt-6">
                <Label htmlFor="horizon">{t("start.horizon")}</Label>
                <Select value={formData.goalHorizon} onValueChange={(value) => updateField("goalHorizon", value)}>
                  <SelectTrigger className={`mt-2 ${errors.goalHorizon ? "border-destructive" : ""}`}>
                    <SelectValue placeholder={t("start.choose")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t("start.horizons.short")}</SelectItem>
                    <SelectItem value="medium">{t("start.horizons.medium")}</SelectItem>
                    <SelectItem value="long">{t("start.horizons.long")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goalHorizon && <p className="text-xs text-destructive mt-1">{errors.goalHorizon}</p>}
              </div>

              {formData.goal?.includes("weight-loss") && (
                <div className="mt-6">
                  <Label htmlFor="targetWeightLoss">{t("start.targetWeightLoss")}</Label>
                  <div className="mt-4">
                    <Slider value={[formData.targetWeightLoss || 5]} onValueChange={(value) => updateField("targetWeightLoss", value[0])} min={1} max={50} step={1} className="mb-2" />
                    <div className="text-center text-2xl font-bold text-primary">{formData.targetWeightLoss || 5} kg</div>
                  </div>
                  {errors.targetWeightLoss && <p className="text-xs text-destructive mt-1">{errors.targetWeightLoss}</p>}
                </div>
              )}

              <div className="mt-6">
                <Label>{t("start.hasCardio")}</Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
                  {[
                    { value: true, label: t("start.yes") },
                    { value: false, label: t("start.no") },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => updateField("hasCardio", option.value)}
                      className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${formData.hasCardio === option.value ? "border-primary bg-primary/5" : "border-border"} ${errors.hasCardio ? "border-destructive" : ""}`}
                    >
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>
                {errors.hasCardio && <p className="text-xs text-destructive mt-1">{errors.hasCardio}</p>}
              </div>

              {formData.hasCardio === true && (
                <div className="mt-6">
                  <Label htmlFor="cardioFrequency">{t("start.cardioFrequency")}</Label>
                  <Select value={formData.cardioFrequency?.toString()} onValueChange={(value) => updateField("cardioFrequency", parseInt(value))}>
                    <SelectTrigger className={`mt-2 ${errors.cardioFrequency ? "border-destructive" : ""}`}>
                      <SelectValue placeholder={t("start.choose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{t("start.timesPerWeek", { n })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cardioFrequency && <p className="text-xs text-destructive mt-1">{errors.cardioFrequency}</p>}
                </div>
              )}
            </Card>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <Card className="p-8 animate-in">
              <h2 className="text-2xl font-bold mb-6">{t("start.step3Title")}</h2>
              <div className="space-y-4">
                <Label>{t("start.activityLabel")}</Label>
                {[
                  { value: "sedentary", label: t("start.activityLevels.sedentary"), desc: t("start.activityLevels.sedentaryDesc") },
                  { value: "light", label: t("start.activityLevels.light"), desc: t("start.activityLevels.lightDesc") },
                  { value: "moderate", label: t("start.activityLevels.moderate"), desc: t("start.activityLevels.moderateDesc") },
                  { value: "high", label: t("start.activityLevels.high"), desc: t("start.activityLevels.highDesc") },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateField("activityLevel", option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${formData.activityLevel === option.value ? "border-primary bg-primary/5" : "border-border"} ${errors.activityLevel ? "border-destructive" : ""}`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
                {errors.activityLevel && <p className="text-xs text-destructive">{errors.activityLevel}</p>}
              </div>
            </Card>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <Card className="p-8 animate-in">
              <h2 className="text-2xl font-bold mb-6">{t("start.step4Title")}</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="frequency">{t("start.frequency")}</Label>
                  <Select value={formData.frequency?.toString()} onValueChange={(value) => updateField("frequency", parseInt(value))}>
                    <SelectTrigger className={`mt-2 ${errors.frequency ? "border-destructive" : ""}`}>
                      <SelectValue placeholder={t("start.choose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{t("start.timesPerWeek", { n })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.frequency && <p className="text-xs text-destructive mt-1">{errors.frequency}</p>}
                </div>

                <div>
                  <Label htmlFor="duration">{t("start.sessionDuration")}</Label>
                  <div className="mt-4">
                    <Slider value={[formData.sessionDuration || 60]} onValueChange={(value) => updateField("sessionDuration", value[0])} min={30} max={120} step={15} className="mb-2" />
                    <div className="text-center text-2xl font-bold text-primary">{t("start.minutes", { n: formData.sessionDuration || 60 })}</div>
                  </div>
                  {errors.sessionDuration && <p className="text-xs text-destructive mt-1">{errors.sessionDuration}</p>}
                </div>

                <div>
                  <Label>{t("start.gymQuestion")}</Label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
                    {[
                      { value: true, label: t("start.yes") },
                      { value: false, label: t("start.no") },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          const nextLocation: "gym" | "home" = option.value ? "gym" : "home";
                          const nextEquipment = option.value
                            ? [t("start.equipmentOptions.dumbbells"), t("start.equipmentOptions.barbell"), t("start.equipmentOptions.bench"), t("start.equipmentOptions.pullupBar"), "Machines guidées"]
                            : [];
                          setFormData((prev) => {
                            const updated = { ...prev, location: nextLocation, equipment: nextEquipment };
                            saveProgress(updated);
                            return updated;
                          });
                          setErrors((prevErr) => {
                            const e = { ...prevErr };
                            delete e.location;
                            delete e.equipment;
                            return e;
                          });
                        }}
                        className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${formData.location === (option.value ? "gym" : "home") ? "border-primary bg-primary/5" : "border-border"} ${errors.location ? "border-destructive" : ""}`}
                      >
                        <div className="font-semibold">{option.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                </div>

                {formData.location === "home" && (
                  <div>
                    <Label>{t("start.equipment")}</Label>
                    <div className={`mt-3 space-y-3 ${errors.equipment ? "p-3 border-2 border-destructive rounded-lg" : ""}`}>
                      {equipmentItems.map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.key}
                            checked={formData.equipment?.includes(item.label)}
                            onCheckedChange={(checked) => {
                              const current = formData.equipment || [];
                              updateField("equipment", checked ? [...current, item.label] : current.filter((e) => e !== item.label));
                            }}
                          />
                          <Label htmlFor={item.key} className="font-normal cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.equipment && <p className="text-xs text-destructive mt-1">{errors.equipment}</p>}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <Card className="p-8 animate-in">
              <h2 className="text-2xl font-bold mb-6">{t("start.step5Title")}</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="mealsPerDay">{t("start.mealsPerDay")}</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">{t("start.mealsPerDayHint")}</p>
                  <Select value={formData.mealsPerDay?.toString()} onValueChange={(value) => updateField("mealsPerDay", parseInt(value))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t("start.choose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{t("start.mealsPerDayOption", { n })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="hasBreakfast" checked={formData.hasBreakfast} onCheckedChange={(checked) => updateField("hasBreakfast", checked)} />
                  <Label htmlFor="hasBreakfast" className="font-normal cursor-pointer">{t("start.hasBreakfast")}</Label>
                </div>

                <div>
                  <Label htmlFor="allergies">{t("start.allergies")}</Label>
                  <Textarea id="allergies" placeholder={t("start.allergiesPlaceholder")} value={formData.allergies || ""} onChange={(e) => updateField("allergies", e.target.value)} className="mt-2" rows={2} />
                </div>

                <div>
                  <Label htmlFor="restrictions">{t("start.restrictions")}</Label>
                  <Textarea id="restrictions" placeholder={t("start.restrictionsPlaceholder")} value={formData.restrictions || ""} onChange={(e) => updateField("restrictions", e.target.value)} className="mt-2" rows={2} />
                </div>

                <div>
                  <Label htmlFor="healthConditions">{t("start.healthConditions")}</Label>
                  <Textarea id="healthConditions" placeholder={t("start.healthConditionsPlaceholder")} value={formData.healthConditions || ""} onChange={(e) => updateField("healthConditions", e.target.value)} className="mt-2" rows={2} />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t("start.medicalWarning") }} />
                </div>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={loading || step === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("start.back")}
            </Button>
            <Button onClick={handleNext} disabled={loading || !isStepValid} className={`${!isStepValid ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading ? t("start.loading") : step === totalSteps ? t("start.seePlan") : t("start.next")}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {!isStepValid && step < 5 && (
            <p className="text-sm text-destructive text-center mt-4">{t("start.fillRequiredHint")}</p>
          )}
        </div>
      </div>

      <InstallAppPrompt trigger="start" />
    </>
  );
};
export default Start;
