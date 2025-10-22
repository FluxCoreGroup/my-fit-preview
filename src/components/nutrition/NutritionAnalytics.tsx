import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";

const mockWeightData = [
  { week: "S1", weight: 78 },
  { week: "S2", weight: 77.5 },
  { week: "S3", weight: 77.2 },
  { week: "S4", weight: 76.8 },
];

export const NutritionAnalytics = () => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Analytics nutrition</h3>
      </div>

      <div className="space-y-4">
        {/* Weight Chart */}
        <div>
          <p className="text-xs font-semibold mb-2">Évolution du poids</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={mockWeightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[75, 80]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
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

        {/* Weekly Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Jours trackés</div>
            <div className="text-lg font-bold text-primary">5/7</div>
          </div>
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Moy. kcal</div>
            <div className="text-lg font-bold text-secondary">1850</div>
          </div>
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <div className="text-xs text-muted-foreground">Adhérence</div>
            <div className="text-lg font-bold text-accent">92%</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          📊 Continue comme ça ! Tes efforts payent.
        </p>
      </div>
    </Card>
  );
};
