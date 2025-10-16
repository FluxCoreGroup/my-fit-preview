import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { nutritionPlanner, trainingPlanner, type OnboardingInput, type NutritionPreview, type TrainingPreview } from "@/services/planner";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, Dumbbell, ChevronRight, Info } from "lucide-react";

const Preview = () => {
  const navigate = useNavigate();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPreview | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataStr = localStorage.getItem("onboardingData");
    if (!dataStr) {
      navigate("/start");
      return;
    }

    try {
      const data: OnboardingInput = JSON.parse(dataStr);
      
      // Générer les plans avec les services placeholders
      const nutrition = nutritionPlanner.getPreview(data);
      const training = trainingPlanner.getPreview(data);
      
      setNutritionPlan(nutrition);
      setTrainingPlan(training);
      setLoading(false);
    } catch (error) {
      console.error("Error generating preview:", error);
      navigate("/start");
    }
  }, [navigate]);

  if (loading || !nutritionPlan || !trainingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Génération de ton plan personnalisé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-in">
          <h1 className="text-4xl font-bold mb-4">Ton aperçu personnalisé 🎯</h1>
          <p className="text-lg text-muted-foreground">
            Voici un aperçu de ce que Pulse.ai peut faire pour toi. Ce n'est qu'un début !
          </p>
        </div>

        {/* Nutrition Plan */}
        <Card className="p-8 animate-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Ton plan nutrition</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Calories/jour</div>
              <div className="text-2xl font-bold text-primary">{nutritionPlan.calories} kcal</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Protéines</div>
              <div className="text-2xl font-bold text-secondary">{nutritionPlan.macros.protein}g</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Glucides / Lipides</div>
              <div className="text-2xl font-bold text-accent">{nutritionPlan.macros.carbs}g / {nutritionPlan.macros.fat}g</div>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Exemple de journée type</h3>
            <div className="space-y-3">
              {nutritionPlan.sampleDay.map((meal, i) => (
                <Card key={i} className="p-4 bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{meal.meal}</div>
                    <div className="text-sm text-muted-foreground">~{meal.approxCalories} kcal</div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {meal.foods.map((food, j) => (
                      <li key={j}>• {food}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{nutritionPlan.explanation}</p>
            </div>
          </div>
        </Card>

        {/* Training Plan */}
        <Card className="p-8 animate-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold">Ton programme d'entraînement</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Type de programme</div>
              <div className="text-xl font-bold">{trainingPlan.splitType}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">Durée estimée</div>
              <div className="text-xl font-bold">{trainingPlan.totalDuration} minutes</div>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">{trainingPlan.sessionName}</h3>
            <div className="space-y-3">
              {trainingPlan.exercises.slice(0, 3).map((ex, i) => (
                <Card key={i} className="p-4 bg-background">
                  <div className="font-semibold mb-2">{ex.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">{ex.sets}</span> séries</div>
                    <div><span className="font-medium">{ex.reps}</span> reps</div>
                    <div><span className="font-medium">{ex.rest}s</span> repos</div>
                  </div>
                </Card>
              ))}
              <p className="text-sm text-muted-foreground text-center py-2">
                + {trainingPlan.exercises.length - 3} autres exercices détaillés
              </p>
            </div>
          </div>

          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{trainingPlan.explanation}</p>
            </div>
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="hero" onClick={() => navigate("/session")} className="text-lg">
            Lancer ma séance gratuite
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto">
              Créer mon compte
            </Button>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          La séance gratuite ne nécessite pas de compte. Tu peux créer ton compte après pour débloquer tout le programme !
        </p>
      </div>
    </div>
  );
};

export default Preview;
