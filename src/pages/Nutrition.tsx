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

const Nutrition = () => {
  const { 
    bmi, bmr, tdee, targetCalories, macros, 
    fiber, mealDistribution, hydrationGoal, macroTiming, bodyFat, micronutrients,
    goals, isLoading 
  } = useNutrition();
  
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
          <TooltipProvider>
            {/* Basic Metrics */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
              <h2 className="text-lg font-bold mb-4">📊 Mes calculs de base</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Indice de Masse Corporelle - Ratio poids/taille²</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold">{bmi || "-"}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-muted-foreground">BMR</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Métabolisme de base - Calories brûlées au repos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold">{bmr ? `${bmr}` : "-"}</p>
                  <p className="text-xs text-muted-foreground">kcal/jour</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-muted-foreground">TDEE</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Dépense énergétique totale - BMR × activité</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold">{tdee ? `${tdee}` : "-"}</p>
                  <p className="text-xs text-muted-foreground">kcal/jour</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-muted-foreground">Objectif</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Calories cibles selon ton objectif (déficit/surplus/maintenance)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-primary">{targetCalories ? `${targetCalories}` : "-"}</p>
                  <p className="text-xs text-muted-foreground">kcal/jour</p>
                </div>
              </div>

              {macros && (
                <div className="mt-6">
                  <p className="text-sm font-semibold mb-3">Macros par jour</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all">
                      <div className="text-2xl font-bold text-primary">{macros.protein}g</div>
                      <div className="text-xs text-muted-foreground mt-1">Protéines</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-all">
                      <div className="text-2xl font-bold text-accent">{macros.carbs}g</div>
                      <div className="text-xs text-muted-foreground mt-1">Glucides</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20 hover:bg-secondary/15 transition-all">
                      <div className="text-2xl font-bold text-secondary">{macros.fat}g</div>
                      <div className="text-xs text-muted-foreground mt-1">Lipides</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Advanced Metrics - Collapsible */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
                <CollapsibleTrigger className="w-full p-6 flex justify-between items-center">
                  <h2 className="text-lg font-bold">🔬 Métriques avancées</h2>
                  <Badge variant="outline" className="text-xs border-primary/30">
                    {advancedOpen ? "Réduire" : "Afficher"}
                  </Badge>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-xs text-muted-foreground">Fibres/jour</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Recommandation : 14g par 1000 kcal</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-lg font-semibold">{fiber || "-"}g</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-xs text-muted-foreground">% Masse grasse</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Estimé via formule Deurenberg (IMC + âge + sexe)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-lg font-semibold">{bodyFat || "-"}%</p>
                      </div>
                    </div>

                    {mealDistribution && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2">
                          <p className="text-xs text-muted-foreground">Répartition calorique</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Distribution optimale selon tes {goals?.meals_per_day || 3} repas/jour</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(mealDistribution).map(([meal, percent]) => (
                            <Badge key={meal} variant="outline" className="text-xs border-primary/30">
                              {meal}: {percent}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {macroTiming && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2">
                          <p className="text-xs text-muted-foreground">Timing macros</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Nutriments prioritaires pré/post-workout</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-xs space-y-1">
                          <p>• Pré-workout: {macroTiming.preWorkout.carbs}g G + {macroTiming.preWorkout.protein}g P</p>
                          <p>• Post-workout: {macroTiming.postWorkout.carbs}g G + {macroTiming.postWorkout.protein}g P</p>
                        </div>
                      </div>
                    )}

                    {micronutrients && (
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
                        <div className="flex items-center gap-1 mb-2">
                          <p className="text-xs text-muted-foreground">Micronutriments clés</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Apports journaliers recommandés selon ton profil</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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

            {/* Meal Generator */}
            <MealGenerator />

            {/* Body Metrics Tracker */}
            <BodyMetricsTracker />

            {/* Hydration Tracker */}
            <HydrationTracker goalMl={hydrationGoal || 2500} />

            {/* Recipe Library */}
            <RecipeLibrary />

            {/* Share & Integrations */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
                <h3 className="text-sm font-bold mb-3">📤 Partage</h3>
                <ShareNutritionButton 
                  targetCalories={targetCalories || undefined}
                  protein={macros?.protein}
                  carbs={macros?.carbs}
                  fats={macros?.fat}
                  goalType={goals?.goal_type}
                />
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
