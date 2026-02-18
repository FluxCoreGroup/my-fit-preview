import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const toastShown = useRef(false);

  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    if (!isLoading && user && !isAdmin && !toastShown.current) {
      toastShown.current = true;
      toast.error("Accès refusé", {
        description: "Vous n'avez pas les droits administrateur.",
      });
    }
  }, [isLoading, user, isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 gradient-hero rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/hub" replace />;
  }

  return <>{children}</>;
}
