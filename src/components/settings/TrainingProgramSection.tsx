import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    goal_type: [] as string[],
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
        const gt = goalsRes.data.goal_type;
        setGoalsData({
          goal_type: Array.isArray(gt) ? gt : gt ? [gt] : [],
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
      // Fetch existing data to avoid overwriting other sections
      const [goalsRes, prefsRes] = await Promise.all([
        supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("training_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      await Promise.all([
        supabase.from("goals").upsert({
          ...goalsRes.data,
          user_id: user.id,
          goal_type: goalsData.goal_type.length > 0 ? goalsData.goal_type : (goalsRes.data?.goal_type || ["general-fitness"]),
          frequency: goalsData.frequency ? parseInt(goalsData.frequency) : null,
          session_duration: goalsData.session_duration ? parseInt(goalsData.session_duration) : null,
          equipment: goalsData.equipment,
          location: goalsData.location,
        }, { onConflict: 'user_id' }),
        
        supabase.from("training_preferences").upsert({
          ...prefsRes.data,
          user_id: user.id,
          // Update only fields managed by this section
          experience_level: prefsData.experience_level || prefsRes.data?.experience_level || "intermediate",
          session_type: prefsData.session_type || prefsRes.data?.session_type || "full_body",
          split_preference: prefsData.split_preference,
          priority_zones: prefsData.priority_zones,
          limitations: prefsData.limitations,
          favorite_exercises: prefsData.favorite_exercises,
          exercises_to_avoid: prefsData.exercises_to_avoid,
          progression_focus: prefsData.progression_focus || prefsRes.data?.progression_focus || "balanced",
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
          <Label htmlFor="goal">Objectifs (2 max)</Label>
          <div className="space-y-2 mt-1">
            {[
              { value: "muscle-gain", label: "Prise de masse" },
              { value: "weight-loss", label: "Perte de poids" },
              { value: "strength", label: "Force" },
              { value: "endurance", label: "Endurance" },
              { value: "general-fitness", label: "Forme générale" },
            ].map((option) => {
              const isSelected = goalsData.goal_type.includes(option.value);
              const isDisabled = !isSelected && goalsData.goal_type.length >= 2;
              return (
                <label key={option.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5" : isDisabled ? "opacity-50 cursor-not-allowed border-border" : "border-border hover:border-primary"}`}>
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setGoalsData({ ...goalsData, goal_type: [...goalsData.goal_type, option.value] });
                      } else {
                        setGoalsData({ ...goalsData, goal_type: goalsData.goal_type.filter(g => g !== option.value) });
                      }
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })}
          </div>
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
