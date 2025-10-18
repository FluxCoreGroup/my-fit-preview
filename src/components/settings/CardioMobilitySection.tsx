import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const CardioMobilitySection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [goalsData, setGoalsData] = useState({
    has_cardio: false,
    cardio_frequency: "",
  });
  const [prefsData, setPrefsData] = useState({
    cardio_intensity: "",
    mobility_preference: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [goalsRes, prefsRes] = await Promise.all([
        supabase.from("goals").select("has_cardio, cardio_frequency").eq("user_id", user.id).single(),
        supabase.from("training_preferences").select("cardio_intensity, mobility_preference").eq("user_id", user.id).single(),
      ]);

      if (goalsRes.data) {
        setGoalsData({
          has_cardio: goalsRes.data.has_cardio || false,
          cardio_frequency: goalsRes.data.cardio_frequency?.toString() || "",
        });
      }

      if (prefsRes.data) {
        setPrefsData({
          cardio_intensity: prefsRes.data.cardio_intensity || "",
          mobility_preference: prefsRes.data.mobility_preference || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch existing training_preferences to avoid overwriting other sections
      const { data: existingPrefs } = await supabase
        .from("training_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      await Promise.all([
        supabase.from("goals").upsert({
          user_id: user.id,
          has_cardio: goalsData.has_cardio,
          cardio_frequency: goalsData.cardio_frequency ? parseInt(goalsData.cardio_frequency) : null,
          goal_type: existingPrefs ? undefined : "general_fitness",
        }),
        
        supabase.from("training_preferences").upsert({
          user_id: user.id,
          // Update only fields managed by this section
          cardio_intensity: prefsData.cardio_intensity,
          mobility_preference: prefsData.mobility_preference || "none",
          // Keep existing values for fields managed by other sections
          experience_level: existingPrefs?.experience_level || "intermediate",
          session_type: existingPrefs?.session_type || "full_body",
          split_preference: existingPrefs?.split_preference,
          priority_zones: existingPrefs?.priority_zones,
          limitations: existingPrefs?.limitations,
          favorite_exercises: existingPrefs?.favorite_exercises,
          exercises_to_avoid: existingPrefs?.exercises_to_avoid,
          progression_focus: existingPrefs?.progression_focus || "balanced",
        }),
      ]);

      toast.success("Préférences cardio et mobilité mises à jour");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Cardio & Mobilité</h2>
        <p className="text-muted-foreground">Configure tes préférences cardiovasculaires et de mobilité</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="has_cardio" className="text-base">Ajouter du cardio</Label>
            <p className="text-sm text-muted-foreground">
              Inclure des exercices cardiovasculaires dans ton programme
            </p>
          </div>
          <Switch
            id="has_cardio"
            checked={goalsData.has_cardio}
            onCheckedChange={(checked) => setGoalsData({ ...goalsData, has_cardio: checked })}
          />
        </div>

        {goalsData.has_cardio && (
          <div className="grid sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary">
            <div className="space-y-2">
              <Label htmlFor="cardio_frequency">Fréquence cardio (fois/semaine)</Label>
              <Input
                id="cardio_frequency"
                type="number"
                value={goalsData.cardio_frequency}
                onChange={(e) => setGoalsData({ ...goalsData, cardio_frequency: e.target.value })}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardio_intensity">Intensité du cardio</Label>
              <Select value={prefsData.cardio_intensity} onValueChange={(value) => setPrefsData({ ...prefsData, cardio_intensity: value })}>
                <SelectTrigger id="cardio_intensity">
                  <SelectValue placeholder="Sélectionne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible (marche, vélo léger)</SelectItem>
                  <SelectItem value="moderate">Modérée (jogging, natation)</SelectItem>
                  <SelectItem value="high">Élevée (HIIT, sprint)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="mobility">Préférence mobilité</Label>
          <Select value={prefsData.mobility_preference} onValueChange={(value) => setPrefsData({ ...prefsData, mobility_preference: value })}>
            <SelectTrigger id="mobility">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Pas de mobilité</SelectItem>
              <SelectItem value="light">Léger (5-10 min d'étirements)</SelectItem>
              <SelectItem value="moderate">Modéré (10-15 min)</SelectItem>
              <SelectItem value="extensive">Intensif (15-20 min, yoga/mobilité)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Exercices de mobilité et d'étirement en début ou fin de séance
          </p>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sauvegarder les modifications
      </Button>
    </Card>
  );
};
