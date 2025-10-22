import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Apple, Activity, Sparkles } from "lucide-react";

export const IntegrationBadges = () => {
  const integrations = [
    { 
      name: "Apple Health", 
      icon: Apple, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      name: "MyFitnessPal", 
      icon: Activity, 
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    { 
      name: "Google Fit", 
      icon: Activity, 
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold">Intégrations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.name}
              className="p-4 rounded-lg bg-background/40 border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full ${integration.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${integration.color}`} />
              </div>
              <p className="text-xs font-semibold mb-1">{integration.name}</p>
              <Badge variant="outline" className="text-xs">
                Bientôt
              </Badge>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        💡 Synchronise tes apps préférées bientôt
      </p>
    </Card>
  );
};
