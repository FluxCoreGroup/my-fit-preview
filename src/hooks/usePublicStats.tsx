import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicStats {
  total_users: number;
  completed_sessions: number;
  average_rating: number | null;
  avg_weight_loss: number | null;
  updated_at: string;
}

export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      const { data, error } = await supabase.functions.invoke('get-public-stats');
      
      if (error) {
        console.error('Error fetching public stats:', error);
        throw error;
      }
      
      return data as PublicStats;
    },
    staleTime: 1000 * 60 * 30, // 30 min cache client
    gcTime: 1000 * 60 * 60, // 1h garbage collection
    retry: 1,
  });
};
