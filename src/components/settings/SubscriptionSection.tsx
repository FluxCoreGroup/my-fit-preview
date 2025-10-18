import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CreditCard, ExternalLink, CheckCircle2 } from "lucide-react";

export const SubscriptionSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setSubscription(data);
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'ouverture du portail client");
      console.error(error);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Abonnement & Paiement</h2>
        <p className="text-muted-foreground">Gérer ton abonnement et tes paiements</p>
      </div>

      {subscription ? (
        <div className="space-y-6">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-semibold">Abonnement actif</span>
              </div>
              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                {subscription.status === "active" ? "Actif" : subscription.status}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium">{subscription.plan_type || "Premium"}</p>
              </div>
              {subscription.ends_at && (
                <div>
                  <p className="text-muted-foreground">Renouvellement</p>
                  <p className="font-medium">
                    {new Date(subscription.ends_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full"
            variant="outline"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            Gérer mon abonnement
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Tu seras redirigé vers le portail sécurisé Stripe pour gérer ton abonnement, 
            modifier ton moyen de paiement ou consulter tes factures.
          </p>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <p className="font-medium mb-1">Aucun abonnement actif</p>
            <p className="text-sm text-muted-foreground">
              Tu n'as pas encore d'abonnement actif. Contacte le support pour plus d'informations.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
