import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const AdherenceChart = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["adherence-progression", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("weekly_checkins")
        .select("adherence_diet, week_iso")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      return data?.reverse() || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />;
  if (!data || data.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">Adhérence nutrition (4 semaines)</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.week_iso}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Semaine {item.week_iso?.split("-W")[1] || "?"}
              </span>
              <span className="text-sm font-bold">{item.adherence_diet}%</span>
            </div>
            <Progress 
              value={item.adherence_diet} 
              className="h-3"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
