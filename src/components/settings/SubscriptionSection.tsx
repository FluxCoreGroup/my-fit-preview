import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { useSubscriptionContext, PlanInterval } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/dateLocale";
import { 
  getPlanLabelFromInterval, 
  getPlanPriceFromInterval, 
  getPlanPriceValue, 
  getIntervalLabel 
} from "@/lib/pricing";
import { useTranslation } from "react-i18next";

export const SubscriptionSection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("settings");
  const { status, planInterval, subscriptionEnd, trialEnd, isRefreshing, isPortalLoading, refreshSubscription, openCustomerPortal } = useSubscriptionContext();

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (err) {
      toast({ title: t("subscription.loadingError"), description: t("subscription.portalError"), variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: getDateLocale(i18n.language) });
  };

  if (status === "loading") {
    return (
      <Card className="p-6 space-y-6">
        <div><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-60" /></div>
        <div className="p-4 rounded-lg border space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-10 w-full" /></div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-6 space-y-6">
        <div><h2 className="text-2xl font-bold mb-1">{t("subscription.title")}</h2><p className="text-muted-foreground">{t("subscription.subtitle")}</p></div>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-destructive"><AlertCircle className="w-5 h-5" /><span className="font-medium">{t("subscription.loadingError")}</span></div>
          <p className="text-sm text-muted-foreground">{t("subscription.cannotVerify")}</p>
          <Button variant="outline" onClick={refreshSubscription} disabled={isRefreshing} className="w-full">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />{t("subscription.retry")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold mb-1">{t("subscription.title")}</h2><p className="text-muted-foreground">{t("subscription.subtitle")}</p></div>
        <Button variant="ghost" size="icon" onClick={refreshSubscription} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {status === "trialing" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /><span className="font-semibold">Plan {getPlanLabelFromInterval(planInterval)}</span></div>
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{t("subscription.freeTrial")}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">0€<span className="text-sm font-normal text-muted-foreground"> {t("subscription.duringTrial")}</span></p>
            {trialEnd && <p className="text-sm text-muted-foreground">{t("subscription.trialEnd")} {formatDate(trialEnd)}</p>}
            <p className="text-sm text-amber-600 dark:text-amber-400">{t("subscription.afterTrial", { price: getPlanPriceFromInterval(planInterval) })}</p>
          </div>
          <Button onClick={handleManageSubscription} variant="outline" className="w-full" disabled={isPortalLoading}>
            <CreditCard className="w-4 h-4 mr-2" />{isPortalLoading ? t("subscription.redirecting") : t("subscription.manageSubscription")}
          </Button>
          <p className="text-xs text-muted-foreground text-center">{t("subscription.addPayment")}</p>
        </div>
      )}

      {status === "active" && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /><span className="font-semibold">Plan {getPlanLabelFromInterval(planInterval)}</span></div>
            <Badge variant="default">{t("subscription.active")}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{getPlanPriceValue(planInterval)}<span className="text-sm font-normal text-muted-foreground">{getIntervalLabel(planInterval)}</span></p>
            {subscriptionEnd && <p className="text-sm text-muted-foreground">{t("subscription.nextRenewal")} {formatDate(subscriptionEnd)}</p>}
          </div>
          <Button onClick={handleManageSubscription} variant="outline" className="w-full" disabled={isPortalLoading}>
            <CreditCard className="w-4 h-4 mr-2" />{isPortalLoading ? t("subscription.redirecting") : t("subscription.manageSubscription")}
          </Button>
          <p className="text-xs text-muted-foreground text-center">{t("subscription.managePayment")}</p>
        </div>
      )}

      {status === "inactive" && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-muted-foreground" /><span className="font-semibold">{t("subscription.noSubscription")}</span></div>
          </div>
          <p className="text-sm text-muted-foreground">{t("subscription.subscribeDesc")}</p>
          <Button onClick={() => navigate("/tarif")} className="w-full">{t("subscription.subscribeNow")}</Button>
        </div>
      )}
    </Card>
  );
};