import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [completed, setCompleted] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [hadPain, setHadPain] = useState(false);
  const [painZones, setPainZones] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!completed || !rpe) {
      toast({
        title: "Informations manquantes",
        description: "Merci de répondre aux questions essentielles.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Sauvegarder dans Supabase
        const { error } = await supabase.from('feedback').insert({
          user_id: user.id,
          completed: completed === "yes",
          rpe: parseInt(rpe),
          had_pain: hadPain,
          pain_zones: painZones,
          comments: comments || null,
        });

        if (error) throw error;
      }

      toast({
        title: "Merci pour ton retour ! 🎉",
        description: "Tes feedbacks nous aident à améliorer ton programme.",
      });

      // Vérifier si c'est la première séance complétée
      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (feedbackCount === 1) {
        // Première séance terminée → Paywall obligatoire
        navigate("/paywall");
      } else {
        // Vérifier si l'utilisateur a un abonnement actif
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (subscription) {
          navigate("/dashboard");
        } else {
          navigate("/paywall");
        }
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ton feedback. Réessaye.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="app" />
      <div className="min-h-screen bg-muted/30 py-8 px-4 pt-24">
        <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center animate-in">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bravo ! 💪</h1>
          <p className="text-muted-foreground">
            Prends 30 secondes pour nous dire comment ça s'est passé.
          </p>
        </div>

        <Card className="p-8 space-y-6 animate-in">
          {/* Question 1: Completed? */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              As-tu terminé la séance ?
            </Label>
            <RadioGroup value={completed} onValueChange={setCompleted}>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer flex-1">Oui, entièrement !</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="cursor-pointer flex-1">Partiellement</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer flex-1">Non, j'ai dû arrêter</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question 2: RPE */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Comment tu te sens ? (Effort ressenti de 1 à 10)
            </Label>
            <RadioGroup value={rpe} onValueChange={setRpe}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div key={value} className="relative">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`rpe-${value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`rpe-${value}`}
                      className="flex h-12 items-center justify-center rounded-lg border-2 border-muted bg-background hover:bg-muted/50 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all font-semibold"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                1 = très facile • 10 = impossible
              </p>
            </RadioGroup>
          </div>

          {/* Question 3: Pain? */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="pain"
                checked={hadPain}
                onCheckedChange={(checked) => setHadPain(checked as boolean)}
              />
              <Label htmlFor="pain" className="text-base font-semibold cursor-pointer">
                J'ai ressenti une douleur inhabituelle
              </Label>
            </div>

            {hadPain && (
              <div className="ml-6 space-y-2">
                <Label className="text-sm">Où ? (plusieurs choix possibles)</Label>
                {["Épaule", "Coude", "Poignet", "Dos", "Hanche", "Genou", "Cheville", "Autre"].map((zone) => (
                  <div key={zone} className="flex items-center space-x-2">
                    <Checkbox
                      id={zone}
                      checked={painZones.includes(zone)}
                      onCheckedChange={(checked) => {
                        setPainZones(
                          checked
                            ? [...painZones, zone]
                            : painZones.filter((z) => z !== zone)
                        );
                      }}
                    />
                    <Label htmlFor={zone} className="text-sm cursor-pointer">
                      {zone}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question 4: Comments */}
          <div>
            <Label htmlFor="comments" className="text-base font-semibold mb-3 block">
              Un commentaire ? (optionnel)
            </Label>
            <Textarea
              id="comments"
              placeholder="ex: Exercice X trop difficile, super séance, etc."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            size="lg"
            variant="success"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Envoi..." : "Envoyer mon feedback"}
          </Button>
        </Card>
      </div>
      </div>
    </>
  );
};

export default Feedback;
