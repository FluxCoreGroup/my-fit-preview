import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const SubscriptionSection = () => {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Abonnement</h2>
        <p className="text-muted-foreground">Ton accès à l'application</p>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-semibold">Accès gratuit</span>
          </div>
          <Badge variant="default">Actif</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Tu bénéficies d'un accès complet et gratuit à toutes les fonctionnalités de l'application.
        </p>
      </div>
    </Card>
  );
};
