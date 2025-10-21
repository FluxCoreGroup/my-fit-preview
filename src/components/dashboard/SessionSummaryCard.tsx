import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionSummaryCardProps {
  session: {
    id: string;
    exercises: any[];
  };
}

export const SessionSummaryCard = ({ session }: SessionSummaryCardProps) => {
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
    <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Séance du jour</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{estimatedDuration}min</span>
            </div>
          </div>
        </div>

        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {equipment.map((eq, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-primary/10 rounded-full">
                {eq}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {displayExercises.map((exercise: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                {idx + 1}
              </div>
              <span>{exercise.name}</span>
            </div>
          ))}
          {exercises.length > 6 && (
            <p className="text-xs text-muted-foreground ml-8">
              +{exercises.length - 6} autres exercices
            </p>
          )}
        </div>

        <Button asChild className="w-full" size="lg">
          <Link to="/session">
            <Play className="mr-2 w-5 h-5" />
            Démarrer la séance
          </Link>
        </Button>
      </div>
    </Card>
  );
};
