import { Database, Weight, Activity, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface DataSource {
  tool: string;
  args: any;
  result: string;
}

interface DataSourcesPanelProps {
  dataSources: DataSource[];
}

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case "get_weight_history": return <Weight className="w-4 h-4" />;
    case "get_recent_sessions": return <Activity className="w-4 h-4" />;
    case "get_checkin_stats": return <TrendingUp className="w-4 h-4" />;
    case "get_next_session": return <Target className="w-4 h-4" />;
    case "get_nutrition_targets": return <Database className="w-4 h-4" />;
    default: return <Database className="w-4 h-4" />;
  }
};

export const DataSourcesPanel = ({ dataSources }: DataSourcesPanelProps) => {
  const { t } = useTranslation("coach");

  const getToolLabel = (toolName: string) => {
    const labels: Record<string, string> = {
      get_weight_history: t("dataSources.weightHistory"),
      get_recent_sessions: t("dataSources.recentSessions"),
      get_checkin_stats: t("dataSources.checkinStats"),
      get_next_session: t("dataSources.nextSession"),
      get_nutrition_targets: t("dataSources.nutritionTargets"),
    };
    return labels[toolName] || toolName;
  };

  if (!dataSources || dataSources.length === 0) return null;

  return (
    <Card className="w-64 border-l bg-card/50 backdrop-blur-xl">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />{t("dataSources.title")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{t("dataSources.description")}</p>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-3 space-y-2">
          {dataSources.map((source, idx) => (
            <Card key={idx} className="p-3 border-white/10 bg-background/50">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5 text-primary">{getToolIcon(source.tool)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{getToolLabel(source.tool)}</p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">{source.result}</p>
                  {source.args && Object.keys(source.args).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(source.args).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs px-1.5 py-0">{key}: {String(value)}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
