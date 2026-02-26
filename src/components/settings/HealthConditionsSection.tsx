import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HealthConditionsSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({ health_conditions: "" });

  useEffect(() => { fetchGoals(); }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("goals").select("health_conditions").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setFormData({ health_conditions: data.health_conditions?.join(", ") || "" });
    } catch (error: any) { console.error("Error fetching goals:", error); } finally { setFetchLoading(false); }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: existingGoals } = await supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle();
      const { error } = await supabase.from("goals").upsert({ ...existingGoals, user_id: user.id, health_conditions: formData.health_conditions ? formData.health_conditions.split(",").map(c => c.trim()).filter(Boolean) : [] }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success(t("healthConditions.updated"));
    } catch (error: any) {
      toast.error(t("healthConditions.updateError"));
      console.error(error);
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Card className="p-6 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></Card>;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">{t("healthConditions.title")}</h2>
        <p className="text-muted-foreground">{t("healthConditions.subtitle")}</p>
      </div>
      <div className="bg-accent/10 border border-accent rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-accent-foreground">{t("healthConditions.important")}</p>
          <p className="text-muted-foreground">{t("healthConditions.disclaimer")}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="health_conditions">{t("healthConditions.label")}</Label>
        <Input id="health_conditions" value={formData.health_conditions} onChange={(e) => setFormData({ ...formData, health_conditions: e.target.value })} placeholder={t("healthConditions.placeholder")} />
        <p className="text-sm text-muted-foreground">{t("healthConditions.helper")}</p>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {t("healthConditions.saveChanges")}
      </Button>
    </Card>
  );
};