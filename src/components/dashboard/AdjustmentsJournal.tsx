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
      <Card className="p-4 bg-card border-border/50">
        <h3 className="text-sm font-semibold mb-3">Ajustements</h3>
        <p className="text-xs text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <Card className="p-4 bg-card border-border/50">
        <h3 className="text-sm font-semibold mb-3">Ajustements</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5" />
          <p>Aucun ajustement</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="text-sm font-semibold mb-3">Ajustements</h3>
      <div className="space-y-2">
        {adjustments.map((adj) => (
          <div
            key={adj.id}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
          >
            <div className="p-1.5 bg-primary/5 rounded-lg">
              {adj.type === "calories" || adj.type === "volume" ? (
                <TrendingUp className="w-3 h-3 text-primary" />
              ) : (
                <TrendingDown className="w-3 h-3 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium capitalize">{adj.type}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(adj.created_at), "dd MMM")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {adj.old_value} → {adj.new_value}
              </p>
              {adj.reason && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{adj.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
