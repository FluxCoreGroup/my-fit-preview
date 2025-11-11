import { useState, useEffect } from "react";
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

const Start = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, saveProgress } = useOnboarding();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState<Partial<OnboardingInput>>({
    age: undefined,
    sex: undefined,
    height: undefined,
    weight: undefined,
    goal: undefined,
    goalHorizon: undefined,
    targetWeightLoss: undefined,
    hasCardio: undefined,
    cardioFrequency: undefined,
    activityLevel: undefined,
    frequency: undefined,
    sessionDuration: undefined,
    location: undefined,
    equipment: [],
    allergies: "",
    restrictions: "",
    mealsPerDay: 3,
    hasBreakfast: true,
    healthConditions: "",
  });

  // Load saved progress on mount
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setFormData(prev => ({ ...prev, ...data }));
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof OnboardingInput, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveProgress(updated); // Save to localStorage
      return updated;
    });
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Vérifie si l'étape est valide SANS modifier le state (pour le bouton)
  const isStepValid = (): boolean => {
    switch(step) {
      case 1:
        return !!(formData.age && formData.age >= 15 && formData.age <= 100 &&
                  formData.sex &&
                  formData.height && formData.height >= 120 && formData.height <= 250 &&
                  formData.weight && formData.weight >= 30 && formData.weight <= 300);
      case 2:
        return !!(formData.goal && formData.goalHorizon &&
                  (formData.goal !== 'weight-loss' || !formData.targetWeightLoss || 
                   (formData.targetWeightLoss >= 1 && formData.targetWeightLoss <= 50)) &&
                  (formData.hasCardio === false || (formData.hasCardio === true && formData.cardioFrequency)));
      case 3:
        return !!formData.activityLevel;
      case 4:
        return !!(formData.frequency && formData.sessionDuration && formData.location && 
                  (formData.location === "gym" || (formData.equipment && formData.equipment.length > 0)));
      case 5:
        return true; // Toujours valide
      default:
        return false;
    }
  };

  // Validation par étape avec messages d'erreur (appelé au clic)
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch(step) {
      case 1:
        if (!formData.age || formData.age < 15 || formData.age > 100) newErrors.age = "Âge requis (15-100)";
        if (!formData.sex) newErrors.sex = "Sexe requis";
        if (!formData.height || formData.height < 120 || formData.height > 250) newErrors.height = "Taille requise (120-250cm)";
        if (!formData.weight || formData.weight < 30 || formData.weight > 300) newErrors.weight = "Poids requis (30-300kg)";
        break;
      case 2:
        if (!formData.goal) newErrors.goal = "Objectif requis";
        if (!formData.goalHorizon) newErrors.goalHorizon = "Période requise";
        if (formData.goal === 'weight-loss' && formData.targetWeightLoss && (formData.targetWeightLoss < 1 || formData.targetWeightLoss > 50)) {
          newErrors.targetWeightLoss = "Entre 1 et 50 kg";
        }
        if (formData.hasCardio === undefined) newErrors.hasCardio = "Réponds à la question sur le cardio";
        if (formData.hasCardio === true && !formData.cardioFrequency) newErrors.cardioFrequency = "Fréquence requise";
        break;
      case 3:
        if (!formData.activityLevel) newErrors.activityLevel = "Niveau d'activité requis";
        break;
      case 4:
        if (!formData.frequency) newErrors.frequency = "Fréquence requise";
        if (!formData.sessionDuration) newErrors.sessionDuration = "Durée requise";
        if (!formData.location) newErrors.location = "Lieu requis";
        if (formData.location === "home" && (!formData.equipment || formData.equipment.length === 0)) {
          newErrors.equipment = "Sélectionne au moins un équipement";
        }
        break;
      case 5:
        // Étape 5 est toujours valide (champs pré-remplis et optionnels)
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      if (validateStep()) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast({
          title: "Informations manquantes",
          description: "Remplis tous les champs obligatoires",
          variant: "destructive",
        });
      }
    } else {
      if (!validateStep()) {
        toast({
          title: "Informations manquantes",
          description: "Remplis tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      try {
        // Toujours sauvegarder dans localStorage pour l'aperçu
        localStorage.setItem("onboardingData", JSON.stringify(formData));
        navigate("/preview");
      } catch (error) {
        console.error("Error saving data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder tes informations. Réessaye.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <>
      <Header variant="onboarding" showBack={step > 1} onBack={handleBack} />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Ton évaluation</h1>
          <p className="text-muted-foreground">Étape {step} sur {totalSteps}</p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Step 1: Profil de base */}
        {step === 1 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Commençons par les bases</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Âge *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age || ""}
                    onChange={(e) => updateField("age", parseInt(e.target.value))}
                    className={`mt-2 ${errors.age ? 'border-destructive' : ''}`}
                  />
                  {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                </div>
                <div>
                  <Label htmlFor="sex">Sexe *</Label>
                  <Select value={formData.sex} onValueChange={(value) => updateField("sex", value)}>
                    <SelectTrigger className={`mt-2 ${errors.sex ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sex && <p className="text-xs text-destructive mt-1">{errors.sex}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Taille (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height || ""}
                    onChange={(e) => updateField("height", parseInt(e.target.value))}
                    className={`mt-2 ${errors.height ? 'border-destructive' : ''}`}
                  />
                  {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
                </div>
                <div>
                  <Label htmlFor="weight">Poids (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70,5"
                    value={formData.weight || ""}
                    onChange={(e) => updateField("weight", parseFloat(e.target.value))}
                    className={`mt-2 ${errors.weight ? 'border-destructive' : ''}`}
                  />
                  {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Objectif */}
        {step === 2 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Quel est ton objectif principal ?</h2>
            <div className="space-y-4">
              {[
                { value: "weight-loss", label: "Perte de poids" },
                { value: "muscle-gain", label: "Prise de muscle" },
                { value: "endurance", label: "Endurance" },
                { value: "strength", label: "Force" },
                { value: "wellness", label: "Bien-être général" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateField("goal", option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                    formData.goal === option.value ? "border-primary bg-primary/5" : "border-border"
                  } ${errors.goal ? 'border-destructive' : ''}`}
                >
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
              {errors.goal && <p className="text-xs text-destructive">{errors.goal}</p>}
            </div>

            <div className="mt-6">
              <Label htmlFor="horizon">À quelle échéance souhaites-tu cet objectif ? *</Label>
              <Select 
                value={formData.goalHorizon} 
                onValueChange={(value) => updateField("goalHorizon", value)}
              >
                <SelectTrigger className={`mt-2 ${errors.goalHorizon ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Court terme (3 mois)</SelectItem>
                  <SelectItem value="medium">Moyen terme (6–12 mois)</SelectItem>
                  <SelectItem value="long">Long terme (+1 an)</SelectItem>
                </SelectContent>
              </Select>
              {errors.goalHorizon && <p className="text-xs text-destructive mt-1">{errors.goalHorizon}</p>}
            </div>

            {formData.goal === 'weight-loss' && (
              <div className="mt-6">
                <Label htmlFor="targetWeightLoss">Combien de kg veux-tu perdre ? (optionnel)</Label>
                <div className="mt-4">
                  <Slider
                    value={[formData.targetWeightLoss || 5]}
                    onValueChange={(value) => updateField("targetWeightLoss", value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="mb-2"
                  />
                  <div className="text-center text-2xl font-bold text-primary">
                    {formData.targetWeightLoss || 5} kg
                  </div>
                </div>
                {errors.targetWeightLoss && <p className="text-xs text-destructive mt-1">{errors.targetWeightLoss}</p>}
              </div>
            )}

            <div className="mt-6">
              <Label>Fais-tu déjà du cardio régulièrement ? *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  { value: true, label: "Oui" },
                  { value: false, label: "Non" }
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => updateField("hasCardio", option.value)}
                    className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      formData.hasCardio === option.value ? "border-primary bg-primary/5" : "border-border"
                    } ${errors.hasCardio ? 'border-destructive' : ''}`}
                  >
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
              {errors.hasCardio && <p className="text-xs text-destructive mt-1">{errors.hasCardio}</p>}
            </div>

            {formData.hasCardio === true && (
              <div className="mt-6">
                <Label htmlFor="cardioFrequency">Combien de fois par semaine ? *</Label>
                <Select
                  value={formData.cardioFrequency?.toString()}
                  onValueChange={(value) => updateField("cardioFrequency", parseInt(value))}
                >
                  <SelectTrigger className={`mt-2 ${errors.cardioFrequency ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} fois par semaine
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cardioFrequency && <p className="text-xs text-destructive mt-1">{errors.cardioFrequency}</p>}
              </div>
            )}
          </Card>
        )}

        {/* Step 3: Niveau d'activité */}
        {step === 3 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Ton niveau d'activité quotidien</h2>
            <div className="space-y-4">
              <Label>Hors entraînement, tu es plutôt... *</Label>
              {[
                { value: "sedentary", label: "Sédentaire", desc: "Bureau, peu de déplacements" },
                { value: "light", label: "Légèrement actif", desc: "Marche quotidienne, quelques déplacements" },
                { value: "moderate", label: "Modérément actif", desc: "Travail physique léger, beaucoup de marche" },
                { value: "high", label: "Très actif", desc: "Travail physique intense, très mobile" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateField("activityLevel", option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                    formData.activityLevel === option.value ? "border-primary bg-primary/5" : "border-border"
                  } ${errors.activityLevel ? 'border-destructive' : ''}`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </button>
              ))}
              {errors.activityLevel && <p className="text-xs text-destructive">{errors.activityLevel}</p>}
            </div>
          </Card>
        )}

        {/* Step 4: Entraînement */}
        {step === 4 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Ton entraînement</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="frequency">Séances par semaine *</Label>
                <Select
                  value={formData.frequency?.toString()}
                  onValueChange={(value) => updateField("frequency", parseInt(value))}
                >
                  <SelectTrigger className={`mt-2 ${errors.frequency ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} fois par semaine
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && <p className="text-xs text-destructive mt-1">{errors.frequency}</p>}
              </div>

              <div>
                <Label htmlFor="duration">Durée par séance * (Min 30min - Max 120min)</Label>
                <div className="mt-4">
                  <Slider
                    value={[formData.sessionDuration || 60]}
                    onValueChange={(value) => updateField("sessionDuration", value[0])}
                    min={30}
                    max={120}
                    step={15}
                    className="mb-2"
                  />
                  <div className="text-center text-2xl font-bold text-primary">
                    {formData.sessionDuration || 60} minutes
                  </div>
                </div>
                {errors.sessionDuration && <p className="text-xs text-destructive mt-1">{errors.sessionDuration}</p>}
              </div>

              <div>
                <Label>As-tu la possibilité d'aller en salle de sport ? *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    { value: true, label: "Oui" },
                    { value: false, label: "Non" }
                  ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                const nextLocation: "gym" | "home" = option.value ? "gym" : "home";
                const nextEquipment = option.value
                  ? ["Haltères", "Barre + poids", "Banc de musculation", "Barre de traction", "Machines guidées"]
                  : [];
                
                setFormData(prev => {
                  const updated = { ...prev, location: nextLocation, equipment: nextEquipment };
                  saveProgress(updated);
                  return updated;
                });
                
                // Clear related errors
                setErrors(prevErr => {
                  const e = { ...prevErr };
                  delete e.location;
                  delete e.equipment;
                  return e;
                });
              }}
                      className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${
                        formData.location === (option.value ? "gym" : "home") ? "border-primary bg-primary/5" : "border-border"
                      } ${errors.location ? 'border-destructive' : ''}`}
                    >
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
              </div>

              {/* Afficher l'équipement seulement si location = "home" */}
              {formData.location === "home" && (
                <div>
                  <Label>Quel équipement as-tu à la maison ? (minimum 1) *</Label>
                  <div className={`mt-3 space-y-3 ${errors.equipment ? 'p-3 border-2 border-destructive rounded-lg' : ''}`}>
                    {[
                      "Haltères",
                      "Barre + poids",
                      "Élastiques",
                      "Kettlebell",
                      "Banc de musculation",
                      "Barre de traction",
                      "Aucun (poids du corps)"
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={formData.equipment?.includes(item)}
                          onCheckedChange={(checked) => {
                            const current = formData.equipment || [];
                            updateField(
                              "equipment",
                              checked ? [...current, item] : current.filter((e) => e !== item)
                            );
                          }}
                        />
                        <Label htmlFor={item} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.equipment && <p className="text-xs text-destructive mt-1">{errors.equipment}</p>}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 5: Alimentation (optionnel mais pré-rempli) */}
        {step === 5 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Tes préférences alimentaires</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="mealsPerDay">Combien de repas souhaites-tu par jour ? *</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Les collations comptent comme des repas, mais pas le grignotage occasionnel
                </p>
                <Select
                  value={formData.mealsPerDay?.toString()}
                  onValueChange={(value) => updateField("mealsPerDay", parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} repas par jour
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBreakfast"
                  checked={formData.hasBreakfast}
                  onCheckedChange={(checked) => updateField("hasBreakfast", checked)}
                />
                <Label htmlFor="hasBreakfast" className="font-normal cursor-pointer">
                  Je prends un petit-déjeuner
                </Label>
              </div>

            <div>
              <Label htmlFor="allergies">Allergies ou intolérances (optionnel)</Label>
              <Textarea
                id="allergies"
                placeholder="Décris tes allergies ou intolérances librement..."
                value={formData.allergies || ""}
                onChange={(e) => updateField("allergies", e.target.value)}
                className="mt-2"
                rows={2}
              />
              <p className="text-sm text-muted-foreground mt-1">Tu peux écrire librement, sépare par des virgules si plusieurs</p>
            </div>

            <div>
              <Label htmlFor="restrictions">Aliments que tu ne veux pas (optionnel)</Label>
              <Textarea
                id="restrictions"
                placeholder="Décris les aliments que tu souhaites éviter..."
                value={formData.restrictions || ""}
                onChange={(e) => updateField("restrictions", e.target.value)}
                className="mt-2"
                rows={2}
              />
              <p className="text-sm text-muted-foreground mt-1">Tu peux écrire librement, sépare par des virgules si plusieurs</p>
            </div>

            <div>
              <Label htmlFor="healthConditions">Conditions de santé (optionnel)</Label>
              <Textarea
                id="healthConditions"
                placeholder="Décris tes conditions de santé si pertinent..."
                value={formData.healthConditions || ""}
                onChange={(e) => updateField("healthConditions", e.target.value)}
                className="mt-2"
                rows={2}
              />
              <p className="text-sm text-muted-foreground mt-1">Tu peux écrire librement, sépare par des virgules si plusieurs</p>
            </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ⚠️ <strong>Important :</strong> Pulse.ai propose des conseils bien-être généraux et ne remplace pas
                  un avis médical. Si tu as des conditions particulières, consulte un professionnel de santé.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={loading || !isStepValid()}
            className={`ml-auto ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Chargement..." : step === totalSteps ? "Voir mon plan" : "Suivant"}
            {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {!isStepValid() && step < 5 && (
          <p className="text-sm text-destructive text-center mt-4">
            Remplis tous les champs obligatoires (*) pour continuer
          </p>
        )}
        </div>
      </div>
    </>
  );
};

export default Start;
