import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface PostWorkoutShareModalProps {
  open: boolean;
  onClose: () => void;
  rpe: number;
  difficultyLabel: string;
  setsCompleted: number;
  sessionName?: string;
  durationSeconds?: number;
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
};

export const PostWorkoutShareModal = ({
  open,
  onClose,
  setsCompleted,
  durationSeconds = 0,
}: PostWorkoutShareModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation("training");

  const durationLine = durationSeconds > 0 ? ` ${t("share.in")} ${formatDuration(durationSeconds)}` : "";

  const shareText =
    `🏋️ ${t("share.sessionValidated")}\n\n` +
    `${setsCompleted} ${t("share.setsCompleted")}${durationLine}.\n\n` +
    `${t("share.oneMoreToGoal")}\n` +
    `${t("share.whoTrainsToday")}\n\n` +
    `👉 https://www.pulse-ai.app`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t("share.shareTitle"), text: shareText, url: "https://www.pulse-ai.app" });
        onClose();
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: t("share.copied"), description: t("share.copiedDesc") });
        onClose();
      } catch {
        toast({ title: t("share.error"), description: t("share.copyError"), variant: "destructive" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent withClose={false} className="max-w-sm bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-border/20 p-0">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-5 flex flex-col items-center gap-1 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-bold">{t("share.sessionSaved")}</DialogTitle>
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <DialogHeader>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              {t("share.shareProgress")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <div className="bg-muted/40 border border-border/40 rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">{t("share.preview")}</p>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{shareText}</pre>
          </div>

          <Button onClick={handleShare} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl py-5 text-base font-semibold shadow-lg shadow-primary/20">
            <Share2 className="w-4 h-4 mr-2" />
            {t("share.shareSession")}
          </Button>

          <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground hover:text-foreground">
            {t("share.continueWithout")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
