import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type BodyMetric = {
  id: string;
  logged_at: string;
  weight: number;
  waist_circumference: number | null;
};

export const useBodyMetrics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLogging, setIsLogging] = useState(false);

  // Fetch last 30 days of metrics
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["body-metrics", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", thirtyDaysAgo.toISOString())
        .order("logged_at", { ascending: true });

      if (error) throw error;
      return data as BodyMetric[];
    },
    enabled: !!user,
  });

  const logMetrics = async (weight: number, waistCircumference?: number) => {
    if (!user) {
      toast({ title: "Erreur", description: "Utilisateur non connecté", variant: "destructive" });
      return false;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight,
        waist_circumference: waistCircumference || null,
      });

      if (error) throw error;

      toast({ 
        title: "✅ Métriques enregistrées", 
        description: waistCircumference 
          ? `${weight} kg • ${waistCircumference} cm` 
          : `${weight} kg` 
      });
      
      queryClient.invalidateQueries({ queryKey: ["body-metrics"] });
      return true;
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  const deleteMetric = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("weight_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "✅ Entrée supprimée" });
      queryClient.invalidateQueries({ queryKey: ["body-metrics"] });
      return true;
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
  };

  return {
    metrics,
    isLoading,
    isLogging,
    logMetrics,
    deleteMetric,
  };
};
