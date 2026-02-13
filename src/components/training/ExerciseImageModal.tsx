import { useExerciseImage } from "@/hooks/useExerciseImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell } from "lucide-react";

interface ExerciseImageModalProps {
  exerciseName: string;
  englishName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tips?: string[];
  commonMistakes?: string[];
}

export const ExerciseImageModal = ({
  exerciseName,
  englishName,
  open,
  onOpenChange,
  tips = [],
  commonMistakes = [],
}: ExerciseImageModalProps) => {
  const { gifUrl, imageUrl, muscleGroup, isLoading, source } = useExerciseImage(
    exerciseName,
    englishName,
  );

  const displayUrl = gifUrl || imageUrl;
  const isVideo = displayUrl?.includes(".mp4");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            {exerciseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image/GIF Display */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/30 border border-white/10">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : isVideo ? (
              <video
                src={displayUrl}
                className="w-full h-full object-contain"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={displayUrl}
                alt={exerciseName}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Muscle Group Badge */}
          {muscleGroup && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {muscleGroup}
              </Badge>
              {source === "local" && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  Bibliothèque locale
                </Badge>
              )}
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Consignes clés</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Erreurs à éviter</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
