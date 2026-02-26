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
import { useTranslation } from "react-i18next";

export const PhysicalInfoSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({ birth_date: "", age: "", sex: "", weight: "", height: "", target_weight_loss: "", activity_level: "" });

  useEffect(() => { fetchGoals(); }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("goals").select("age, sex, weight, height, target_weight_loss, activity_level, birth_date").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        const calculatedAge = data.birth_date ? calculateAge(data.birth_date).toString() : data.age?.toString() || "";
        setFormData({ birth_date: data.birth_date || "", age: calculatedAge, sex: data.sex || "", weight: data.weight?.toString() || "", height: data.height?.toString() || "", target_weight_loss: data.target_weight_loss?.toString() || "", activity_level: data.activity_level || "" });
      }
    } catch (error: any) { console.error("Error fetching goals:", error); } finally { setFetchLoading(false); }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existingGoals } = await supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle();
      const { error } = await supabase.from("goals").upsert({ ...existingGoals, user_id: user.id, height: formData.height ? parseInt(formData.height) : null, target_weight_loss: formData.target_weight_loss ? parseInt(formData.target_weight_loss) : null, activity_level: formData.activity_level || null }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success(t("physicalInfo.updated"));
    } catch (error: any) {
      toast.error(t("physicalInfo.updateError"));
      console.error(error);
    } finally { setLoading(false); }
  };

  const getSexLabel = (sex: string) => {
    if (sex === "male") return t("physicalInfo.male");
    if (sex === "female") return t("physicalInfo.female");
    return sex || t("physicalInfo.notSpecified");
  };

  if (fetchLoading) return <Card className="p-6 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></Card>;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">{t("physicalInfo.title")}</h2>
        <p className="text-muted-foreground">{t("physicalInfo.subtitle")}</p>
      </div>

      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Lock className="w-4 h-4" /><span>{t("physicalInfo.readonlyInfo")}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{t("physicalInfo.birthDate")}</Label>
            <div className="p-3 bg-background rounded-md border text-foreground">
              {formData.birth_date ? formatBirthDate(formData.birth_date) : t("physicalInfo.notProvided")}
              {formData.age && <span className="text-muted-foreground ml-2">({formData.age} {t("physicalInfo.years")})</span>}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("physicalInfo.sex")}</Label>
            <div className="p-3 bg-background rounded-md border text-foreground">{getSexLabel(formData.sex)}</div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><Weight className="w-4 h-4" />{t("physicalInfo.initialWeight")}</Label>
            <div className="p-3 bg-background rounded-md border text-foreground flex items-center justify-between">
              <span>{formData.weight ? `${formData.weight} kg` : t("physicalInfo.notSpecified")}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Info className="w-3 h-3" /><span>{t("physicalInfo.weeklyCheckins")}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-2">{t("physicalInfo.editableInfo")}</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-2"><Ruler className="w-4 h-4" />{t("physicalInfo.height")}</Label>
            <Input id="height" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="175" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />{t("physicalInfo.targetWeightLoss")}</Label>
            <Input id="target" type="number" value={formData.target_weight_loss} onChange={(e) => setFormData({ ...formData, target_weight_loss: e.target.value })} placeholder="5" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="activity">{t("physicalInfo.activityLevel")}</Label>
            <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
              <SelectTrigger id="activity"><SelectValue placeholder={t("physicalInfo.selectPlaceholder")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">{t("physicalInfo.sedentary")}</SelectItem>
                <SelectItem value="light">{t("physicalInfo.light")}</SelectItem>
                <SelectItem value="moderate">{t("physicalInfo.moderate")}</SelectItem>
                <SelectItem value="active">{t("physicalInfo.active")}</SelectItem>
                <SelectItem value="very_active">{t("physicalInfo.veryActive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {t("physicalInfo.saveChanges")}
      </Button>
    </Card>
  );
};
