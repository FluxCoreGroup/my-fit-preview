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

interface CancellationFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'cancel_subscription' | 'delete_account';
  onConfirm: () => void;
}

export const CancellationFeedbackDialog = ({ 
  open, 
  onOpenChange, 
  actionType,
  onConfirm 
}: CancellationFeedbackDialogProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Trop cher",
    "Je n'utilise pas assez l'app",
    "Je n'ai pas trouvé ce que je cherchais",
    "Problème technique",
    "Mauvaise expérience utilisateur",
    "Autre raison"
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Merci de sélectionner une raison");
      return;
    }

    if (!user) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cancellation_feedback')
        .insert({
          user_id: user.id,
          action_type: actionType,
          reason: reason,
          additional_comments: comments || null
        });

      if (error) throw error;

      toast.success("Merci pour ton retour !");
      onConfirm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du feedback");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === 'cancel_subscription' 
              ? "Pourquoi annules-tu ton abonnement ?" 
              : "Pourquoi supprimes-tu ton compte ?"}
          </DialogTitle>
          <DialogDescription>
            Ton avis nous aide à améliorer Pulse.ai. Cela prend 30 secondes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reasons.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r} className="cursor-pointer">{r}</Label>
              </div>
            ))}
          </RadioGroup>

          <Textarea
            placeholder="Commentaires supplémentaires (optionnel)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !reason}
            variant="destructive"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {actionType === 'cancel_subscription' 
              ? "Annuler mon abonnement" 
              : "Supprimer mon compte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
