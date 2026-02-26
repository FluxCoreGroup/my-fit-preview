import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NutritionSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({ meals_per_day: "", has_breakfast: true, restrictions: "", allergies: "" });

  useEffect(() => { fetchGoals(); }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("goals").select("meals_per_day, has_breakfast, restrictions, allergies").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setFormData({ meals_per_day: data.meals_per_day?.toString() || "3", has_breakfast: data.has_breakfast ?? true, restrictions: data.restrictions?.join(", ") || "", allergies: data.allergies?.join(", ") || "" });
    } catch (error: any) { console.error("Error fetching goals:", error); } finally { setFetchLoading(false); }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existingGoals } = await supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle();
      const { error } = await supabase.from("goals").upsert({ ...existingGoals, user_id: user.id, meals_per_day: formData.meals_per_day ? parseInt(formData.meals_per_day) : 3, has_breakfast: formData.has_breakfast, restrictions: formData.restrictions ? formData.restrictions.split(",").map(r => r.trim()).filter(Boolean) : [], allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(Boolean) : [] }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success(t("nutritionSection.updated"));
    } catch (error: any) {
      toast.error(t("nutritionSection.updateError"));
      console.error(error);
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Card className="p-6 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></Card>;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">{t("nutritionSection.title")}</h2>
        <p className="text-muted-foreground">{t("nutritionSection.subtitle")}</p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="meals">{t("nutritionSection.mealsPerDay")}</Label>
          <Input id="meals" type="number" value={formData.meals_per_day} onChange={(e) => setFormData({ ...formData, meals_per_day: e.target.value })} placeholder="3" min="1" max="8" />
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="has_breakfast" className="text-base">{t("nutritionSection.hasBreakfast")}</Label>
            <p className="text-sm text-muted-foreground">{t("nutritionSection.hasBreakfastDesc")}</p>
          </div>
          <Switch id="has_breakfast" checked={formData.has_breakfast} onCheckedChange={(checked) => setFormData({ ...formData, has_breakfast: checked })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="restrictions">{t("nutritionSection.restrictions")}</Label>
          <Input id="restrictions" value={formData.restrictions} onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })} placeholder={t("nutritionSection.restrictionsPlaceholder")} />
          <p className="text-sm text-muted-foreground">{t("nutritionSection.restrictionsHelper")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="allergies">{t("nutritionSection.allergies")}</Label>
          <Input id="allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder={t("nutritionSection.allergiesPlaceholder")} />
          <p className="text-sm text-muted-foreground">{t("nutritionSection.allergiesHelper")}</p>
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {t("nutritionSection.saveChanges")}
      </Button>
    </Card>
  );
};