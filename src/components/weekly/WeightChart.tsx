import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const WeightChart = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["weight-progression", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("weekly_checkins")
        .select("average_weight, created_at, week_iso")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(12);

      return data?.map(d => ({
        week: d.week_iso?.split("-W")[1] || "?",
        weight: d.average_weight,
      })) || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data || data.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">Évolution du poids (12 semaines)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="week" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
            }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
