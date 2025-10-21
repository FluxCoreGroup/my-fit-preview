import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

export const AdjustmentsJournal = () => {
  const { user } = useAuth();

  const { data: adjustments, isLoading } = useQuery({
    queryKey: ["adjustments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("adjustments_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
        <h3 className="text-lg font-bold mb-4">Journal des ajustements</h3>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
        <h3 className="text-lg font-bold mb-4">Journal des ajustements</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <p>Aucun ajustement pour le moment</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <h3 className="text-lg font-bold mb-4">Journal des ajustements</h3>
      <div className="space-y-3">
        {adjustments.map((adj) => (
          <div
            key={adj.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-white/10"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              {adj.type === "calories" || adj.type === "volume" ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-secondary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold capitalize">{adj.type}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(adj.created_at), "dd MMM")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {adj.old_value} → {adj.new_value}
              </p>
              {adj.reason && (
                <p className="text-xs text-muted-foreground mt-1">{adj.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
