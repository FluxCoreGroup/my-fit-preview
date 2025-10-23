import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Smile, Meh, Frown, Angry } from "lucide-react";

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
}

export const SessionFeedbackModal = ({
  open,
  onClose,
  sessionId,
  exerciseLogs
}: SessionFeedbackModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rpe, setRpe] = useState([7]);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [satisfaction, setSatisfaction] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difficultyOptions = [
    { value: 1, icon: Smile, label: "Facile", color: "text-green-500" },
    { value: 2, icon: Meh, label: "Modéré", color: "text-yellow-500" },
    { value: 3, icon: Frown, label: "Dur", color: "text-orange-500" },
    { value: 4, icon: Angry, label: "Très dur", color: "text-red-500" },
  ];

  const handleSubmit = async () => {
    if (!user || difficulty === null) {
      toast({
        title: "Erreur",
        description: "Merci de sélectionner une difficulté",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save feedback
      await supabase.from('feedback').insert({
        user_id: user.id,
        session_id: sessionId,
        rpe: rpe[0],
        completed: true,
        comments: comments || null
      });

      // Save exercise logs with weights
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
        title: "🎉 Feedback enregistré !",
        description: "Tes données ont été sauvegardées avec succès.",
      });

      onClose();
      navigate("/training");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">🎉 Séance terminée !</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* RPE Global */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              RPE global (1-10)
            </label>
            <div className="space-y-2">
              <Slider
                value={rpe}
                onValueChange={setRpe}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Facile</span>
                <span className="text-lg font-bold text-primary">{rpe[0]}</span>
                <span>Maximal</span>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Comment c'était ?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {difficultyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={difficulty === option.value ? "default" : "outline"}
                    className={`flex flex-col h-auto py-3 ${
                      difficulty === option.value 
                        ? "bg-primary/20 border-primary" 
                        : "hover:bg-primary/5"
                    }`}
                    onClick={() => setDifficulty(option.value)}
                  >
                    <Icon className={`w-6 h-6 mb-1 ${option.color}`} />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Satisfaction
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSatisfaction(star)}
                  className="transition-transform hover:scale-110"
                >
                  <span className={`text-3xl ${
                    star <= satisfaction ? "text-yellow-500" : "text-gray-300"
                  }`}>
                    ⭐
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Commentaires (optionnel)
            </label>
            <Textarea
              placeholder="Ressenti général, difficultés, remarques..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || difficulty === null}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer & Retour au Hub"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};