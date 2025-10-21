import { Card } from "@/components/ui/card";
import { Clock, Dumbbell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SessionSummaryCardProps {
  session: {
    id: string;
    exercises: any[];
  };
}

export const SessionSummaryCard = ({ session }: SessionSummaryCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const exercises = session.exercises || [];
  const displayExercises = exercises.slice(0, 6);
  const estimatedDuration = exercises.length * 5;
  
  // Extract unique equipment from exercises
  const equipment = [...new Set(
    exercises
      .map((ex: any) => ex.equipment)
      .filter(Boolean)
  )].slice(0, 3);

  return (
    <Card className="p-4 bg-primary/5 border-primary/10">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Dumbbell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">Séance du jour</h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>~{estimatedDuration}min</span>
            </div>
          </div>

          {equipment.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {equipment.map((eq, idx) => (
                <span key={idx} className="px-2 py-0.5 text-[10px] bg-primary/10 rounded-full">
                  {eq}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            {displayExercises.map((exercise: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                  {idx + 1}
                </div>
                <span className="text-sm">{exercise.name}</span>
              </div>
            ))}
            {exercises.length > 6 && (
              <p className="text-xs text-muted-foreground ml-7">
                +{exercises.length - 6} autres
              </p>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 p-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
              <span className="text-xs font-medium">
                {expanded ? "Masquer" : "Voir détails"}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 pt-1">
            {exercises.map((exercise: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-background/50 rounded-lg space-y-0.5 border border-border/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className="text-sm font-semibold">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      {exercise.sets && <span>• {exercise.sets} séries</span>}
                      {exercise.reps && <span>• {exercise.reps} reps</span>}
                      {exercise.rest && <span>• {exercise.rest}s repos</span>}
                      {exercise.tempo && <span>• Tempo: {exercise.tempo}</span>}
                    </div>
                    {exercise.notes && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">💡 {exercise.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
};
