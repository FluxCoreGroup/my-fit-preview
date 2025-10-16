import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Weekly = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    weight1: "",
    weight2: "",
    weight3: "",
    sessionsPlanned: "",
    sessionsDone: "",
    adherenceDiet: "",
    hunger: "",
    energy: "",
    sleep: "",
    blockers: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation basique
    if (!formData.weight1 || !formData.sessionsPlanned || !formData.sessionsDone) {
      toast({
        title: "Informations manquantes",
        description: "Merci de remplir au moins les champs essentiels.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculer poids moyen
      const weights = [formData.weight1, formData.weight2, formData.weight3]
        .filter(w => w)
        .map(w => parseFloat(w));
      const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

      if (user) {
        // Sauvegarder dans Supabase
        const { error } = await supabase.from('weekly_checkins').insert({
          user_id: user.id,
          average_weight: avgWeight,
          sessions_planned: parseInt(formData.sessionsPlanned),
          sessions_done: parseInt(formData.sessionsDone),
          adherence_diet: formData.adherenceDiet ? parseInt(formData.adherenceDiet) : null,
          hunger: formData.hunger || null,
          energy: formData.energy || null,
          sleep: formData.sleep || null,
          blockers: formData.blockers || null,
        });

        if (error) throw error;
      }

      toast({
        title: "Check-in enregistré ! 📊",
        description: "Ton programme sera ajusté en fonction de tes retours.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ton check-in. Réessaye.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center animate-in">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Check-in hebdomadaire</h1>
          <p className="text-muted-foreground">
            Prends 2 minutes pour nous dire comment s'est passée ta semaine.
          </p>
        </div>

        <Card className="p-8 space-y-6 animate-in">
          {/* Poids */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Ton poids cette semaine (3 pesées recommandées)
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="w1" className="text-sm">Pesée 1</Label>
                <Input
                  id="w1"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={formData.weight1}
                  onChange={(e) => updateField("weight1", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w2" className="text-sm">Pesée 2</Label>
                <Input
                  id="w2"
                  type="number"
                  step="0.1"
                  placeholder="70.2"
                  value={formData.weight2}
                  onChange={(e) => updateField("weight2", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="w3" className="text-sm">Pesée 3</Label>
                <Input
                  id="w3"
                  type="number"
                  step="0.1"
                  placeholder="70.8"
                  value={formData.weight3}
                  onChange={(e) => updateField("weight3", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Conseil : pèse-toi le matin à jeun, même jour chaque semaine
            </p>
          </div>

          {/* Séances */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Séances d'entraînement
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planned" className="text-sm">Prévues</Label>
                <Input
                  id="planned"
                  type="number"
                  placeholder="4"
                  value={formData.sessionsPlanned}
                  onChange={(e) => updateField("sessionsPlanned", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="done" className="text-sm">Réalisées</Label>
                <Input
                  id="done"
                  type="number"
                  placeholder="3"
                  value={formData.sessionsDone}
                  onChange={(e) => updateField("sessionsDone", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Adhérence diète */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Adhérence au plan nutrition (1 à 10)
            </Label>
            <RadioGroup value={formData.adherenceDiet} onValueChange={(v) => updateField("adherenceDiet", v)}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div key={value} className="relative">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`diet-${value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`diet-${value}`}
                      className="flex h-12 items-center justify-center rounded-lg border-2 border-muted bg-background hover:bg-muted/50 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all font-semibold"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                1 = pas du tout respecté • 10 = parfaitement respecté
              </p>
            </RadioGroup>
          </div>

          {/* Faim / Énergie / Sommeil */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="hunger" className="text-base font-semibold">Niveau de faim</Label>
              <RadioGroup value={formData.hunger} onValueChange={(v) => updateField("hunger", v)} className="mt-2">
                {["Très faible", "Faible", "Normal", "Élevé", "Très élevé"].map((level) => (
                  <div key={level} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={level} id={`hunger-${level}`} />
                    <Label htmlFor={`hunger-${level}`} className="cursor-pointer flex-1">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="energy" className="text-base font-semibold">Niveau d'énergie</Label>
              <RadioGroup value={formData.energy} onValueChange={(v) => updateField("energy", v)} className="mt-2">
                {["Très bas", "Bas", "Normal", "Bon", "Excellent"].map((level) => (
                  <div key={level} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={level} id={`energy-${level}`} />
                    <Label htmlFor={`energy-${level}`} className="cursor-pointer flex-1">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="sleep" className="text-base font-semibold">Qualité du sommeil</Label>
              <RadioGroup value={formData.sleep} onValueChange={(v) => updateField("sleep", v)} className="mt-2">
                {["Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"].map((level) => (
                  <div key={level} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={level} id={`sleep-${level}`} />
                    <Label htmlFor={`sleep-${level}`} className="cursor-pointer flex-1">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Blocages */}
          <div>
            <Label htmlFor="blockers" className="text-base font-semibold mb-3 block">
              Difficultés rencontrées cette semaine ? (optionnel)
            </Label>
            <Textarea
              id="blockers"
              placeholder="ex: Manque de temps, séances trop dures, faim persistante..."
              value={formData.blockers}
              onChange={(e) => updateField("blockers", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            size="lg"
            variant="success"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Envoi..." : "Enregistrer mon check-in"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Weekly;
