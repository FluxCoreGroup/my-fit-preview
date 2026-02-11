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
import { Smile, Meh, Frown, Angry, HelpCircle, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
        title: "🎉 Bravo !",
        description: "Ta séance a été enregistrée avec succès.",
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
      <DialogContent withClose={false} className="max-w-md bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-border/20 p-0 max-h-screen">
        {/* Header with gradient accent */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 h-24  flex flex-col justify-center items-center">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 mx-auto">
              <Sparkles className="w-4 h-4 text-primary" />
              <DialogTitle className="text-lg">Séance terminée !</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Bravo, tu as tout donné 💪
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* RPE Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-base font-semibold">Effort ressenti (RPE)</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs border-border">
                    <p className="font-medium mb-1">Rate of Perceived Exertion</p>
                    <p className="text-xs text-muted-foreground">
                      Échelle de 1 à 10 mesurant l'intensité ressentie.<br />
                      <span className="text-primary">6-7</span> = modéré, <span className="text-primary">8</span> = difficile, <span className="text-primary">9-10</span> = maximal
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-3 bg-muted/30 rounded-xl p-4">
              <Slider
                value={rpe}
                onValueChange={setRpe}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Facile</span>
                <span className="text-2xl font-bold text-primary">{rpe[0]}</span>
                <span className="text-xs text-muted-foreground">Maximal</span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Difficulty Section */}
          <div className="space-y-3">
            <label className="text-base font-semibold block">Comment c'était ?</label>
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
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-md" 
                        : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
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

          {/* Satisfaction Section - Star Rating */}
          <div className="space-y-3">
            <label className="text-base font-semibold block">Ta satisfaction</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= satisfaction;
                return (
                  <button
                    key={star}
                    onClick={() => setSatisfaction(star)}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
                        : "border-2 border-border/50 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Star className={cn("w-5 h-5", isSelected && "fill-current")} />
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Comments Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground block">
              Commentaires (optionnel)
            </label>
            <Textarea
              placeholder="Ressenti général, difficultés, remarques..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="resize-none bg-muted/30 border-border/50 focus:border-primary"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || difficulty === null}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/20"
            
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer et retourner au Hub"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
