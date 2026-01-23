import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = "loading" | "active" | "trialing" | "inactive" | "error";
export type PlanInterval = "week" | "month" | "year" | null;

interface SubscriptionData {
  status: SubscriptionStatus;
  productId: string | null;
  subscriptionEnd: string | null;
  trialEnd: string | null;
  planInterval: PlanInterval;
  error: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData>({
    status: "loading",
    productId: null,
    subscriptionEnd: null,
    trialEnd: null,
    planInterval: null,
    error: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setData({ status: "inactive", productId: null, subscriptionEnd: null, trialEnd: null, planInterval: null, error: null });
      return;
    }

    try {
      const { data: response, error } = await supabase.functions.invoke("check-subscription");

      if (error) throw error;

      if (response?.subscribed) {
        const subStatus: SubscriptionStatus = response.subscription_status === "trialing" ? "trialing" : "active";
        
        // Déterminer l'intervalle du plan basé sur le prix
        let planInterval: PlanInterval = null;
        if (response.price_interval) {
          planInterval = response.price_interval as PlanInterval;
        }
        
        setData({
          status: subStatus,
          productId: response.product_id,
          subscriptionEnd: response.subscription_end,
          trialEnd: response.trial_end,
          planInterval,
          error: null,
        });
      } else {
        setData({
          status: "inactive",
          productId: null,
          subscriptionEnd: null,
          trialEnd: null,
          planInterval: null,
          error: null,
        });
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      setData({
        status: "error",
        productId: null,
        subscriptionEnd: null,
        trialEnd: null,
        planInterval: null,
        error: err instanceof Error ? err.message : "Erreur lors de la vérification",
      });
    }
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    setIsRefreshing(true);
    await checkSubscription();
    setIsRefreshing(false);
  }, [checkSubscription]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (response?.url) {
        window.open(response.url, "_blank");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    ...data,
    isRefreshing,
    refreshSubscription,
    openCustomerPortal,
  };
};
