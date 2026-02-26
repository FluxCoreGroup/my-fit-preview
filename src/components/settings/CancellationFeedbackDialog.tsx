import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface CancellationFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'cancel_subscription' | 'delete_account';
  onConfirm: () => void;
}

export const CancellationFeedbackDialog = ({ open, onOpenChange, actionType, onConfirm }: CancellationFeedbackDialogProps) => {
  const { user } = useAuth();
  const { t } = useTranslation("settings");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    { key: "tooExpensive", label: t("cancellation.reasons.tooExpensive") },
    { key: "notUsedEnough", label: t("cancellation.reasons.notUsedEnough") },
    { key: "notFound", label: t("cancellation.reasons.notFound") },
    { key: "technicalIssue", label: t("cancellation.reasons.technicalIssue") },
    { key: "badUx", label: t("cancellation.reasons.badUx") },
    { key: "other", label: t("cancellation.reasons.other") },
  ];

  const handleSubmit = async () => {
    if (!reason) { toast.error(t("cancellation.selectReason")); return; }
    if (!user) { toast.error(t("cancellation.sessionExpired")); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('cancellation_feedback').insert({ user_id: user.id, action_type: actionType, reason, additional_comments: comments || null });
      if (error) throw error;
      toast.success(t("cancellation.thankYou"));
      onConfirm();
    } catch (error) {
      toast.error(t("cancellation.feedbackError"));
      console.error(error);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{actionType === 'cancel_subscription' ? t("cancellation.cancelTitle") : t("cancellation.deleteTitle")}</DialogTitle>
          <DialogDescription>{t("cancellation.feedbackDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reasons.map((r) => (
              <div key={r.key} className="flex items-center space-x-2">
                <RadioGroupItem value={r.label} id={r.key} />
                <Label htmlFor={r.key} className="cursor-pointer">{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <Textarea placeholder={t("cancellation.additionalComments")} value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancellation.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading || !reason} variant="destructive">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {actionType === 'cancel_subscription' ? t("cancellation.cancelSubscription") : t("cancellation.deleteMyAccount")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};