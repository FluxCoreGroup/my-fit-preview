import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNutrition } from "@/hooks/useNutrition";
import { NutritionSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { HydrationTracker } from "@/components/nutrition/HydrationTracker";
import { RecipeLibrary } from "@/components/nutrition/RecipeLibrary";
import { ShareNutritionButton } from "@/components/nutrition/ShareNutritionButton";
import { IntegrationBadges } from "@/components/nutrition/IntegrationBadges";
import { MealGenerator } from "@/components/nutrition/MealGenerator";
import { BodyMetricsTracker } from "@/components/nutrition/BodyMetricsTracker";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Nutrition = () => {
  const { t } = useTranslation("nutrition");
  const { bmi, bmr, tdee, targetCalories, macros, fiber, mealDistribution, hydrationGoal, macroTiming, bodyFat, micronutrients, goals, isLoading } = useNutrition();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <BackButton to="/hub" label={t("backToHub")} />
        <div className="pt-20 px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl"><Apple className="w-5 h-5 text-secondary" /></div>
            <h1 className="text-xl font-bold">{t("title")}</h1>
          </div>
          <div className="max-w-4xl mx-auto"><NutritionSkeleton /></div>
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <BackButton to="/hub" label={t("backToHub")} />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <EmptyState icon={Apple} title={t("missingParams")} description={t("missingParamsDesc")} action={{ label: t("goToSettings"), to: "/settings" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label={t("backToHub")} />
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/10 rounded-xl"><Apple className="w-5 h-5 text-secondary" /></div>
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          <TooltipProvider>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
              <h2 className="text-lg font-bold mb-4">{t("baseCalcs")}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: t("bmi"), tooltip: t("bmiTooltip"), value: bmi || "-" },
                  { label: t("bmr"), tooltip: t("bmrTooltip"), value: bmr ? `${bmr}` : "-", unit: t("kcalDay") },
                  { label: t("tdee"), tooltip: t("tdeeTooltip"), value: tdee ? `${tdee}` : "-", unit: t("kcalDay") },
                  { label: t("target"), tooltip: t("targetTooltip"), value: targetCalories ? `${targetCalories}` : "-", unit: t("kcalDay"), highlight: true },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{item.tooltip}</p></TooltipContent></Tooltip>
                    </div>
                    <p className={`text-2xl font-bold ${item.highlight ? "text-primary" : ""}`}>{item.value}</p>
                    {item.unit && <p className="text-xs text-muted-foreground">{item.unit}</p>}
                  </div>
                ))}
              </div>
              {macros && (
                <div className="mt-6">
                  <p className="text-sm font-semibold mb-3">{t("macrosPerDay")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20"><div className="text-2xl font-bold text-primary">{macros.protein}g</div><div className="text-xs text-muted-foreground mt-1">{t("proteins")}</div></div>
                    <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20"><div className="text-2xl font-bold text-accent">{macros.carbs}g</div><div className="text-xs text-muted-foreground mt-1">{t("carbs")}</div></div>
                    <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20"><div className="text-2xl font-bold text-secondary">{macros.fat}g</div><div className="text-xs text-muted-foreground mt-1">{t("fats")}</div></div>
                  </div>
                </div>
              )}
            </Card>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
                <CollapsibleTrigger className="w-full p-6 flex justify-between items-center">
                  <h2 className="text-lg font-bold">{t("advancedMetrics")}</h2>
                  <Badge variant="outline" className="text-xs border-primary/30">{advancedOpen ? t("hide") : t("show")}</Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-1"><p className="text-xs text-muted-foreground">{t("fiberDay")}</p><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{t("fiberTooltip")}</p></TooltipContent></Tooltip></div>
                        <p className="text-lg font-semibold">{fiber || "-"}g</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-1"><p className="text-xs text-muted-foreground">{t("bodyFat")}</p><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{t("bodyFatTooltip")}</p></TooltipContent></Tooltip></div>
                        <p className="text-lg font-semibold">{bodyFat || "-"}%</p>
                      </div>
                    </div>
                    {mealDistribution && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2"><p className="text-xs text-muted-foreground">{t("caloricDistribution")}</p><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{t("caloricDistributionTooltip", { meals: goals?.meals_per_day || 3 })}</p></TooltipContent></Tooltip></div>
                        <div className="flex gap-2 flex-wrap">{Object.entries(mealDistribution).map(([meal, percent]) => (<Badge key={meal} variant="outline" className="text-xs border-primary/30">{meal}: {percent}%</Badge>))}</div>
                      </div>
                    )}
                    {macroTiming && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2"><p className="text-xs text-muted-foreground">{t("macroTiming")}</p><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{t("macroTimingTooltip")}</p></TooltipContent></Tooltip></div>
                        <div className="text-xs space-y-1">
                          <p>• {t("preWorkout")}: {macroTiming.preWorkout.carbs}g G + {macroTiming.preWorkout.protein}g P</p>
                          <p>• {t("postWorkout")}: {macroTiming.postWorkout.carbs}g G + {macroTiming.postWorkout.protein}g P</p>
                        </div>
                      </div>
                    )}
                    {micronutrients && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2"><p className="text-xs text-muted-foreground">{t("micronutrients")}</p><Tooltip><TooltipTrigger><HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent><p className="text-xs">{t("micronutrientsTooltip")}</p></TooltipContent></Tooltip></div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <p>• {t("iron")}: {micronutrients.iron}</p>
                          <p>• {t("calcium")}: {micronutrients.calcium}</p>
                          <p>• {t("vitD")}: {micronutrients.vitaminD}</p>
                          <p>• {t("omega3")}: {micronutrients.omega3}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <MealGenerator />
            <BodyMetricsTracker />
            <HydrationTracker goalMl={hydrationGoal || 2500} />
            <RecipeLibrary />

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
                <h3 className="text-sm font-bold mb-3">{t("share")}</h3>
                <ShareNutritionButton targetCalories={targetCalories || undefined} protein={macros?.protein} carbs={macros?.carbs} fats={macros?.fat} goalType={goals?.goal_type} />
              </Card>
              <IntegrationBadges />
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
