import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  Timer,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { ExerciseImage } from "./ExerciseImage";
import { ExerciseImageModal } from "./ExerciseImageModal";

interface Exercise {
  name: string;
  englishName?: string;
  sets: number;
  reps: string;
  rest: number;
  rpe: number;
  rir: number;
  tips?: string[];
  commonMistakes?: string[];
}

interface SessionDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionName: string;
  estimatedTime: number;
  warmup: string[];
  exercises: Exercise[];
  checklist: string[];
  coachNotes: string;
}

export const SessionDetailsDrawer = ({
  open,
  onOpenChange,
  sessionName,
  estimatedTime,
  warmup,
  exercises,
  checklist,
  coachNotes,
}: SessionDetailsDrawerProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="text-xl">{sessionName}</DrawerTitle>
            <DrawerDescription className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />~{estimatedTime}min
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4" />
                {exercises.length} exercices
              </span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-8 overflow-y-auto space-y-4">
            {/* Warmup */}
            {warmup.length > 0 && (
              <div className="p-4 bg-card/50 rounded-xl border border-primary/10">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4 text-primary" />
                  ÉCHAUFFEMENT
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {warmup.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exercises */}
            <div className="p-4 bg-card/50 rounded-xl border border-secondary/10">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Dumbbell className="w-4 h-4 text-secondary" />
                EXERCICES
              </h4>
              <div className="space-y-2">
                {exercises.map((exercise, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <ExerciseImage
                      exerciseName={exercise.name}
                      englishName={exercise.englishName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.sets}×{exercise.reps} • {exercise.rest}s repos
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      RPE {exercise.rpe}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            {checklist.length > 0 && (
              <div className="p-4 bg-card/50 rounded-xl border border-accent/10">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  CHECKLIST
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">☐</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coach Notes */}
            {coachNotes && (
              <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  NOTES DU COACH
                </h4>
                <p className="text-sm text-muted-foreground">{coachNotes}</p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseImageModal
          exerciseName={selectedExercise.name}
          englishName={selectedExercise.englishName}
          open={!!selectedExercise}
          onOpenChange={(open) => !open && setSelectedExercise(null)}
          tips={selectedExercise.tips}
          commonMistakes={selectedExercise.commonMistakes}
        />
      )}
    </>
  );
};
