import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const DisclaimerCard = () => {
  return (
    <Card className="p-3 bg-muted/20 border-border/50">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">
            Avertissement médical
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Pulse.ai est un outil de coaching, pas un substitut médical. 
            Consulte un professionnel de santé avant de commencer un programme.
          </p>
        </div>
      </div>
    </Card>
  );
};
