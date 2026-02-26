import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import {
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  RefreshCw,
  CreditCard,
  Users,
  Dumbbell,
  Utensils,
  TrendingUp,
  ChevronDown,
  Loader2,
  Bot,
  Salad,
  Tag,
  X,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { PRICING, PlanType, PlanDetails, formatPrice } from "@/lib/pricing";

const Tarif = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<{ percent_off?: number; amount_off?: number; name?: string } | null>(null);
  const [promoCouponId, setPromoCouponId] = useState<string | null>(null);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  useEffect(() => {
    const hasSeenPreview = localStorage.getItem("hasSeenPreview");
    const onboardingData = localStorage.getItem("onboardingData");
    if (!hasSeenPreview || !onboardingData) navigate("/preview");
  }, [navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoValidating(true);
    setPromoValid(null);
    setPromoDiscount(null);
    try {
      const { data, error } = await supabase.functions.invoke("validate-promo-code", { body: { code: promoCode.trim() } });
      if (error) throw error;
      if (data?.valid) {
        setPromoValid(true);
        setPromoDiscount(data.discount);
        setPromoCouponId(data.couponId || null);
        setPromoCodeId(data.promoCodeId || null);
        toast({
          title: t("tarif.promoApplied"),
          description: data.discount.percent_off
            ? t("tarif.promoAppliedPercent", { percent: data.discount.percent_off })
            : t("tarif.promoAppliedAmount", { amount: (data.discount.amount_off / 100).toFixed(2) }),
        });
      } else {
        setPromoValid(false);
        toast({ title: t("tarif.promoInvalid"), description: data?.error || t("tarif.promoInvalidDesc"), variant: "destructive" });
      }
    } catch (error) {
      console.error("Promo validation error:", error);
      setPromoValid(false);
      toast({ title: t("common.error"), description: t("tarif.promoError"), variant: "destructive" });
    } finally {
      setPromoValidating(false);
    }
  };

  const clearPromoCode = () => {
    setPromoCode("");
    setPromoValid(null);
    setPromoDiscount(null);
    setPromoCouponId(null);
    setPromoCodeId(null);
  };

  const handleStartSubscription = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem("checkout_context", JSON.stringify({ plan: selectedPlan, timestamp: new Date().toISOString(), from: "tarif" }));
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: selectedPlan, couponId: promoValid ? promoCouponId : null, promoCodeId: promoValid ? promoCodeId : null },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      setLoading(false);
      toast({ title: t("common.error"), description: t("tarif.paymentError"), variant: "destructive" });
    }
  };

  const currentPlan = PRICING[selectedPlan];

  const features = [
    { icon: Dumbbell, text: t("tarif.features.personalizedTraining"), highlight: true },
    { icon: Utensils, text: t("tarif.features.nutritionPlan"), highlight: true },
    { icon: Bot, text: t("tarif.features.coachAlex"), highlight: true },
    { icon: Salad, text: t("tarif.features.coachJulie"), highlight: true },
    { icon: TrendingUp, text: t("tarif.features.weeklySessions"), highlight: false },
    { icon: RefreshCw, text: t("tarif.features.autoAdjust"), highlight: false },
  ];

  const allFeatures = t("tarif.allFeatures", { returnObjects: true }) as string[];

  const faqs = [
    { id: "billing", question: t("tarif.faqItems.billing.q"), answer: t("tarif.faqItems.billing.a") },
    { id: "cancel", question: t("tarif.faqItems.cancel.q"), answer: t("tarif.faqItems.cancel.a") },
    { id: "promo", question: t("tarif.faqItems.promo.q"), answer: t("tarif.faqItems.promo.a") },
    { id: "access", question: t("tarif.faqItems.access.q"), answer: t("tarif.faqItems.access.a") },
    { id: "refund", question: t("tarif.faqItems.refund.q"), answer: t("tarif.faqItems.refund.a") },
  ];

  const getDiscountedPrice = (price: number) => {
    if (!promoDiscount) return null;
    if (promoDiscount.percent_off) return price * (1 - promoDiscount.percent_off / 100);
    if (promoDiscount.amount_off) return Math.max(0, price - promoDiscount.amount_off / 100);
    return null;
  };

  const discountedPrice = getDiscountedPrice(currentPlan.price);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-medium animate-pulse">{t("tarif.preparingPayment")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("tarif.redirectStripe")}</p>
        </div>
      )}

      <Header variant="onboarding" showBack onBack={() => navigate("/preview")} />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-24 pb-32 md:pb-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-6 animate-in">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("tarif.choosePlan")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">{t("tarif.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("tarif.subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {features.map((feature, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${feature.highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}>
                  <feature.icon className={`w-5 h-5 ${feature.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {(Object.values(PRICING) as PlanDetails[]).map((plan) => (
              <Card
                key={plan.id}
                className={cn("p-6 cursor-pointer transition-all duration-200 relative", selectedPlan === plan.id ? "border-2 border-primary shadow-lg bg-gradient-to-br from-background to-primary/5" : "border-border hover:border-primary/50 hover:shadow-md")}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <Badge className={cn("absolute -top-3 left-1/2 -translate-x-1/2", plan.id === "monthly" ? "bg-primary" : "bg-amber-500")}>{plan.badge}</Badge>
                )}
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground">/{plan.intervalShort}</span>
                    </div>
                    {plan.monthlyEquivalent && <p className="text-sm text-primary font-medium">{plan.monthlyEquivalent}</p>}
                  </div>
                  <div className={cn("text-xs px-3 py-1.5 rounded-full inline-block", plan.hasTrial ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                    {plan.hasTrial ? t("tarif.freeTrial") : t("tarif.immediateBilling")}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-primary" /></div>
                )}
              </Card>
            ))}
          </div>

          <div className="max-w-md mx-auto">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("tarif.promoCode")}</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoValid(null); setPromoDiscount(null); }}
                    placeholder={t("tarif.enterCode")}
                    className={cn("uppercase", promoValid === true && "border-green-500 pr-10", promoValid === false && "border-destructive")}
                    disabled={promoValidating}
                  />
                  {promoValid === true && <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                </div>
                {promoCode && promoValid === true ? (
                  <Button variant="outline" size="icon" onClick={clearPromoCode}><X className="w-4 h-4" /></Button>
                ) : (
                  <Button variant="outline" onClick={validatePromoCode} disabled={!promoCode.trim() || promoValidating}>
                    {promoValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("tarif.apply")}
                  </Button>
                )}
              </div>
              {promoDiscount && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  {promoDiscount.percent_off
                    ? t("tarif.percentOff", { percent: promoDiscount.percent_off })
                    : t("tarif.amountOff", { amount: (promoDiscount.amount_off! / 100).toFixed(2) })}
                </p>
              )}
            </Card>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="p-8 border-2 border-primary shadow-2xl bg-gradient-to-br from-background to-primary/5">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentPlan.name} - {t("tarif.allIn")}</h2>
                  <p className="text-muted-foreground">{currentPlan.description}</p>
                </div>
                <div className="space-y-2">
                  {discountedPrice !== null ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl text-muted-foreground line-through">{currentPlan.price}€</span>
                        <span className="text-4xl font-bold text-primary">{discountedPrice.toFixed(2)}€</span>
                        <span className="text-muted-foreground">/{currentPlan.intervalShort}</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">{t("tarif.discountApplied")}</p>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">{currentPlan.price}€</span>
                      <span className="text-muted-foreground">/{currentPlan.intervalShort}</span>
                    </div>
                  )}
                  {currentPlan.hasTrial && <p className="text-sm text-muted-foreground">{t("tarif.trialNoCharge")}</p>}
                </div>
                <Button size="lg" className="w-full text-base py-6 text-sm md:text-base" onClick={handleStartSubscription} disabled={loading}>
                  {currentPlan.hasTrial ? t("tarif.startTrial") : t("tarif.subscribeNow")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  {currentPlan.hasTrial ? t("tarif.trialNoCharge") : t("tarif.cancelAnytime")}
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center bg-card/50 border-border">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("tarif.securePayment")}</h4>
              <p className="text-sm text-muted-foreground">{t("tarif.securePaymentDesc")}</p>
            </Card>
            <Card className="p-6 text-center bg-card/50 border-border">
              <RefreshCw className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("tarif.oneClickCancel")}</h4>
              <p className="text-sm text-muted-foreground">{t("tarif.oneClickCancelDesc")}</p>
            </Card>
            <Card className="p-6 text-center bg-card/50 border-border">
              <CreditCard className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("tarif.refund14")}</h4>
              <p className="text-sm text-muted-foreground">{t("tarif.refund14Desc")}</p>
            </Card>
            <Card className="p-6 text-center bg-card/50 border-border">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("tarif.activeMembers")}</h4>
              <p className="text-sm text-muted-foreground">{t("tarif.activeMembersDesc")}</p>
            </Card>
          </div>

          <Card className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-6 text-center">{t("tarif.allIncluded")}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Array.isArray(allFeatures) && allFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="text-center pt-8 flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-4">{t("tarif.readyToTransform")}</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{t("tarif.readyToTransformDesc")}</p>
              <Button size="lg" className="text-base px-8 py-6" onClick={handleStartSubscription} disabled={loading}>
                {currentPlan.hasTrial ? t("tarif.startTrial") : t("tarif.subscribeNow")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>

          <div className="max-w-3xl mx-auto space-y-4 pb-20 md:pb-0">
            <h3 className="text-2xl font-bold text-center mb-6">{t("tarif.faq")}</h3>
            {faqs.map((faq) => (
              <Collapsible key={faq.id} open={openAccordion === faq.id} onOpenChange={(isOpen) => setOpenAccordion(isOpen ? faq.id : undefined)}>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openAccordion === faq.id ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 text-sm text-muted-foreground">{faq.answer}</div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:hidden z-50">
            <Button size="lg" className="w-full shadow-glow" onClick={handleStartSubscription} disabled={loading}>
              {currentPlan.hasTrial
                ? `${currentPlan.price}€/${currentPlan.intervalShort} • ${t("tarif.freeTrial")}`
                : `${currentPlan.price}€/${currentPlan.intervalShort} • ${t("tarif.subscribeNow")}`}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tarif;
