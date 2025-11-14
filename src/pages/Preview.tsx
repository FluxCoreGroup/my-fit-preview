import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { nutritionPlanner, type OnboardingInput, type NutritionPreview } from "@/services/planner";
import { useNavigate } from "react-router-dom";
import { Utensils, Info, BarChart3, Calculator, Flame, Target, Droplets, Dumbbell, CheckCircle2, PartyPopper, Rocket, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";
const loadingSteps = [{
  progress: 0,
  text: "Analyse de ton profil...",
  icon: BarChart3
}, {
  progress: 15,
  text: "Calcul du BMI et BMR...",
  icon: Calculator
}, {
  progress: 35,
  text: "Estimation du TDEE selon ton activité...",
  icon: Flame
}, {
  progress: 50,
  text: "Détermination de la cible calorique...",
  icon: Target
}, {
  progress: 65,
  text: "Optimisation des macronutriments...",
  icon: Utensils
}, {
  progress: 80,
  text: "Calcul de l'hydratation recommandée...",
  icon: Droplets
}, {
  progress: 95,
  text: "Finalisation de ton plan...",
  icon: Dumbbell
}, {
  progress: 100,
  text: "Ton plan est prêt !",
  icon: CheckCircle2
}];
const LoadingAnalysis = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(loadingSteps[0]);
  useEffect(() => {
    const totalDuration = 5000; // 5 secondes
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(elapsed / totalDuration * 100, 100);
      setProgress(calculatedProgress);

      // Update text based on progress
      const newStep = loadingSteps.reduce((acc, step) => {
        return calculatedProgress >= step.progress ? step : acc;
      }, loadingSteps[0]);
      setCurrentStep(newStep);
      if (calculatedProgress >= 100) {
        clearInterval(timer);
      }
    }, 150); // Update every 150ms for smooth animation

    return () => clearInterval(timer);
  }, []);
  const CurrentIcon = currentStep.icon;
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="text-center max-w-md px-4">
        {/* Animated spinner */}
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CurrentIcon className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Calcul de ton plan personnalisé</h2>
        
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out" style={{
            width: `${progress}%`
          }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
        </div>
        
        <p className="text-lg text-muted-foreground animate-pulse flex items-center justify-center gap-2">
          <CurrentIcon className="w-5 h-5" />
          {currentStep.text}
        </p>
      </div>
    </div>;
};
const Preview = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [input, setInput] = useState<OnboardingInput | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPreview | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<'loading' | 'results'>('loading');
  const [formattedHealthData, setFormattedHealthData] = useState<{
    allergies: string;
    restrictions: string;
    healthConditions: string;
  } | null>(null);
  const [isFormattingHealth, setIsFormattingHealth] = useState(false);
  useEffect(() => {
    const dataStr = localStorage.getItem("onboardingData");
    if (!dataStr) {
      navigate("/start");
      return;
    }
    try {
      const data: OnboardingInput = JSON.parse(dataStr);
      setInput(data);

      // Start 5-second loading avec parallélisation
      setTimeout(async () => {
        try {
          // Lancer le calcul nutrition et le formatage en parallèle
          const [nutrition] = await Promise.all([nutritionPlanner.getPreview(data),
          // Pré-charger le formatage si nécessaire
          data.allergies || data.restrictions || data.healthConditions ? supabase.functions.invoke('format-health-data', {
            body: {
              allergies: data.allergies || "",
              restrictions: data.restrictions || "",
              healthConditions: data.healthConditions || ""
            }
          }).then(({
            data: healthData,
            error
          }) => {
            if (!error && healthData) {
              setFormattedHealthData(healthData);
            }
          }) : Promise.resolve()]);
          setNutritionPlan(nutrition);
          setLoadingPhase('results');
        } catch (error) {
          console.error("Error generating preview:", error);
          // Fallback to demo mode should handle this, but in case of critical error
          navigate("/start");
        }
      }, 5000);
    } catch (error) {
      console.error("Error parsing onboarding data:", error);
      navigate("/start");
    }
  }, [navigate]);

  // Fallback si les données de santé n'ont pas été formatées pendant le chargement
  useEffect(() => {
    const formatHealthDataFallback = async () => {
      if (!input || loadingPhase !== 'results' || formattedHealthData) return;

      // Si déjà formaté pendant le chargement, ne rien faire
      if (formattedHealthData) return;

      // Ne formater que si au moins un champ est rempli
      if (!input.allergies && !input.restrictions && !input.healthConditions) {
        setFormattedHealthData({
          allergies: "Aucune allergie signalée",
          restrictions: "Aucune restriction alimentaire",
          healthConditions: "Aucune condition particulière"
        });
        return;
      }
      setIsFormattingHealth(true);
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('format-health-data', {
          body: {
            allergies: input.allergies || "",
            restrictions: input.restrictions || "",
            healthConditions: input.healthConditions || ""
          }
        });
        if (error) throw error;
        if (data) {
          setFormattedHealthData(data);
        }
      } catch (error) {
        console.error('Erreur lors du formatage des données santé:', error);
        // Fallback : afficher les données brutes
        setFormattedHealthData({
          allergies: input.allergies || "Aucune allergie signalée",
          restrictions: input.restrictions || "Aucune restriction alimentaire",
          healthConditions: input.healthConditions || "Aucune condition particulière"
        });
      } finally {
        setIsFormattingHealth(false);
      }
    };
    formatHealthDataFallback();
  }, [input, loadingPhase, formattedHealthData]);
  const handleCreateAccount = () => {
    if (user) {
      // Déjà connecté → aller directement à la séance
      navigate("/session");
    } else {
      // Pas connecté → afficher le toast puis rediriger
      toast({
        title: "Plan nutrition calculé ! 🎉",
        description: "Crée ton compte pour continuer"
      });
      // Petite pause pour laisser voir le toast
      setTimeout(() => navigate("/signup"), 800);
    }
  };
  if (loadingPhase === 'loading' || !nutritionPlan || !input) {
    return <LoadingAnalysis />;
  }
  return <TooltipProvider>
      <Header variant="onboarding" showBack onBack={() => navigate("/start")} />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center animate-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Ton analyse personnalisée</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Voici ton plan nutrition détaillé basé sur tes réponses
            </p>
          </div>

          {/* Métriques de base */}
          <Card className="p-6 border-2 border-primary/20 animate-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Utensils className="w-7 h-7 text-primary" />
              Tes métriques de base
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* BMI */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    IMC (Indice de Masse Corporelle)
                  </div>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      L'IMC est un indicateur rapide pour évaluer si ton poids est adapté à ta taille. 
                      Formule : poids (kg) ÷ taille² (m). Entre 18.5 et 25 = Normal.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{nutritionPlan.bmi}</div>
                <div className="text-sm text-muted-foreground">{nutritionPlan.bmiCategory}</div>
              </Card>

              {/* TDEE */}
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    TDEE (Dépense Énergétique Totale)
                  </div>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Le TDEE est le nombre de calories que tu brûles chaque jour (métabolisme de base + activité).
                      C'est la base pour calculer ton objectif calorique.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-4xl font-bold text-secondary mb-1">{nutritionPlan.tdee} kcal</div>
                <div className="text-sm text-muted-foreground">Besoin énergétique journalier</div>
              </Card>
            </div>
          </Card>

          {/* Cible personnalisée */}
          <Card className="p-6 animate-in">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Ta cible calorique journalière</h3>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  Pour {input.goal === 'weight-loss' ? 'perdre du poids' : input.goal === 'muscle-gain' ? 'prendre du muscle' : 'te maintenir'}, 
                  on applique {nutritionPlan.deficit !== 0 ? `un ${nutritionPlan.deficit > 0 ? 'déficit' : 'surplus'} de ${Math.abs(nutritionPlan.deficit)} kcal/jour` : 'ton TDEE exact'}
                  {nutritionPlan.deficit !== 0 && ` (soit ~${Math.round(Math.abs(nutritionPlan.deficit) / nutritionPlan.tdee * 100)}% de ton TDEE)`}.
                  C'est un rythme sain et durable.
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="text-5xl font-bold text-center text-primary mb-2">
              {nutritionPlan.calories} kcal
            </div>
            {nutritionPlan.deficit !== 0 && <div className="text-center text-muted-foreground text-sm mb-6">
                {nutritionPlan.deficit > 0 ? '−' : '+'}{Math.abs(nutritionPlan.deficit)} kcal par rapport à ton TDEE
              </div>}

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4 text-center bg-muted/30">
                <div className="text-3xl font-bold text-secondary mb-1">{nutritionPlan.macros.protein}g</div>
                <div className="text-sm text-muted-foreground">Protéines</div>
                <div className="text-xs text-muted-foreground mt-1">1.8g/kg</div>
              </Card>
              <Card className="p-4 text-center bg-muted/30">
                <div className="text-3xl font-bold text-accent mb-1">{nutritionPlan.macros.carbs}g</div>
                <div className="text-sm text-muted-foreground">Glucides</div>
                <div className="text-xs text-muted-foreground mt-1">Énergie</div>
              </Card>
              <Card className="p-4 text-center bg-muted/30">
                <div className="text-3xl font-bold text-accent mb-1">{nutritionPlan.macros.fat}g</div>
                <div className="text-sm text-muted-foreground">Lipides</div>
                <div className="text-xs text-muted-foreground mt-1">0.8g/kg</div>
              </Card>
            </div>
          </Card>

          {/* Profil santé et nutrition */}
          <Card className="p-6 animate-in">
            <h3 className="text-xl font-bold mb-4">Ton profil santé et nutrition</h3>
            
            {isFormattingHealth ? <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Formatage des données...</span>
              </div> : formattedHealthData ? <div className="space-y-3">
                <div>
                  <span className="font-semibold">Allergies/Intolérances :</span>{" "}
                  <span className="text-muted-foreground">
                    {formattedHealthData.allergies}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Aliments à éviter :</span>{" "}
                  <span className="text-muted-foreground">
                    {formattedHealthData.restrictions}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Conditions de santé :</span>{" "}
                  <span className="text-muted-foreground">
                    {formattedHealthData.healthConditions}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Repas par jour :</span>{" "}
                  <span className="text-muted-foreground">{input.mealsPerDay} repas</span>
                </div>
              </div> : <div className="space-y-3">
                <div>
                  <span className="font-semibold">Allergies/Intolérances :</span>{" "}
                  <span className="text-muted-foreground">
                    {input.allergies || "Aucune allergie signalée"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Aliments à éviter :</span>{" "}
                  <span className="text-muted-foreground">
                    {input.restrictions || "Aucune restriction alimentaire"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Conditions de santé :</span>{" "}
                  <span className="text-muted-foreground">
                    {input.healthConditions || "Aucune condition particulière"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Repas par jour :</span>{" "}
                  <span className="text-muted-foreground">{input.mealsPerDay} repas</span>
                </div>
              </div>}
          </Card>

          {/* Recommandations complémentaires */}
          <div className="grid md:grid-cols-2 gap-4 animate-in">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                Fibres recommandées
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{nutritionPlan.fiber}g/jour</div>
              <div className="text-xs text-muted-foreground mt-1">
                Pour une digestion optimale
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Hydratation
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(nutritionPlan.hydration / 1000).toFixed(1)}L/jour
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Eau + boissons non sucrées
              </div>
            </Card>
          </div>

          {/* CTA intermédiaire */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 animate-in">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full mb-2">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Offre de lancement</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <PartyPopper className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">Ton plan est prêt !</h3>
              </div>
              <p className="text-muted-foreground">
                Continue la création de ton programme personnalisé complet
              </p>
              <Button size="lg" onClick={() => {
              localStorage.setItem("hasSeenPreview", "true");
              navigate("/tarif");
            }} className="gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-all">
                Continuer la création de mon programme personnalisé
              </Button>
              <p className="text-sm text-muted-foreground">
                Essai gratuit 7 jours • Sans engagement • Accès immédiat
              </p>
            </div>
          </Card>

          {/* Exemple de journée */}
          

          {/* Explication */}
          

          {/* CTA */}
          
        </div>
      </div>
    </TooltipProvider>;
};
export default Preview;