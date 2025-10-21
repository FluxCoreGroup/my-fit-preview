import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const DisclaimerCard = () => {
  return (
    <Card className="p-4 bg-muted/30 border-muted">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            ⚠️ Avertissement médical
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pulse.ai est un outil de coaching personnel, pas un substitut à un avis médical professionnel. 
            Consulte un médecin ou un professionnel de santé qualifié avant de commencer tout programme d'entraînement 
            ou de nutrition, surtout si tu as des conditions médicales préexistantes.
          </p>
        </div>
      </div>
    </Card>
  );
};
