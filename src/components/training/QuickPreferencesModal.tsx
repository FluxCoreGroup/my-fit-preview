import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface QuickPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const QuickPreferencesModal = ({ open, onClose, onSave }: QuickPreferencesModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation("training");
  const [frequency, setFrequency] = useState(4);
  const [duration, setDuration] = useState(60);
  const [focus, setFocus] = useState<"strength" | "hypertrophy">("hypertrophy");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error: goalsError } = await supabase.from('goals').update({ frequency, session_duration: duration }).eq('user_id', user.id);
      if (goalsError) throw goalsError;

      const { error: prefsError } = await supabase.from('training_preferences').upsert({
        user_id: user.id,
        session_type: focus === "strength" ? "strength" : "mixed",
        progression_focus: focus,
        experience_level: "intermediate",
        split_preference: "full_body",
        mobility_preference: "occasional"
      });
      if (prefsError) throw prefsError;

      toast({ title: t("quickPrefs.updated"), description: t("quickPrefs.updatedDesc") });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({ title: t("quickPrefs.error"), description: t("quickPrefs.errorDesc"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl">⚙️ {t("quickPrefs.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-medium mb-3 block">{t("quickPrefs.frequency")}</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((freq) => (
                <Button key={freq} variant={frequency === freq ? "default" : "outline"} onClick={() => setFrequency(freq)}
                  className={`flex-1 ${frequency === freq ? "bg-primary/20 border-primary" : "hover:bg-primary/5"}`}>
                  {freq}x
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("quickPrefs.sessionsPerWeek", { count: frequency })}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{t("quickPrefs.duration")}</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((dur) => (
                <Button key={dur} variant={duration === dur ? "default" : "outline"} onClick={() => setDuration(dur)}
                  className={`${duration === dur ? "bg-secondary/20 border-secondary" : "hover:bg-secondary/5"}`}>
                  {dur}min
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{t("quickPrefs.mainGoal")}</label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant={focus === "strength" ? "default" : "outline"} onClick={() => setFocus("strength")}
                className={`h-auto py-4 flex flex-col gap-2 ${focus === "strength" ? "bg-accent/20 border-accent" : "hover:bg-accent/5"}`}>
                <span className="text-2xl">💪</span>
                <span className="font-semibold">{t("quickPrefs.strength")}</span>
                <span className="text-xs text-muted-foreground">{t("quickPrefs.strengthDesc")}</span>
              </Button>
              <Button variant={focus === "hypertrophy" ? "default" : "outline"} onClick={() => setFocus("hypertrophy")}
                className={`h-auto py-4 flex flex-col gap-2 ${focus === "hypertrophy" ? "bg-accent/20 border-accent" : "hover:bg-accent/5"}`}>
                <span className="text-2xl">🏋️</span>
                <span className="font-semibold">{t("quickPrefs.hypertrophy")}</span>
                <span className="text-xs text-muted-foreground">{t("quickPrefs.hypertrophyDesc")}</span>
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1">{t("quickPrefs.cancel")}</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
              {isSaving ? t("quickPrefs.saving") : t("quickPrefs.regenerate")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
