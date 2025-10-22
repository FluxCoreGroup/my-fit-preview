import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const NutritionAnalytics = () => {
  const { weightData, weeklyStats } = useNutritionTracking();

  // Formater les données de poids pour le graphique
  const chartData = weightData?.map(log => ({
    week: format(new Date(log.logged_at), "d MMM", { locale: fr }),
    weight: log.weight
  })) || [];

  const hasData = chartData.length > 0;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Analytics nutrition</h3>
      </div>

      <div className="space-y-4">
        {/* Weight Chart */}
        {hasData ? (
          <div>
            <p className="text-xs font-semibold mb-2">Évolution du poids</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Commence à tracker ton poids pour voir l'évolution
            </p>
          </div>
        )}

        {/* Weekly Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Jours trackés</div>
            <div className="text-lg font-bold text-primary">
              {weeklyStats ? `${weeklyStats.daysTracked}/7` : "-"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Moy. kcal</div>
            <div className="text-lg font-bold text-secondary">
              {weeklyStats?.avgCalories || "-"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Adhérence</div>
            <div className="text-lg font-bold text-accent">
              {weeklyStats ? `${weeklyStats.adherence}%` : "-"}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {weeklyStats?.adherence && weeklyStats.adherence >= 80 
            ? "📊 Continue comme ça ! Tes efforts payent."
            : "💪 Commence à tracker tes repas pour suivre ta progression"}
        </p>
      </div>
    </Card>
  );
};
