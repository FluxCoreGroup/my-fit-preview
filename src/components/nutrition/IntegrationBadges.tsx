import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const IntegrationBadges = () => {
  const integrations = [
    { name: "Apple Health", status: "soon" },
    { name: "MyFitnessPal", status: "soon" },
    { name: "Google Fit", status: "soon" },
  ];

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Intégrations</h3>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {integrations.map(integration => (
          <Badge 
            key={integration.name} 
            variant="outline"
            className="text-xs"
          >
            {integration.name} - Bientôt
          </Badge>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        💡 Synchronise tes apps préférées bientôt
      </p>
    </Card>
  );
};
