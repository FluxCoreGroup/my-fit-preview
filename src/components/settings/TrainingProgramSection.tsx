import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const TrainingProgramSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [goalsData, setGoalsData] = useState({
    goal_type: "",
    frequency: "",
    session_duration: "",
    equipment: [] as string[],
    location: "",
  });
  const [prefsData, setPrefsData] = useState({
    experience_level: "",
    session_type: "",
    split_preference: "",
    priority_zones: [] as string[],
    limitations: [] as string[],
    favorite_exercises: "",
    exercises_to_avoid: "",
    progression_focus: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [goalsRes, prefsRes] = await Promise.all([
        supabase.from("goals").select("goal_type, frequency, session_duration, equipment, location").eq("user_id", user.id).single(),
        supabase.from("training_preferences").select("*").eq("user_id", user.id).single(),
      ]);

      if (goalsRes.data) {
        setGoalsData({
          goal_type: goalsRes.data.goal_type || "",
          frequency: goalsRes.data.frequency?.toString() || "",
          session_duration: goalsRes.data.session_duration?.toString() || "",
          equipment: goalsRes.data.equipment || [],
          location: goalsRes.data.location || "",
        });
      }

      if (prefsRes.data) {
        setPrefsData({
          experience_level: prefsRes.data.experience_level || "",
          session_type: prefsRes.data.session_type || "",
          split_preference: prefsRes.data.split_preference || "",
          priority_zones: prefsRes.data.priority_zones || [],
          limitations: prefsRes.data.limitations || [],
          favorite_exercises: prefsRes.data.favorite_exercises || "",
          exercises_to_avoid: prefsRes.data.exercises_to_avoid || "",
          progression_focus: prefsRes.data.progression_focus || "",
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
          goal_type: goalsData.goal_type || "general_fitness",
          frequency: goalsData.frequency ? parseInt(goalsData.frequency) : null,
          session_duration: goalsData.session_duration ? parseInt(goalsData.session_duration) : null,
          equipment: goalsData.equipment,
          location: goalsData.location,
        }, { onConflict: 'user_id' }),
        
        supabase.from("training_preferences").upsert({
          user_id: user.id,
          // Keep existing values for fields managed by other sections
          cardio_intensity: existingPrefs?.cardio_intensity,
          mobility_preference: existingPrefs?.mobility_preference || "none",
          // Update only fields managed by this section
          experience_level: prefsData.experience_level || "intermediate",
          session_type: prefsData.session_type || "full_body",
          split_preference: prefsData.split_preference,
          priority_zones: prefsData.priority_zones,
          limitations: prefsData.limitations,
          favorite_exercises: prefsData.favorite_exercises,
          exercises_to_avoid: prefsData.exercises_to_avoid,
          progression_focus: prefsData.progression_focus || "balanced",
        }, { onConflict: 'user_id' }),
      ]);

      toast.success("Programme d'entraînement mis à jour");
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
        <h2 className="text-2xl font-bold mb-1">Mon Programme d'Entraînement</h2>
        <p className="text-muted-foreground">Personnalise ton programme selon tes besoins</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Objectif principal</Label>
          <Select value={goalsData.goal_type} onValueChange={(value) => setGoalsData({ ...goalsData, goal_type: value })}>
            <SelectTrigger id="goal">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="muscle_gain">Prise de masse</SelectItem>
              <SelectItem value="weight_loss">Perte de poids</SelectItem>
              <SelectItem value="strength">Force</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
              <SelectItem value="general_fitness">Forme générale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Fréquence (séances/semaine)</Label>
          <Input
            id="frequency"
            type="number"
            value={goalsData.frequency}
            onChange={(e) => setGoalsData({ ...goalsData, frequency: e.target.value })}
            placeholder="3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Durée des séances (min)</Label>
          <Input
            id="duration"
            type="number"
            value={goalsData.session_duration}
            onChange={(e) => setGoalsData({ ...goalsData, session_duration: e.target.value })}
            placeholder="60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lieu d'entraînement</Label>
          <Select value={goalsData.location} onValueChange={(value) => setGoalsData({ ...goalsData, location: value })}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Maison</SelectItem>
              <SelectItem value="gym">Salle de sport</SelectItem>
              <SelectItem value="outdoor">Extérieur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Niveau d'expérience</Label>
          <Select value={prefsData.experience_level} onValueChange={(value) => setPrefsData({ ...prefsData, experience_level: value })}>
            <SelectTrigger id="experience">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="session_type">Type de séance</Label>
          <Select value={prefsData.session_type} onValueChange={(value) => setPrefsData({ ...prefsData, session_type: value })}>
            <SelectTrigger id="session_type">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_body">Full body</SelectItem>
              <SelectItem value="split">Split</SelectItem>
              <SelectItem value="push_pull_legs">Push/Pull/Legs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="favorite">Exercices favoris</Label>
          <Textarea
            id="favorite"
            value={prefsData.favorite_exercises}
            onChange={(e) => setPrefsData({ ...prefsData, favorite_exercises: e.target.value })}
            placeholder="Squat, développé couché..."
            rows={3}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="avoid">Exercices à éviter</Label>
          <Textarea
            id="avoid"
            value={prefsData.exercises_to_avoid}
            onChange={(e) => setPrefsData({ ...prefsData, exercises_to_avoid: e.target.value })}
            placeholder="Soulevé de terre, course..."
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sauvegarder les modifications
      </Button>
    </Card>
  );
};
