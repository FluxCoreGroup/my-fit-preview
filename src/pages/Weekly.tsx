import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { TrendingUp, Info, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

const Weekly = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  const [weight1, setWeight1] = useState<number | null>(null);
  const [weight2, setWeight2] = useState<number | null>(null);
  const [weight3, setWeight3] = useState<number | null>(null);
  const [adherence, setAdherence] = useState(80);
  const [rpe, setRpe] = useState<number | null>(null);
  const [hasPain, setHasPain] = useState("no");
  const [energy, setEnergy] = useState("normal");
  const [comment, setComment] = useState("");

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

      const { error } = await supabase.from("weekly_checkins").insert({
        user_id: user.id,
        week_iso: currentWeekISO,
        weight_measure_1: weight1,
        weight_measure_2: weight2,
        weight_measure_3: weight3,
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
          navigate("/progression");
          return;
        }
        throw error;
      }

      toast({
        title: "✅ Check-in enregistré !",
        description: "Recommandations à jour",
      });

      navigate("/progression");
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
    <div className="min-h-screen bg-background pb-20">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-20 px-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-4 rounded-2xl mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Check-in hebdomadaire
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            2 minutes pour ajuster ton programme
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {completedFields}/5 champs remplis
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${(completedFields / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6 rounded-2xl space-y-6">
          {/* Poids */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Poids cette semaine (kg) *
            </Label>
            <div className={isMobile ? "space-y-2" : "grid grid-cols-3 gap-3"}>
              <div>
                <Label className="text-xs text-muted-foreground">Lundi</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="75,0"
                  className="h-12 text-lg rounded-xl"
                  value={weight1 || ""}
                  onChange={(e) => setWeight1(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mercredi</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="74,8"
                  className="h-12 text-lg rounded-xl"
                  value={weight2 || ""}
                  onChange={(e) => setWeight2(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vendredi</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="74,5"
                  className="h-12 text-lg rounded-xl"
                  value={weight3 || ""}
                  onChange={(e) => setWeight3(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Au moins 1 mesure requise, le matin à jeun
            </p>
          </div>

          {/* Adhérence nutrition */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Adhérence nutrition (%) *
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[adherence]}
                onValueChange={([v]) => setAdherence(v)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <div className="w-16 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold">{adherence}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              % de jours où tu as respecté ton plan nutrition
            </p>
          </div>

          {/* RPE */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              Difficulté des entraînements *
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    <strong>RPE 1-3 :</strong> Très facile<br />
                    <strong>RPE 4-6 :</strong> Modéré<br />
                    <strong>RPE 7-8 :</strong> Difficile<br />
                    <strong>RPE 9-10 :</strong> Maximal
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={rpe === level ? "default" : "outline"}
                  className={cn(
                    "h-12 text-lg font-bold rounded-xl",
                    rpe === level && "bg-primary"
                  )}
                  onClick={() => setRpe(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Douleur */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Douleur cette semaine ? *
            </Label>
            <RadioGroup value={hasPain} onValueChange={setHasPain}>
              <div className="grid grid-cols-2 gap-3">
                <label className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  hasPain === "no" ? "border-primary bg-primary/10" : "border-border"
                )}>
                  <RadioGroupItem value="no" id="pain-no" className="sr-only" />
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Non</span>
                </label>
                <label className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  hasPain === "yes" ? "border-destructive bg-destructive/10" : "border-border"
                )}>
                  <RadioGroupItem value="yes" id="pain-yes" className="sr-only" />
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Oui</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Énergie */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Niveau d'énergie général *
            </Label>
            <RadioGroup value={energy} onValueChange={setEnergy}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "low", label: "Faible" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "Élevé" }
                ].map(({ value, label }) => (
                  <label key={value} className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    energy === value ? "border-primary bg-primary/10" : "border-border"
                  )}>
                    <RadioGroupItem value={value} id={`energy-${value}`} className="sr-only" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Commentaire */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Commentaire (optionnel)
            </Label>
            <Textarea
              placeholder="Ex: Blessure au genou, semaine très chargée..."
              className="rounded-xl min-h-[80px]"
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </Card>

        <div className={cn(
          "mt-6",
          isMobile && "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t"
        )}>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Enregistrer mon check-in
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Weekly;
