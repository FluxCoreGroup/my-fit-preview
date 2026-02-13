import { ReactNode, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface SubscriptionRouteProps {
  children: ReactNode;
}

export function SubscriptionRoute({ children }: SubscriptionRouteProps) {
  const { user, loading } = useAuth();
  const { status } = useSubscriptionContext();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (status === "inactive" && !hasToasted.current) {
      hasToasted.current = true;
      toast.error("Ton abonnement a expiré", {
        description: "Réabonne-toi pour accéder à cette fonctionnalité.",
      });
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 gradient-hero rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (status === "inactive" || status === "error") {
    return <Navigate to="/tarif" replace />;
  }

  return <>{children}</>;
}
