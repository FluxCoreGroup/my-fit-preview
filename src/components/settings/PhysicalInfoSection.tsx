import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Weight, Ruler, Calendar, TrendingUp } from "lucide-react";

export const PhysicalInfoSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    weight: "",
    height: "",
    target_weight_loss: "",
    activity_level: "",
  });

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("age, sex, weight, height, target_weight_loss, activity_level")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormData({
          age: data.age?.toString() || "",
          sex: data.sex || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          target_weight_loss: data.target_weight_loss?.toString() || "",
          activity_level: data.activity_level || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching goals:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer les données existantes pour ne pas écraser les autres champs
      const { data: existingGoals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { error } = await supabase
        .from("goals")
        .upsert({
          ...existingGoals,
          user_id: user.id,
          age: formData.age ? parseInt(formData.age) : null,
          sex: formData.sex || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseInt(formData.height) : null,
          target_weight_loss: formData.target_weight_loss ? parseInt(formData.target_weight_loss) : null,
          activity_level: formData.activity_level || null,
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;

      toast.success("Informations physiques mises à jour");
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
        <h2 className="text-2xl font-bold mb-1">Mes Informations Physiques</h2>
        <p className="text-muted-foreground">Mets à jour tes données pour un programme personnalisé</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Âge
          </Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="25"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sexe</Label>
          <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
            <SelectTrigger id="sex">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="female">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight" className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            Poids actuel (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Taille (cm)
          </Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="175"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Objectif perte de poids (kg)
          </Label>
          <Input
            id="target"
            type="number"
            value={formData.target_weight_loss}
            onChange={(e) => setFormData({ ...formData, target_weight_loss: e.target.value })}
            placeholder="5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity">Niveau d'activité</Label>
          <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
            <SelectTrigger id="activity">
              <SelectValue placeholder="Sélectionne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sédentaire</SelectItem>
              <SelectItem value="light">Léger</SelectItem>
              <SelectItem value="moderate">Modéré</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="very_active">Très actif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sauvegarder les modifications
      </Button>
    </Card>
  );
};
