import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = "loading" | "active" | "trialing" | "inactive" | "error";
export type PlanInterval = "week" | "month" | "year" | null;

interface SubscriptionContextType {
  status: SubscriptionStatus;
  productId: string | null;
  subscriptionEnd: string | null;
  trialEnd: string | null;
  planInterval: PlanInterval;
  error: string | null;
  isRefreshing: boolean;
  isPortalLoading: boolean;
  refreshSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>("loading");
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  const [planInterval, setPlanInterval] = useState<PlanInterval>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus("inactive");
      setProductId(null);
      setSubscriptionEnd(null);
      setTrialEnd(null);
      setPlanInterval(null);
      setError(null);
      return;
    }

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke("check-subscription");
      
      // Handle auth errors (401) gracefully - treat as inactive, not error
      if (fnError) {
        const msg = fnError.message || "";
        if (msg.includes("401") || msg.includes("session")) {
          setStatus("inactive");
          setProductId(null);
          setSubscriptionEnd(null);
          setTrialEnd(null);
          setPlanInterval(null);
          setError(null);
          return;
        }
        throw fnError;
      }

      if (response?.subscribed) {
        setStatus(response.subscription_status === "trialing" ? "trialing" : "active");
        setPlanInterval(response.price_interval as PlanInterval ?? null);
        setProductId(response.product_id ?? null);
        setSubscriptionEnd(response.subscription_end ?? null);
        setTrialEnd(response.trial_end ?? null);
        setError(null);
      } else {
        setStatus("inactive");
        setProductId(null);
        setSubscriptionEnd(null);
        setTrialEnd(null);
        setPlanInterval(null);
        setError(null);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erreur lors de la vérification");
    }
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    setIsRefreshing(true);
    await checkSubscription();
    setIsRefreshing(false);
  }, [checkSubscription]);

  const openCustomerPortal = useCallback(async () => {
    if (isPortalLoading) return;
    setIsPortalLoading(true);
    try {
      const { data: response, error: fnError } = await supabase.functions.invoke("customer-portal");
      if (fnError) throw fnError;
      if (response?.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
      setIsPortalLoading(false);
      throw err;
    }
  }, [isPortalLoading]);

  // Initial check + polling every 60s
  useEffect(() => {
    if (loading) return; // Wait for auth to finish before deciding
    if (!user) {
      setStatus("inactive");
      return;
    }
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, loading, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        productId,
        subscriptionEnd,
        trialEnd,
        planInterval,
        error,
        isRefreshing,
        isPortalLoading,
        refreshSubscription,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
