import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { nutritionPlanner, type OnboardingInput, type NutritionPreview } from "@/services/planner";
import { useNavigate } from "react-router-dom";
import { Utensils, Info, BarChart3, Calculator, Flame, Target, Droplets, Dumbbell, CheckCircle2, PartyPopper, Loader2, ArrowRight, AlertCircle, Apple, HeartPulse, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const LoadingAnalysis = () => {
  const { t } = useTranslation("onboarding");
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { progress: 0, text: t("preview.loadingSteps.profile"), icon: BarChart3 },
    { progress: 15, text: t("preview.loadingSteps.bmi"), icon: Calculator },
    { progress: 35, text: t("preview.loadingSteps.tdee"), icon: Flame },
    { progress: 50, text: t("preview.loadingSteps.calories"), icon: Target },
    { progress: 65, text: t("preview.loadingSteps.macros"), icon: Utensils },
    { progress: 80, text: t("preview.loadingSteps.hydration"), icon: Droplets },
    { progress: 95, text: t("preview.loadingSteps.finalize"), icon: Dumbbell },
    { progress: 100, text: t("preview.loadingSteps.ready"), icon: CheckCircle2 },
  ];

  const [currentStep, setCurrentStep] = useState(loadingSteps[0]);

  useEffect(() => {
    const totalDuration = 5000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(elapsed / totalDuration * 100, 100);
      setProgress(calculatedProgress);
      const newStep = loadingSteps.reduce((acc, step) => {
        return calculatedProgress >= step.progress ? step : acc;
      }, loadingSteps[0]);
      setCurrentStep(newStep);
      if (calculatedProgress >= 100) clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = currentStep.icon;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="text-center max-w-md px-4">
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CurrentIcon className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">{t("preview.analysisTitle")}</h2>
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
        </div>
        <p className="text-lg text-muted-foreground animate-pulse flex items-center justify-center gap-2">
          <CurrentIcon className="w-5 h-5" />
          {currentStep.text}
        </p>
      </div>
    </div>
  );
};

const Preview = () => {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState<OnboardingInput | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPreview | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<'loading' | 'results'>('loading');
  const [formattedHealthData, setFormattedHealthData] = useState<{ allergies: string; restrictions: string; healthConditions: string; } | null>(null);
  const [isFormattingHealth, setIsFormattingHealth] = useState(false);

  useEffect(() => {
    const dataStr = localStorage.getItem("onboardingData");
    if (!dataStr) { navigate("/start"); return; }
    try {
      const data: OnboardingInput = JSON.parse(dataStr);
      setInput(data);
      setTimeout(async () => {
        try {
          const [nutrition] = await Promise.all([
            nutritionPlanner.getPreview(data),
            data.allergies || data.restrictions || data.healthConditions
              ? supabase.functions.invoke('format-health-data', {
                  body: { allergies: data.allergies || "", restrictions: data.restrictions || "", healthConditions: data.healthConditions || "" }
                }).then(({ data: healthData, error }) => { if (!error && healthData) setFormattedHealthData(healthData); })
              : Promise.resolve()
          ]);
          setNutritionPlan(nutrition);
          setLoadingPhase('results');
        } catch (error) {
          console.error("Error generating preview:", error);
          navigate("/start");
        }
      }, 5000);
    } catch (error) {
      console.error("Error parsing onboarding data:", error);
      navigate("/start");
    }
  }, [navigate]);

  useEffect(() => {
    const formatHealthDataFallback = async () => {
      if (!input || loadingPhase !== 'results' || formattedHealthData) return;
      if (!input.allergies && !input.restrictions && !input.healthConditions) {
        setFormattedHealthData({
          allergies: t("preview.noAllergies"),
          restrictions: t("preview.noRestrictions"),
          healthConditions: t("preview.noConditions")
        });
        return;
      }
      setIsFormattingHealth(true);
      try {
        const { data, error } = await supabase.functions.invoke('format-health-data', {
          body: { allergies: input.allergies || "", restrictions: input.restrictions || "", healthConditions: input.healthConditions || "" }
        });
        if (error) throw error;
        if (data) setFormattedHealthData(data);
      } catch (error) {
        console.error('Error formatting health data:', error);
        setFormattedHealthData({
          allergies: input.allergies || t("preview.noAllergies"),
          restrictions: input.restrictions || t("preview.noRestrictions"),
          healthConditions: input.healthConditions || t("preview.noConditions")
        });
      } finally {
        setIsFormattingHealth(false);
      }
    };
    formatHealthDataFallback();
  }, [input, loadingPhase, formattedHealthData, t]);

  const handleCreateAccount = () => {
    if (user) {
      navigate("/session");
    } else {
      toast({ title: t("preview.planCalculated"), description: t("preview.createAccountToContinue") });
      setTimeout(() => navigate("/signup"), 800);
    }
  };

  if (loadingPhase === 'loading' || !nutritionPlan || !input) {
    return <LoadingAnalysis />;
  }

  const getGoalLabel = () => {
    if (input.goal?.includes("weight-loss")) return t("preview.goalLabels.weight-loss");
    if (input.goal?.includes("muscle-gain")) return t("preview.goalLabels.muscle-gain");
    return t("preview.goalLabels.maintenance");
  };

  return (
    <TooltipProvider>
      <Header variant="onboarding" showBack onBack={() => navigate("/start")} />
      <div className="min-h-screen bg-muted/30 py-4 md:py-6 lg:py-30 px-4 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
          <div className="text-center animate-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BarChart3 className="w-6 h-6 md:w-10 md:h-10 text-primary" />
              <h1 className="text-2xl md:text-4xl font-bold">{t("preview.title")}</h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground">{t("preview.subtitle")}</p>
          </div>

          <Card className="p-4 md:p-6 border-2 border-primary/20 animate-in">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Utensils className="w-5 h-5 md:w-7 md:h-7 text-primary" />
              {t("preview.baseMetrics")}
            </h2>
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-muted-foreground">{t("preview.bmi")}</div>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs">{t("preview.bmiTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{nutritionPlan.bmi}</div>
                <div className="text-sm text-muted-foreground">{nutritionPlan.bmiCategory}</div>
              </Card>

              <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-muted-foreground">{t("preview.tdee")}</div>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs">{t("preview.tdeeTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{nutritionPlan.tdee} kcal</div>
                <div className="text-sm text-muted-foreground">{t("preview.dailyNeed")}</div>
              </Card>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-primary/20 animate-in">
            <div className="text-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                {t("preview.caloricTarget")}
              </h2>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{nutritionPlan.calories} kcal</div>
              <p className="text-sm text-muted-foreground">{t("preview.adjustedGoal", { goal: getGoalLabel() })}</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-center">{t("preview.macroDistribution")}</h3>
              <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6">
                <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{nutritionPlan.macros.protein}g</div>
                  <div className="text-xs text-muted-foreground">{t("preview.proteins")}</div>
                </Card>
                <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-400/10 to-blue-500/10 border-blue-400/20">
                  <div className="text-2xl md:text-3xl font-bold text-blue-500 dark:text-blue-300 mb-1">{nutritionPlan.macros.carbs}g</div>
                  <div className="text-xs text-muted-foreground">{t("preview.carbs")}</div>
                </Card>
                <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-300/10 to-blue-400/10 border-blue-300/20">
                  <div className="text-2xl md:text-3xl font-bold text-blue-400 dark:text-blue-200 mb-1">{nutritionPlan.macros.fat}g</div>
                  <div className="text-xs text-muted-foreground">{t("preview.fats")}</div>
                </Card>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 animate-in overflow-hidden">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              {t("preview.healthProfile")}
            </h3>
            {isFormattingHealth ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground text-sm">{t("preview.formattingData")}</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="allergies" className="border-b border-border/50">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      {t("preview.allergies")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{formattedHealthData?.allergies || input.allergies || t("preview.noAllergies")}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="restrictions" className="border-b border-border/50">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Apple className="w-4 h-4 text-red-500" />
                      {t("preview.restrictions")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{formattedHealthData?.restrictions || input.restrictions || t("preview.noRestrictions")}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="health" className="border-b border-border/50">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HeartPulse className="w-4 h-4 text-primary" />
                      {t("preview.healthConditions")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{formattedHealthData?.healthConditions || input.healthConditions || t("preview.noConditions")}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="meals" className="border-none">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <UtensilsCrossed className="w-4 h-4 text-green-500" />
                      {t("preview.mealsPerDay")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <p className="text-sm text-muted-foreground">{t("preview.dailyMeals", { count: input.mealsPerDay })}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4 animate-in">
            <Card className="p-3 md:p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-sm font-medium text-primary mb-1">{t("preview.fiber")}</div>
              <div className="text-2xl md:text-3xl font-bold text-primary">{t("preview.fiberUnit", { amount: nutritionPlan.fiber })}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("preview.fiberDesc")}</div>
            </Card>
            <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t("preview.hydration")}</div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{t("preview.hydrationUnit", { amount: (nutritionPlan.hydration / 1000).toFixed(1) })}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("preview.hydrationDesc")}</div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 animate-in">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="flex items-center justify-center gap-2">
                <PartyPopper className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold">{t("preview.planReady")}</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">{t("preview.planReadyDesc")}</p>
              <Button
                onClick={() => { localStorage.setItem("hasSeenPreview", "true"); navigate("/tarif"); }}
                className="w-full h-14 md:h-16 rounded-full gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-all flex items-center justify-center px-2 md:px-6"
              >
                <ArrowRight className="w-full h-8 md:h-10" />
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground">{t("preview.freeTrial")}</p>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
export default Preview;
