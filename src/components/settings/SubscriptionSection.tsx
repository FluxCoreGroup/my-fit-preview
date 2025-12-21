import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink, RefreshCw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const SubscriptionSection = () => {
  const navigate = useNavigate();
  const { status, subscriptionEnd, isRefreshing, refreshSubscription, openCustomerPortal } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail de gestion. Réessayez plus tard.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  if (status === "loading") {
    return (
      <Card className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="p-4 rounded-lg border space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Abonnement</h2>
          <p className="text-muted-foreground">Ton accès à l'application</p>
        </div>

        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Erreur de chargement</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Impossible de vérifier ton abonnement. Réessaye plus tard.
          </p>
          <Button 
            variant="outline" 
            onClick={refreshSubscription}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Abonnement</h2>
          <p className="text-muted-foreground">Ton accès à l'application</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={refreshSubscription}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {status === "active" ? (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-semibold">Plan All In</span>
            </div>
            <Badge variant="default">Actif</Badge>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">8,99€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                Prochain renouvellement : {formatDate(subscriptionEnd)}
              </p>
            )}
          </div>

          <Button 
            onClick={handleManageSubscription} 
            variant="outline" 
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Gérer mon abonnement
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Modifier le moyen de paiement, télécharger les factures ou annuler
          </p>
        </div>
      ) : (
        <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Aucun abonnement actif</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Abonne-toi pour accéder à toutes les fonctionnalités de Pulse.ai
          </p>

          <Button 
            onClick={() => navigate("/tarif")} 
            className="w-full"
          >
            S'abonner maintenant
          </Button>
        </div>
      )}
    </Card>
  );
};
