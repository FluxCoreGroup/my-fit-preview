import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Apple, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNutrition } from "@/hooks/useNutrition";
import { useNutritionPlan } from "@/hooks/useNutritionPlan";
import { NutritionSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { HydrationTracker } from "@/components/nutrition/HydrationTracker";
import { RecipeLibrary } from "@/components/nutrition/RecipeLibrary";
import { NutritionAnalytics } from "@/components/nutrition/NutritionAnalytics";
import { ShareNutritionButton } from "@/components/nutrition/ShareNutritionButton";
import { IntegrationBadges } from "@/components/nutrition/IntegrationBadges";
import { useState } from "react";

const Nutrition = () => {
  const { 
    bmi, bmr, tdee, targetCalories, macros, 
    fiber, mealDistribution, hydrationGoal, macroTiming, bodyFat, micronutrients,
    goals, isLoading 
  } = useNutrition();
  
  const { plans, isRegenerating, generatePlan } = useNutritionPlan();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="pt-20 px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Apple className="w-5 h-5 text-secondary" />
            </div>
            <h1 className="text-xl font-bold">Ma nutrition</h1>
          </div>
          <div className="max-w-4xl mx-auto">
            <NutritionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <BackButton to="/hub" label="Retour au Hub" />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <EmptyState
              icon={Apple}
              title="Paramètres nutritionnels manquants"
              description="Renseigne tes informations dans les paramètres pour voir tes calculs nutritionnels personnalisés"
              action={{ label: "Aller aux paramètres", to: "/settings" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <Apple className="w-5 h-5 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">Ma nutrition</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Basic Metrics */}
          <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
            <h2 className="text-sm font-bold mb-3">Mes calculs de base</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">IMC</p>
                <p className="text-xl font-bold">{bmi || "-"}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">BMR</p>
                <p className="text-xl font-bold">{bmr ? `${bmr}` : "-"}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">TDEE</p>
                <p className="text-xl font-bold">{tdee ? `${tdee}` : "-"}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Objectif</p>
                <p className="text-xl font-bold text-primary">{targetCalories ? `${targetCalories}` : "-"}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
            </div>

            {macros && (
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2">Macros par jour</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-background/30">
                    <div className="text-xl font-bold text-primary">{macros.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protéines</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/30">
                    <div className="text-xl font-bold text-accent">{macros.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Glucides</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/30">
                    <div className="text-xl font-bold text-secondary">{macros.fat}g</div>
                    <div className="text-xs text-muted-foreground">Lipides</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Advanced Metrics - Collapsible */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                <h2 className="text-sm font-bold">Métriques avancées</h2>
                <Badge variant="outline" className="text-xs">
                  {advancedOpen ? "Réduire" : "Afficher"}
                </Badge>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-muted-foreground">Fibres/jour</p>
                      <p className="font-semibold">{fiber || "-"}g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-muted-foreground">% Masse grasse</p>
                      <p className="font-semibold">{bodyFat || "-"}%</p>
                    </div>
                  </div>

                  {mealDistribution && (
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">Répartition calorique optimale</p>
                      <div className="flex gap-2 text-xs">
                        {Object.entries(mealDistribution).map(([meal, percent]) => (
                          <Badge key={meal} variant="outline" className="text-xs">
                            {meal}: {percent}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {macroTiming && (
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">Timing des macros</p>
                      <div className="text-xs space-y-1">
                        <p>• Pré-workout: {macroTiming.preWorkout.carbs}g G + {macroTiming.preWorkout.protein}g P</p>
                        <p>• Post-workout: {macroTiming.postWorkout.carbs}g G + {macroTiming.postWorkout.protein}g P</p>
                      </div>
                    </div>
                  )}

                  {micronutrients && (
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground mb-1">Micronutriments clés</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <p>• Fer: {micronutrients.iron}</p>
                        <p>• Calcium: {micronutrients.calcium}</p>
                        <p>• Vit. D: {micronutrients.vitaminD}</p>
                        <p>• Oméga-3: {micronutrients.omega3}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 7-Day Meal Plan */}
          <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">Plan alimentaire 7 jours</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generatePlan}
                disabled={isRegenerating}
                className="h-8 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating ? "..." : "Regénérer"}
              </Button>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">Génère ton premier plan sur 7 jours</p>
                <Button onClick={generatePlan} size="sm">Générer maintenant</Button>
              </div>
            ) : (
              <Tabs defaultValue="1">
                <TabsList className="w-full grid grid-cols-7 h-9">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <TabsTrigger key={day} value={day.toString()} className="text-xs">
                      J{day}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {plans.map(plan => (
                  <TabsContent key={plan.day} value={plan.day.toString()} className="space-y-2 mt-3">
                    {plan.meals.map((meal, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-semibold text-xs">{meal.name}</h3>
                            <p className="text-xs text-muted-foreground">{meal.food}</p>
                          </div>
                          <span className="text-xs font-semibold">{meal.kcal} kcal</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          P: {meal.p}g • F: {meal.f}g • G: {meal.g}g
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </Card>

          {/* Hydration Tracker */}
          <HydrationTracker goalMl={hydrationGoal || 2500} />

          {/* Recipe Library */}
          <RecipeLibrary />

          {/* Analytics Dashboard */}
          <NutritionAnalytics />

          {/* Share & Integrations */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
              <h3 className="text-sm font-bold mb-3">Partage</h3>
              <ShareNutritionButton 
                targetCalories={targetCalories || undefined}
                protein={macros?.protein}
                carbs={macros?.carbs}
                fats={macros?.fat}
              />
            </Card>
            
            <IntegrationBadges />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
