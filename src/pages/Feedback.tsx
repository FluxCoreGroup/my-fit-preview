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
import { useTranslation } from "react-i18next";

const Feedback = () => {
  const { t } = useTranslation("training");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [completed, setCompleted] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [hadPain, setHadPain] = useState(false);
  const [painZones, setPainZones] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const painZoneKeys = ["shoulder", "elbow", "wrist", "back", "hip", "knee", "ankle", "other"] as const;

  const handleSubmit = async () => {
    if (!completed || !rpe) {
      toast({ title: t("feedback.missingInfo"), description: t("feedback.missingInfoDesc"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        const { error } = await supabase.from('feedback').insert({
          user_id: user.id, completed: completed === "yes", rpe: parseInt(rpe),
          had_pain: hadPain, pain_zones: painZones, comments: comments || null,
        });
        if (error) throw error;
      }
      toast({ title: t("feedback.thankYou"), description: t("feedback.thankYouDesc"), duration: 2000 });
      navigate("/hub");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({ title: t("feedback.error"), description: t("feedback.errorDesc"), variant: "destructive" });
    } finally { setLoading(false); }
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
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              {t("feedback.title")} <ThumbsUp className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground">{t("feedback.subtitle")}</p>
          </div>

          <Card className="p-8 space-y-6 animate-in">
            <div>
              <Label className="text-base font-semibold mb-3 block">{t("feedback.completedQuestion")}</Label>
              <RadioGroup value={completed} onValueChange={setCompleted}>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="cursor-pointer flex-1">{t("feedback.completedYes")}</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial" className="cursor-pointer flex-1">{t("feedback.completedPartial")}</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="cursor-pointer flex-1">{t("feedback.completedNo")}</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">{t("feedback.rpeQuestion")}</Label>
              <RadioGroup value={rpe} onValueChange={setRpe}>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map((value) => (
                    <div key={value} className="relative">
                      <RadioGroupItem value={value.toString()} id={`rpe-${value}`} className="peer sr-only" />
                      <Label htmlFor={`rpe-${value}`} className="flex h-10 sm:h-12 items-center justify-center rounded-lg border-2 border-muted bg-background hover:bg-muted/50 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all font-semibold text-sm sm:text-base">{value}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("feedback.rpeScale")}</p>
              </RadioGroup>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox id="pain" checked={hadPain} onCheckedChange={(checked) => setHadPain(checked as boolean)} />
                <Label htmlFor="pain" className="text-base font-semibold cursor-pointer">{t("feedback.painQuestion")}</Label>
              </div>
              {hadPain && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm">{t("feedback.painWhere")}</Label>
                  {painZoneKeys.map((key) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={painZones.includes(t(`feedback.painZones.${key}`))} onCheckedChange={(checked) => {
                        const zone = t(`feedback.painZones.${key}`);
                        setPainZones(checked ? [...painZones, zone] : painZones.filter((z) => z !== zone));
                      }} />
                      <Label htmlFor={key} className="text-sm cursor-pointer">{t(`feedback.painZones.${key}`)}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="comments" className="text-base font-semibold mb-3 block">{t("feedback.commentLabel")}</Label>
              <Textarea id="comments" placeholder={t("feedback.commentPlaceholder")} value={comments} onChange={(e) => setComments(e.target.value)} className="min-h-[100px]" />
            </div>

            <Button size="lg" variant="success" onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? t("feedback.submitting") : t("feedback.submit")}
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Feedback;
