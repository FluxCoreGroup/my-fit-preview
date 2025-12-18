import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Info, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WeeklyFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WeeklyFeedbackModal = ({ open, onClose, onComplete }: WeeklyFeedbackModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [weight1, setWeight1] = useState<number | null>(null);
  const [weight2, setWeight2] = useState<number | null>(null);
  const [weight3, setWeight3] = useState<number | null>(null);
  const [adherence, setAdherence] = useState(80);
  const [rpe, setRpe] = useState<number | null>(null);
  const [hasPain, setHasPain] = useState("no");
  const [energy, setEnergy] = useState("normal");
  const [comment, setComment] = useState("");

  const resetForm = () => {
    setWeight1(null);
    setWeight2(null);
    setWeight3(null);
    setAdherence(80);
    setRpe(null);
    setHasPain("no");
    setEnergy("normal");
    setComment("");
  };

  const handleSubmit = async () => {
    if (!user) return;

    const weights = [weight1, weight2, weight3].filter(w => w !== null);
    if (weights.length === 0) {
      toast({
        title: "Poids manquant",
        description: "Entre au moins une mesure de poids",
        variant: "destructive",
      });
      return;
    }

    if (!rpe) {
      toast({
        title: "Champs requis",
        description: "Complète tous les champs obligatoires (*)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const currentWeekISO = format(new Date(), "yyyy-'W'II");
      const avgWeight = weights.reduce((a, b) => a + (b || 0), 0) / weights.length;

      const { error } = await supabase.from("weekly_checkins").insert({
        user_id: user.id,
        week_iso: currentWeekISO,
        weight_measure_1: weight1,
        weight_measure_2: weight2,
        weight_measure_3: weight3,
        average_weight: avgWeight,
        adherence_diet: adherence,
        rpe_avg: rpe,
        has_pain: hasPain === "yes",
        energy_level: energy,
        blockers: comment || null,
        pain_zones: hasPain === "yes" ? ["non_specifie"] : [],
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Check-in déjà fait",
            description: "Tu as déjà fait ton check-in cette semaine",
            variant: "destructive",
          });
          onClose();
          return;
        }
        throw error;
      }

      toast({
        title: "✅ Check-in enregistré !",
        description: "Génération de ta nouvelle semaine...",
      });

      resetForm();
      onComplete();
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

  const completedFields = [
    weight1 || weight2 || weight3,
    adherence,
    rpe,
    hasPain,
    energy,
  ].filter(Boolean).length;

  const isValid = (weight1 || weight2 || weight3) && adherence && rpe && hasPain && energy;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Semaine terminée ! 🎉
          </DialogTitle>
          <DialogDescription>
            Complète ton check-in pour débloquer ta nouvelle semaine d'entraînement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{completedFields}/5 champs</span>
            <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(completedFields / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Poids */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">Poids cette semaine (kg)</Label>
              <span className="text-xs text-muted-foreground">(1 mesure min.)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Lun *</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="75"
                  className="h-10 rounded-xl"
                  value={weight1 || ""}
                  onChange={(e) => setWeight1(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mer</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="74.8"
                  className="h-10 rounded-xl opacity-70"
                  value={weight2 || ""}
                  onChange={(e) => setWeight2(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ven</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="74.5"
                  className="h-10 rounded-xl opacity-70"
                  value={weight3 || ""}
                  onChange={(e) => setWeight3(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
          </div>

          {/* Adhérence nutrition */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Adhérence nutrition *</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[adherence]}
                onValueChange={([v]) => setAdherence(v)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <div className="w-14 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="font-bold">{adherence}%</span>
              </div>
            </div>
          </div>

          {/* RPE */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Difficulté ressentie *
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">1-3: Facile · 4-6: Modéré · 7-8: Difficile · 9-10: Max</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={rpe === level ? "default" : "outline"}
                  size="sm"
                  className={cn("h-9 text-sm font-bold rounded-lg p-0", rpe === level && "bg-primary")}
                  onClick={() => setRpe(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Douleur + Énergie */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Douleur ? *</Label>
              <RadioGroup value={hasPain} onValueChange={setHasPain}>
                <div className="flex gap-2">
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm",
                    hasPain === "no" ? "border-primary bg-primary/10" : "border-border"
                  )}>
                    <RadioGroupItem value="no" className="sr-only" />
                    <CheckCircle2 className="w-4 h-4" />
                    Non
                  </label>
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm",
                    hasPain === "yes" ? "border-destructive bg-destructive/10" : "border-border"
                  )}>
                    <RadioGroupItem value="yes" className="sr-only" />
                    <AlertCircle className="w-4 h-4" />
                    Oui
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Énergie *</Label>
              <RadioGroup value={energy} onValueChange={setEnergy}>
                <div className="flex gap-1">
                  {[
                    { value: "low", label: "↓", text: "Faible" },
                    { value: "normal", label: "→", text: "Normal" },
                    { value: "high", label: "↑", text: "Élevée" }
                  ].map(({ value, label, text }) => (
                    <label key={value} className={cn(
                      "flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all",
                      energy === value ? "border-primary bg-primary/10" : "border-border"
                    )}>
                      <RadioGroupItem value={value} className="sr-only" />
                      <span className="text-lg">{label}</span>
                      <span className="text-xs text-muted-foreground">{text}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Commentaire (optionnel)</Label>
            <Textarea
              placeholder="Ex: Blessure, semaine chargée..."
              className="rounded-xl min-h-[60px] text-sm"
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-primary to-secondary mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Valider et générer ma nouvelle semaine
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
