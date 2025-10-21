import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Apple, RefreshCw, Droplet } from "lucide-react";
import { useNutrition } from "@/hooks/useNutrition";
import { NutritionSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";

const Nutrition = () => {
  const { bmi, bmr, tdee, targetCalories, macros, goals, isLoading } = useNutrition();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label="Retour au Hub" />
        <div className="pt-20 px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <Apple className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold">Ma nutrition</h1>
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Apple className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Ma nutrition</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Calculs */}
          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
            <h2 className="text-xl font-bold mb-4">Mes calculs</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">IMC</p>
                <p className="text-2xl font-bold">{bmi || "-"}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">BMR</p>
                <p className="text-2xl font-bold">{bmr ? `${bmr} kcal` : "-"}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">TDEE</p>
                <p className="text-2xl font-bold">{tdee ? `${tdee} kcal` : "-"}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Objectif</p>
                <p className="text-2xl font-bold">{targetCalories ? `${targetCalories} kcal` : "-"}</p>
              </div>
            </div>

            {macros && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-3">Macros par jour</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{macros.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protéines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{macros.fat}g</div>
                    <div className="text-xs text-muted-foreground">Lipides</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{macros.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Glucides</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Journées types */}
          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Journées types</h2>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regénérer
              </Button>
            </div>

            <Tabs defaultValue="1">
              <TabsList className="w-full">
                <TabsTrigger value="1" className="flex-1">Jour 1</TabsTrigger>
                <TabsTrigger value="2" className="flex-1">Jour 2</TabsTrigger>
                <TabsTrigger value="3" className="flex-1">Jour 3</TabsTrigger>
              </TabsList>

              <TabsContent value="1" className="space-y-3 mt-4">
                {[
                  { meal: "Petit-déjeuner", food: "Flocons d'avoine + fruits + amandes", kcal: 350, p: 12, f: 8, g: 55 },
                  { meal: "Déjeuner", food: "Poulet grillé + riz basmati + légumes", kcal: 600, p: 45, f: 12, g: 70 },
                  { meal: "Dîner", food: "Saumon + quinoa + brocolis", kcal: 550, p: 40, f: 18, g: 50 },
                  { meal: "Snack", food: "Fromage blanc 0% + banane", kcal: 200, p: 20, f: 2, g: 30 },
                ].map((meal, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-background/50 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{meal.meal}</h3>
                        <p className="text-sm text-muted-foreground">{meal.food}</p>
                      </div>
                      <span className="text-sm font-semibold">{meal.kcal} kcal</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      P: {meal.p}g • F: {meal.f}g • G: {meal.g}g
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="2" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">Variante à générer...</p>
              </TabsContent>

              <TabsContent value="3" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">Variante à générer...</p>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Hydratation */}
          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Hydratation</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Objectif quotidien</span>
                <span className="font-semibold">2.5L</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                💡 Bois environ 30-35ml par kg de poids corporel
              </p>
            </div>
          </Card>

          {/* Recettes */}
          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
            <h2 className="text-xl font-bold mb-4">Recettes adaptées</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Utilise Julie, notre nutritionniste IA, pour obtenir des recettes personnalisées
            </p>
            <Button variant="outline" className="w-full">
              Parler à Julie →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
