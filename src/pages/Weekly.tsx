import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { TrendingUp } from "lucide-react";

const Weekly = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    weight1: "",
    weight2: "",
    weight3: "",
    waist: "",
    rpeAvg: "",
    sessionsPlanned: "",
    sessionsCompleted: "",
    diet: "",
    hunger: "",
    energy: "",
    sleep: "",
    painZones: [] as string[],
    painIntensity: "",
    blockers: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const weights = [formData.weight1, formData.weight2, formData.weight3].filter(w => w);
    if (weights.length === 0) {
      toast({
        title: "Poids manquant",
        description: "Entre au moins un poids cette semaine",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const avgWeight = weights.reduce((sum, w) => sum + parseFloat(w), 0) / weights.length;

      const { error } = await supabase.from("weekly_checkins").insert({
        user_id: user.id,
        average_weight: avgWeight,
        waist_circumference: formData.waist ? parseFloat(formData.waist) : null,
        rpe_avg: formData.rpeAvg ? parseInt(formData.rpeAvg) : null,
        sessions_planned: parseInt(formData.sessionsPlanned) || 0,
        sessions_done: parseInt(formData.sessionsCompleted) || 0,
        adherence_diet: parseInt(formData.diet) || null,
        hunger: formData.hunger,
        energy: formData.energy,
        sleep: formData.sleep,
        pain_zones: formData.painZones.length > 0 ? formData.painZones : null,
        pain_intensity: formData.painIntensity ? parseInt(formData.painIntensity) : null,
        blockers: formData.blockers || null,
      });

      if (error) throw error;

      toast({
        title: "✅ Check-in enregistré !",
        description: "Tes données ont été sauvegardées avec succès.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer ton check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Check-in hebdomadaire</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Partage tes progrès et ajuste ton programme
            </p>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Poids cette semaine (kg)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="weight1" className="text-xs text-muted-foreground">Lundi</Label>
                  <Input
                    id="weight1"
                    type="number"
                    step="0.1"
                    value={formData.weight1}
                    onChange={(e) => updateField("weight1", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="weight2" className="text-xs text-muted-foreground">Mercredi</Label>
                  <Input
                    id="weight2"
                    type="number"
                    step="0.1"
                    value={formData.weight2}
                    onChange={(e) => updateField("weight2", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="weight3" className="text-xs text-muted-foreground">Vendredi</Label>
                  <Input
                    id="weight3"
                    type="number"
                    step="0.1"
                    value={formData.weight3}
                    onChange={(e) => updateField("weight3", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="waist" className="text-sm font-medium mb-2 block">
                Tour de taille (cm)
              </Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={(e) => updateField("waist", e.target.value)}
                placeholder="Ex: 85"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="rpeAvg" className="text-sm font-medium mb-2 block">
                RPE moyen de la semaine (1-10)
              </Label>
              <Input
                id="rpeAvg"
                type="number"
                min="1"
                max="10"
                value={formData.rpeAvg}
                onChange={(e) => updateField("rpeAvg", e.target.value)}
                placeholder="Ex: 7"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 = Très facile, 10 = Effort maximal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionsPlanned" className="text-sm font-medium mb-2 block">
                  Séances prévues
                </Label>
                <Input
                  id="sessionsPlanned"
                  type="number"
                  value={formData.sessionsPlanned}
                  onChange={(e) => updateField("sessionsPlanned", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="sessionsCompleted" className="text-sm font-medium mb-2 block">
                  Séances réalisées
                </Label>
                <Input
                  id="sessionsCompleted"
                  type="number"
                  value={formData.sessionsCompleted}
                  onChange={(e) => updateField("sessionsCompleted", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Douleurs cette semaine</Label>
              <div className="space-y-2">
                {["Épaule", "Dos", "Genou", "Coude", "Poignet", "Hanche", "Autre"].map((zone) => (
                  <label key={zone} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.painZones.includes(zone)}
                      onChange={(e) => {
                        const newZones = e.target.checked
                          ? [...formData.painZones, zone]
                          : formData.painZones.filter(z => z !== zone);
                        setFormData(prev => ({ ...prev, painZones: newZones }));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{zone}</span>
                  </label>
                ))}
              </div>
              {formData.painZones.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="painIntensity" className="text-sm font-medium mb-2 block">
                    Intensité de la douleur (0-10)
                  </Label>
                  <Input
                    id="painIntensity"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.painIntensity}
                    onChange={(e) => updateField("painIntensity", e.target.value)}
                    placeholder="0 = Aucune, 10 = Insupportable"
                    className="rounded-xl"
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Adhérence au régime (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.diet}
                onChange={(e) => updateField("diet", e.target.value)}
                placeholder="Ex: 80"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Niveau de faim</Label>
              <RadioGroup value={formData.hunger} onValueChange={(v) => updateField("hunger", v)}>
                {["low", "moderate", "high", "very_high"].map((option) => (
                  <div key={option} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={option} id={`hunger-${option}`} />
                    <Label htmlFor={`hunger-${option}`} className="cursor-pointer capitalize">
                      {option.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Niveau d'énergie</Label>
              <RadioGroup value={formData.energy} onValueChange={(v) => updateField("energy", v)}>
                {["very_high", "good", "low", "very_low"].map((option) => (
                  <div key={option} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={option} id={`energy-${option}`} />
                    <Label htmlFor={`energy-${option}`} className="cursor-pointer capitalize">
                      {option.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Qualité du sommeil</Label>
              <RadioGroup value={formData.sleep} onValueChange={(v) => updateField("sleep", v)}>
                {["excellent", "good", "average", "poor"].map((option) => (
                  <div key={option} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={option} id={`sleep-${option}`} />
                    <Label htmlFor={`sleep-${option}`} className="cursor-pointer capitalize">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="blockers" className="text-sm font-medium mb-2 block">
                Difficultés ou blocages (optionnel)
              </Label>
              <Textarea
                id="blockers"
                value={formData.blockers}
                onChange={(e) => updateField("blockers", e.target.value)}
                placeholder="Blessures, stress, manque de motivation..."
                className="rounded-xl min-h-24"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              {loading ? "Enregistrement..." : "Enregistrer mon check-in"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Weekly;
