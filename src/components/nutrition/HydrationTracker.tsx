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

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Droplet className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Hydratation</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Objectif quotidien</span>
          <span className="font-semibold">{(goalMl / 1000).toFixed(1)}L</span>
        </div>
        
        <Progress value={percentage} className="h-2" />
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {consumed}ml / {goalMl}ml
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateConsumed(-250)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => updateConsumed(250)}
            >
              +250ml
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateConsumed(500)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          💡 {(goalMl / 1000 / 8).toFixed(1)}L par jour recommandé
        </p>
      </div>
    </Card>
  );
};
