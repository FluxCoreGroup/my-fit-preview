import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Weight, Ruler, Calendar, TrendingUp, Lock, Info } from "lucide-react";
import { calculateAge, formatBirthDate } from "@/lib/dateUtils";

export const PhysicalInfoSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    birth_date: "",
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
        .select("age, sex, weight, height, target_weight_loss, activity_level, birth_date")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        // Calculer l'âge depuis birth_date si disponible
        const calculatedAge = data.birth_date 
          ? calculateAge(data.birth_date).toString()
          : data.age?.toString() || "";

        setFormData({
          birth_date: data.birth_date || "",
          age: calculatedAge,
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
          // Seuls ces champs sont modifiables
          height: formData.height ? parseInt(formData.height) : null,
          target_weight_loss: formData.target_weight_loss ? parseInt(formData.target_weight_loss) : null,
          activity_level: formData.activity_level || null,
        }, { 
          onConflict: 'user_id' 
        });

      if (error) throw error;

      toast.success("Informations mises à jour");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSexLabel = (sex: string) => {
    if (sex === "male") return "Homme";
    if (sex === "female") return "Femme";
    return sex || "Non renseigné";
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

      {/* Section lecture seule */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Lock className="w-4 h-4" />
          <span>Informations non modifiables (définies lors de l'inscription)</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Date de naissance
            </Label>
            <div className="p-3 bg-background rounded-md border text-foreground">
              {formData.birth_date ? formatBirthDate(formData.birth_date) : "Non renseignée"}
              {formData.age && <span className="text-muted-foreground ml-2">({formData.age} ans)</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Sexe</Label>
            <div className="p-3 bg-background rounded-md border text-foreground">
              {getSexLabel(formData.sex)}
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Weight className="w-4 h-4" />
              Poids initial
            </Label>
            <div className="p-3 bg-background rounded-md border text-foreground flex items-center justify-between">
              <span>{formData.weight ? `${formData.weight} kg` : "Non renseigné"}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Modifiable via les bilans hebdomadaires</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section modifiable */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-2">Informations modifiables</div>
        
        <div className="grid sm:grid-cols-2 gap-4">
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

          <div className="space-y-2 sm:col-span-2">
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
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sauvegarder les modifications
      </Button>
    </Card>
  );
};
