import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Minus } from "lucide-react";

type HydrationTrackerProps = {
  goalMl: number;
};

export const HydrationTracker = ({ goalMl }: HydrationTrackerProps) => {
  const [consumed, setConsumed] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`hydration-${today}`);
    if (stored) {
      setConsumed(parseInt(stored, 10));
    }
  }, []);

  const updateConsumed = (amount: number) => {
    const newValue = Math.max(0, Math.min(consumed + amount, goalMl * 1.5));
    setConsumed(newValue);
    const today = new Date().toDateString();
    localStorage.setItem(`hydration-${today}`, newValue.toString());
  };

  const percentage = Math.min(100, (consumed / goalMl) * 100);

  const getMotivationalMessage = () => {
    if (percentage >= 100) return "🎉 Objectif atteint ! Champion de l'hydratation !";
    if (percentage >= 81) return "🚀 Tu touches au but, plus qu'un peu !";
    if (percentage >= 61) return "⚡ Presque là, encore un effort !";
    if (percentage >= 41) return "🔥 Tu es à mi-chemin, ne lâche rien !";
    if (percentage >= 21) return "💪 Continue, tu es lancé !";
    return "💧 Commence à t'hydrater, c'est le plus dur !";
  };

  const getBackgroundGradient = () => {
    if (percentage >= 80) return "from-primary/10 to-primary/5";
    if (percentage >= 50) return "from-accent/10 to-accent/5";
    return "from-muted/10 to-muted/5";
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${getBackgroundGradient()} border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50`}>
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="text-sm font-bold">Hydratation</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Objectif quotidien</span>
          <span className="font-semibold">{(goalMl / 1000).toFixed(1)}L</span>
        </div>
        
        <Progress value={percentage} className="h-3" />
        
        <div className="p-3 rounded-lg bg-background/40 border border-primary/10">
          <p className="text-sm font-semibold text-center animate-fade-in">
            {getMotivationalMessage()}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {consumed}ml / {goalMl}ml
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
              onClick={() => updateConsumed(-250)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
              onClick={() => updateConsumed(250)}
            >
              +250ml
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
              onClick={() => updateConsumed(500)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
