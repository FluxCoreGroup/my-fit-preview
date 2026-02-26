import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Smile, Meh, Frown, Angry, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostWorkoutShareModal } from "@/components/training/PostWorkoutShareModal";
import { useTranslation } from "react-i18next";

interface SessionFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  exerciseLogs: Array<{
    exerciseName: string;
    setNumber: number;
    weightUsed: number;
    rpe: number;
  }>;
  totalSets?: number;
  durationSeconds?: number;
}

export const SessionFeedbackModal = ({
  open,
  onClose,
  sessionId,
  exerciseLogs,
  totalSets,
  durationSeconds = 0,
}: SessionFeedbackModalProps) => {
  const { t } = useTranslation("training");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rpe, setRpe] = useState([7]);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedDifficulty, setSavedDifficulty] = useState<string>("");

  const difficultyOptions = [
    { value: 1, icon: Smile, label: t("feedback.easy"), color: "text-green-500" },
    { value: 2, icon: Meh, label: t("feedback.moderate"), color: "text-yellow-500" },
    { value: 3, icon: Frown, label: t("feedback.hard"), color: "text-orange-500" },
    { value: 4, icon: Angry, label: t("feedback.veryHard"), color: "text-red-500" },
  ];

  const getRpeHint = (rpeVal: number) => {
    if (rpeVal >= 9) return t("feedback.rpeHintHigh");
    if (rpeVal <= 5) return t("feedback.rpeHintLow");
    return null;
  };

  const handleSubmit = async () => {
    if (!user || difficulty === null) {
      toast({
        title: t("feedback.error"),
        description: t("feedback.selectDifficulty"),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await supabase.from('feedback').insert({
        user_id: user.id,
        session_id: sessionId,
        rpe: rpe[0],
        completed: true,
        comments: comments || null
      });

      if (exerciseLogs.length > 0) {
        await supabase.from('exercise_logs').insert(
          exerciseLogs.map(log => ({
            user_id: user.id,
            session_id: sessionId,
            exercise_name: log.exerciseName,
            set_number: log.setNumber,
            weight_used: log.weightUsed,
            rpe_felt: log.rpe
          }))
        );
      }

      toast({
        title: t("feedback.successTitle"),
        description: t("feedback.successDesc"),
      });

      setSavedDifficulty(difficultyOptions.find(d => d.value === difficulty)?.label || "");
      setShowShareModal(true);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: t("feedback.error"),
        description: t("feedback.saveError"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rpeHint = getRpeHint(rpe[0]);

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent withClose={false} className="max-w-md bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-border/20 p-0 max-h-screen">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 h-24 flex flex-col justify-center items-center">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 mx-auto">
              <Sparkles className="w-4 h-4 text-primary" />
              <DialogTitle className="text-lg">{t("feedback.sessionDone")}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              {t("feedback.congrats")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-base font-semibold">{t("feedback.rpeLabel")}</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs border-border">
                    <p className="font-medium mb-1">Rate of Perceived Exertion</p>
                    <p className="text-xs text-muted-foreground">
                      {t("feedback.rpeTooltip")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-3 bg-muted/30 rounded-xl p-4">
              <Slider value={rpe} onValueChange={setRpe} min={1} max={10} step={1} className="w-full" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{t("feedback.easy")}</span>
                <span className="text-2xl font-bold text-primary">{rpe[0]}</span>
                <span className="text-xs text-muted-foreground">{t("feedback.maximal")}</span>
              </div>
            </div>
            {rpeHint && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">{rpeHint}</p>
            )}
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <label className="text-base font-semibold block">{t("feedback.howWasIt")}</label>
            <div className="grid grid-cols-4 gap-2">
              {difficultyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = difficulty === option.value;
                return (
                  <Button
                    key={option.value}
                    variant="outline"
                    className={cn(
                      "flex flex-col h-auto py-3 transition-all border-2",
                      isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    )}
                    onClick={() => setDifficulty(option.value)}
                  >
                    <Icon className={cn("w-6 h-6 mb-1", option.color)} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground block">{t("feedback.commentsLabel")}</label>
            <Textarea
              placeholder={t("feedback.commentsPlaceholder")}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="resize-none bg-muted/30 border-border/50 focus:border-primary"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || difficulty === null}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? t("feedback.saving") : t("feedback.saveAndReturn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <PostWorkoutShareModal
      open={showShareModal}
      onClose={() => { setShowShareModal(false); onClose(); navigate("/training"); }}
      rpe={rpe[0]}
      difficultyLabel={savedDifficulty}
      setsCompleted={totalSets ?? exerciseLogs.length}
      durationSeconds={durationSeconds}
    />
    </>
  );
};
