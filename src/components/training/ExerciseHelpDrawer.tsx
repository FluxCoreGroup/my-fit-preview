import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface ExerciseHelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  tips: string[];
  commonMistakes: string[];
}

export const ExerciseHelpDrawer = ({
  open,
  onOpenChange,
  exerciseName,
  tips,
  commonMistakes,
}: ExerciseHelpDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Aide - {exerciseName}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 overflow-y-auto space-y-4">
          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Consignes clés
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 font-bold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes && commonMistakes.length > 0 && (
            <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Erreurs à éviter
              </h4>
              <ul className="space-y-2">
                {commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
