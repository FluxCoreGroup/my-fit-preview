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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { PRICING, PlanType, PlanDetails, formatPrice } from "@/lib/pricing";

const Tarif = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<{ percent_off?: number; amount_off?: number; name?: string } | null>(null);
  const [promoCouponId, setPromoCouponId] = useState<string | null>(null);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  // Protection de la route - accessible uniquement après /preview
  useEffect(() => {
    const hasSeenPreview = localStorage.getItem("hasSeenPreview");
    const onboardingData = localStorage.getItem("onboardingData");
    if (!hasSeenPreview || !onboardingData) {
      navigate("/preview");
    }
  }, [navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoValidating(true);
    setPromoValid(null);
    setPromoDiscount(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("validate-promo-code", {
        body: { code: promoCode.trim() },
      });
      
      if (error) throw error;
      
      if (data?.valid) {
        setPromoValid(true);
        setPromoDiscount(data.discount);
        setPromoCouponId(data.couponId || null);
        setPromoCodeId(data.promoCodeId || null);
        toast({
          title: "Code appliqué !",
          description: data.discount.percent_off 
            ? `${data.discount.percent_off}% de réduction sur le premier paiement`
            : `${(data.discount.amount_off / 100).toFixed(2)}€ de réduction`,
        });
      } else {
        setPromoValid(false);
        toast({
          title: "Code invalide",
          description: data?.error || "Ce code promo n'existe pas ou a expiré.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Promo validation error:", error);
      setPromoValid(false);
      toast({
        title: "Erreur",
        description: "Impossible de valider le code promo.",
        variant: "destructive",
      });
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
      sessionStorage.setItem(
        "checkout_context",
        JSON.stringify({
          plan: selectedPlan,
          timestamp: new Date().toISOString(),
          from: "tarif",
        }),
      );
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          plan: selectedPlan,
          couponId: promoValid ? promoCouponId : null,
          promoCodeId: promoValid ? promoCodeId : null,
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    }
  };

  const currentPlan = PRICING[selectedPlan];
  
  const features = [
    { icon: Dumbbell, text: "Programme d'entraînement personnalisé", highlight: true },
    { icon: Utensils, text: "Plan nutrition complet avec macros", highlight: true },
    { icon: Bot, text: "Coach sport IA Alex 24/7", highlight: true },
    { icon: Salad, text: "Nutritionniste IA Julie personnalisée", highlight: true },
    { icon: TrendingUp, text: "Nouvelles séances chaque semaine", highlight: false },
    { icon: RefreshCw, text: "Ajustements automatiques selon tes progrès", highlight: false },
  ];
  
  const allFeatures = [
    "Programme sport personnalisé adapté à ton niveau",
    "Plan nutrition détaillé avec calcul des macros",
    "Coach sport IA Alex disponible 24/7",
    "Nutritionniste IA Julie pour tous tes repas",
    "Nouvelles séances d'entraînement chaque semaine",
    "Ajustements automatiques basés sur tes progrès",
    "Suivi de tes performances et statistiques",
    "Bibliothèque de recettes saines et équilibrées",
    "Générateur de repas intelligent",
    "Support illimité par email",
    "Accès mobile et desktop",
    "Mises à jour et nouvelles fonctionnalités incluses",
  ];
  
  const faqs = [
    {
      id: "billing",
      question: "Quand serai-je débité ?",
      answer: "Pour l'abonnement hebdomadaire : immédiatement. Pour les formules mensuelles et annuelles : après 7 jours d'essai gratuit. Si tu annules pendant l'essai, aucun montant ne sera prélevé.",
    },
    {
      id: "cancel",
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, absolument ! Tu peux annuler à tout moment depuis tes paramètres. La résiliation se fait en un clic. Pour les formules avec essai, tu peux annuler pendant les 7 jours sans aucun frais.",
    },
    {
      id: "promo",
      question: "Comment utiliser un code promo ?",
      answer: "Entre ton code promo dans le champ dédié avant de valider. La réduction s'appliquera automatiquement sur ton premier paiement (après l'essai gratuit pour les formules éligibles).",
    },
    {
      id: "access",
      question: "Que se passe-t-il après le paiement ?",
      answer: "Tu auras un accès immédiat et complet à ton programme personnalisé. Tu pourras commencer ta première séance d'entraînement dès maintenant et suivre ton plan nutrition.",
    },
    {
      id: "refund",
      question: "Et si je ne suis pas satisfait ?",
      answer: "Nous offrons une garantie satisfait ou remboursé de 14 jours. Si notre programme ne te convient pas, contacte-nous pour un remboursement intégral.",
    },
  ];

  const getDiscountedPrice = (price: number) => {
    if (!promoDiscount) return null;
    if (promoDiscount.percent_off) {
      return price * (1 - promoDiscount.percent_off / 100);
    }
    if (promoDiscount.amount_off) {
      return Math.max(0, price - promoDiscount.amount_off / 100);
    }
    return null;
  };

  const discountedPrice = getDiscountedPrice(currentPlan.price);

  return (
    <>
      {/* Overlay de transition */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-medium animate-pulse">Préparation du paiement...</p>
          <p className="mt-2 text-sm text-muted-foreground">Redirection vers Stripe</p>
        </div>
      )}

      <Header variant="onboarding" showBack onBack={() => navigate("/preview")} />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-24 pb-32 md:pb-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Choisis ta formule
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold">Un coaching qui s'adapte à toi</h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chaque semaine, ton programme évolue selon tes retours. Choisis la formule qui te correspond.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${feature.highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Selector */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {(Object.values(PRICING) as PlanDetails[]).map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "p-6 cursor-pointer transition-all duration-200 relative",
                  selectedPlan === plan.id
                    ? "border-2 border-primary shadow-lg bg-gradient-to-br from-background to-primary/5"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <Badge 
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2",
                      plan.id === "monthly" ? "bg-primary" : "bg-amber-500"
                    )}
                  >
                    {plan.badge}
                  </Badge>
                )}
                
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground">/{plan.intervalShort}</span>
                    </div>
                    {plan.monthlyEquivalent && (
                      <p className="text-sm text-primary font-medium">{plan.monthlyEquivalent}</p>
                    )}
                  </div>
                  
                  <div className={cn(
                    "text-xs px-3 py-1.5 rounded-full inline-block",
                    plan.hasTrial 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {plan.hasTrial ? "7 jours d'essai gratuit" : "Facturation immédiate"}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Promo Code Section */}
          <div className="max-w-md mx-auto">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Code promo (optionnel)</span>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoValid(null);
                      setPromoDiscount(null);
                    }}
                    placeholder="Entrer un code"
                    className={cn(
                      "uppercase",
                      promoValid === true && "border-green-500 pr-10",
                      promoValid === false && "border-destructive"
                    )}
                    disabled={promoValidating}
                  />
                  {promoValid === true && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                
                {promoCode && promoValid === true ? (
                  <Button variant="outline" size="icon" onClick={clearPromoCode}>
                    <X className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={validatePromoCode}
                    disabled={!promoCode.trim() || promoValidating}
                  >
                    {promoValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Appliquer"
                    )}
                  </Button>
                )}
              </div>
              
              {promoDiscount && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  {promoDiscount.percent_off 
                    ? `${promoDiscount.percent_off}% de réduction appliquée`
                    : `${(promoDiscount.amount_off! / 100).toFixed(2)}€ de réduction appliquée`
                  }
                </p>
              )}
            </Card>
          </div>

          {/* Main CTA Card */}
          <div className="max-w-lg mx-auto">
            <Card className="p-8 border-2 border-primary shadow-2xl bg-gradient-to-br from-background to-primary/5">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {currentPlan.name} - All In
                  </h2>
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
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Réduction appliquée sur le premier paiement
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">{currentPlan.price}€</span>
                      <span className="text-muted-foreground">/{currentPlan.intervalShort}</span>
                    </div>
                  )}
                  
                  {currentPlan.hasTrial && (
                    <p className="text-sm text-muted-foreground">
                      7 jours d'essai gratuit • Sans engagement
                    </p>
                  )}
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full text-base py-6 text-sm md:text-base" 
                  onClick={handleStartSubscription} 
                  disabled={loading}
                >
                  {currentPlan.hasTrial 
                    ? "Démarrer mon essai gratuit 7 jours" 
                    : "S'abonner maintenant"
                  }
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  {currentPlan.hasTrial 
                    ? "Tu ne seras débité qu'après les 7 jours d'essai"
                    : "Annulation possible à tout moment"
                  }
                </p>
              </div>
            </Card>
          </div>

          {/* Réassurance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center bg-card/50 border-border">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Paiement sécurisé</h4>
              <p className="text-sm text-muted-foreground">Via Stripe, leader mondial</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 border-border">
              <RefreshCw className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Résiliation en 1 clic</h4>
              <p className="text-sm text-muted-foreground">Annule quand tu veux</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 border-border">
              <CreditCard className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Remboursement 14 jours</h4>
              <p className="text-sm text-muted-foreground">Garantie satisfait ou remboursé</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 border-border">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">+500 membres actifs</h4>
              <p className="text-sm text-muted-foreground">Rejoins la communauté</p>
            </Card>
          </div>

          {/* Tout ce qui est inclus */}
          <Card className="p-8 max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Tout ce qui est inclus</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {allFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA final */}
            <div className="text-center pt-8 flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-4">Prêt à transformer ton corps ?</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Rejoins des centaines de membres qui ont déjà commencé leur transformation avec Pulse.
              </p>
              <Button size="lg" className="text-base px-8 py-6" onClick={handleStartSubscription} disabled={loading}>
                {currentPlan.hasTrial ? "Démarrer mon essai gratuit" : "S'abonner maintenant"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto space-y-4 pb-20 md:pb-0">
            <h3 className="text-2xl font-bold text-center mb-6">Questions fréquentes</h3>

            {faqs.map((faq) => (
              <Collapsible
                key={faq.id}
                open={openAccordion === faq.id}
                onOpenChange={(isOpen) => setOpenAccordion(isOpen ? faq.id : undefined)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${openAccordion === faq.id ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 text-sm text-muted-foreground">{faq.answer}</div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {/* CTA fixe mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:hidden z-50">
            <Button size="lg" className="w-full shadow-glow" onClick={handleStartSubscription} disabled={loading}>
              {currentPlan.hasTrial 
                ? `${currentPlan.price}€/${currentPlan.intervalShort} • Essai 7 jours`
                : `${currentPlan.price}€/${currentPlan.intervalShort} • S'abonner`
              }
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tarif;
