import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Ruler, Trash2 } from "lucide-react";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const BodyMetricsTracker = () => {
  const { metrics, isLogging, logMetrics, deleteMetric } = useBodyMetrics();
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  const handleSubmit = async () => {
    if (!weight) return;
    const success = await logMetrics(
      parseFloat(weight),
      waist ? parseInt(waist) : undefined
    );
    if (success) {
      setWeight("");
      setWaist("");
    }
  };

  const chartData = metrics.map(m => ({
    date: format(new Date(m.logged_at), "dd/MM", { locale: fr }),
    weight: m.weight,
    waist: m.waist_circumference,
  }));

  const recentMetrics = metrics.slice(-5).reverse();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
      <h3 className="text-lg font-bold mb-4">📊 Suivi Corporel</h3>

      {/* Input Section */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.1"
                placeholder="Poids (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Tour de taille (cm)"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isLogging || !weight}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
        >
          Enregistrer
        </Button>
      </div>

      {/* Chart Section */}
      {metrics.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-background/30 border border-primary/10">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Poids (kg)"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              {chartData.some(d => d.waist) && (
                <Line 
                  type="monotone" 
                  dataKey="waist" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Tour de taille (cm)"
                  dot={{ fill: 'hsl(var(--accent))' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent History */}
      {recentMetrics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Dernières entrées</p>
          {recentMetrics.map((metric) => (
            <div 
              key={metric.id}
              className="flex items-center justify-between p-2 rounded-lg bg-background/40 border border-primary/10 hover:bg-background/60 transition-all"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {format(new Date(metric.logged_at), "dd MMM", { locale: fr })}
                </span>
                <span className="font-semibold">{metric.weight} kg</span>
                {metric.waist_circumference && (
                  <span className="text-accent">• {metric.waist_circumference} cm</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMetric(metric.id)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {metrics.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune donnée enregistrée. Commence ton suivi ! 📈
        </p>
      )}
    </Card>
  );
};
