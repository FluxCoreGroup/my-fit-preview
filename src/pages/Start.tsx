import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { OnboardingInput } from "@/services/planner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Start = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState<Partial<OnboardingInput>>({
    age: undefined,
    sex: undefined,
    height: undefined,
    weight: undefined,
    goal: undefined,
    goalHorizon: "",
    frequency: undefined,
    sessionDuration: undefined,
    location: undefined,
    equipment: [],
    allergies: [],
    restrictions: [],
  });

  const updateField = (field: keyof OnboardingInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      
      try {
        if (user) {
          // Si connecté, sauvegarder dans Supabase
          const { error } = await supabase.from('goals').insert({
            user_id: user.id,
            goal_type: formData.goal || 'maintenance',
            horizon: formData.goalHorizon || '',
            frequency: formData.frequency,
            session_duration: formData.sessionDuration,
            location: formData.location,
            equipment: formData.equipment,
          });

          if (error) throw error;
        }
        
        // Toujours sauvegarder dans localStorage pour l'aperçu (même si non connecté)
        localStorage.setItem("onboardingData", JSON.stringify(formData));
        navigate("/preview");
      } catch (error) {
        console.error("Error saving goals:", error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder tes objectifs. Réessaye.",
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
    <div className="min-h-screen bg-muted/30 py-8 px-4">
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
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age || ""}
                    onChange={(e) => updateField("age", parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sexe</Label>
                  <Select value={formData.sex} onValueChange={(value) => updateField("sex", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height || ""}
                    onChange={(e) => updateField("height", parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight || ""}
                    onChange={(e) => updateField("weight", parseInt(e.target.value))}
                    className="mt-2"
                  />
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
                { value: "weight-loss", label: "Perdre du poids", desc: "Réduire la masse grasse" },
                { value: "muscle-gain", label: "Prendre du muscle", desc: "Augmenter la masse musculaire" },
                { value: "maintenance", label: "Me maintenir en forme", desc: "Rester actif et tonique" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateField("goal", option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                    formData.goal === option.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Label htmlFor="horizon">Sur quelle période ?</Label>
              <Input
                id="horizon"
                placeholder="ex: 3 mois, 6 semaines..."
                value={formData.goalHorizon || ""}
                onChange={(e) => updateField("goalHorizon", e.target.value)}
                className="mt-2"
              />
            </div>
          </Card>
        )}

        {/* Step 3: Fréquence */}
        {step === 3 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Combien de fois peux-tu t'entraîner ?</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="frequency">Séances par semaine</Label>
                <Select
                  value={formData.frequency?.toString()}
                  onValueChange={(value) => updateField("frequency", parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} fois par semaine
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Durée par séance (minutes)</Label>
                <Select
                  value={formData.sessionDuration?.toString()}
                  onValueChange={(value) => updateField("sessionDuration", parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 75, 90].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Lieu & Matériel */}
        {step === 4 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Où vas-tu t'entraîner ?</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "home", label: "À la maison" },
                  { value: "gym", label: "En salle" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateField("location", option.value)}
                    className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      formData.location === option.value ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>

              <div>
                <Label>Matériel disponible (plusieurs choix possibles)</Label>
                <div className="mt-3 space-y-3">
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
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Restrictions */}
        {step === 5 && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold mb-6">Dernières infos</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="allergies">Allergies ou intolérances alimentaires</Label>
                <Input
                  id="allergies"
                  placeholder="ex: lactose, gluten, fruits à coque..."
                  value={formData.allergies?.join(", ") || ""}
                  onChange={(e) => updateField("allergies", e.target.value.split(",").map(s => s.trim()))}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">Sépare par des virgules</p>
              </div>

              <div>
                <Label htmlFor="restrictions">Aliments que tu ne veux pas</Label>
                <Input
                  id="restrictions"
                  placeholder="ex: poisson, viande rouge..."
                  value={formData.restrictions?.join(", ") || ""}
                  onChange={(e) => updateField("restrictions", e.target.value.split(",").map(s => s.trim()))}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">Sépare par des virgules</p>
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
            <Button variant="outline" onClick={handleBack} size="lg">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <Button
            onClick={handleNext}
            size="lg"
            variant={step === totalSteps ? "hero" : "default"}
            className={step === 1 ? "ml-auto" : ""}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : step === totalSteps ? "Voir mon aperçu" : "Suivant"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Start;
