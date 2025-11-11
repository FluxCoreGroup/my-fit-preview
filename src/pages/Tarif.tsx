import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  RefreshCw, 
  CreditCard, 
  Users, 
  Gift,
  Dumbbell,
  Utensils,
  TrendingUp,
  MessageCircle,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Tarif = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Protection de la route - accessible uniquement après /preview
  useEffect(() => {
    const hasSeenPreview = localStorage.getItem("hasSeenPreview");
    const onboardingData = localStorage.getItem("onboardingData");
    
    if (!hasSeenPreview || !onboardingData) {
      navigate("/preview");
    }
  }, [navigate]);

  const handleStartTrial = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType: selectedPlan,
          mode: 'subscription'
        }
      });

      if (error) throw error;

      // Sauvegarder le contexte avant redirection
      localStorage.setItem("checkoutContext", JSON.stringify({
        plan: selectedPlan,
        timestamp: Date.now()
      }));

      // Redirection vers Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de lancer le paiement",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const monthlyPrice = 24.99;
  const yearlyPrice = 299;
  const yearlySavings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

  const features = [
    { icon: Dumbbell, text: "Programme d'entraînement personnalisé", highlight: true },
    { icon: Utensils, text: "Plan nutrition complet avec macros", highlight: true },
    { icon: TrendingUp, text: "Nouvelles séances chaque semaine", highlight: false },
    { icon: RefreshCw, text: "Ajustements automatiques selon tes progrès", highlight: false },
    { icon: MessageCircle, text: "Support 7j/7 par nos coachs", highlight: false },
  ];

  const allFeatures = [
    "Programme sport personnalisé adapté à ton niveau",
    "Plan nutrition détaillé avec calcul des macros",
    "Nouvelles séances d'entraînement chaque semaine",
    "Ajustements automatiques basés sur tes progrès",
    "Suivi de tes performances et statistiques",
    "Bibliothèque de recettes saines et équilibrées",
    "Générateur de repas intelligent",
    "Support illimité par email",
    "Accès mobile et desktop",
    "Mises à jour et nouvelles fonctionnalités incluses"
  ];

  const faqs = [
    {
      id: "billing",
      question: "Quand serai-je débité ?",
      answer: "Tu ne seras débité qu'après 7 jours d'essai gratuit. Si tu annules pendant cette période, aucun montant ne sera prélevé."
    },
    {
      id: "cancel",
      question: "Puis-je annuler pendant l'essai ?",
      answer: "Oui, absolument ! Tu peux annuler à tout moment pendant les 7 jours d'essai sans aucun frais. La résiliation se fait en un clic depuis tes paramètres."
    },
    {
      id: "access",
      question: "Que se passe-t-il après le paiement ?",
      answer: "Tu auras un accès immédiat et complet à ton programme personnalisé. Tu pourras commencer ta première séance d'entraînement dès maintenant et suivre ton plan nutrition."
    },
    {
      id: "refund",
      question: "Et si je ne suis pas satisfait ?",
      answer: "Nous offrons une garantie satisfait ou remboursé de 14 jours. Si notre programme ne te convient pas, contacte-nous pour un remboursement intégral."
    }
  ];

  return (
    <>
      <Header variant="onboarding" showBack onBack={() => navigate("/preview")} />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
              <Gift className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent">🎁 Offre de lancement</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              Ton Programme Personnalisé est Prêt !
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Commence ton essai gratuit de <span className="font-bold text-primary">7 jours</span> et accède à ton programme complet sport + nutrition
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    feature.highlight 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card border-border'
                  }`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Plan Mensuel avec Trial */}
            <Card 
              className={`relative p-8 cursor-pointer transition-all duration-300 ${
                selectedPlan === 'monthly'
                  ? 'border-primary/50 shadow-glow scale-105'
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                Recommandé
              </Badge>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold">Essai Gratuit 7 Jours</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">{monthlyPrice}€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Puis facturation mensuelle
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">7 jours gratuits pour tout tester</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Programme complet sport + nutrition</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Nouvelles séances chaque semaine</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Ajustements automatiques</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Support 7j/7</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                  Sans engagement • Résilie quand tu veux
                </p>
              </div>
            </Card>

            {/* Plan Annuel */}
            <Card 
              className={`relative p-8 cursor-pointer transition-all duration-300 ${
                selectedPlan === 'yearly'
                  ? 'border-primary/50 shadow-glow scale-105'
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground">
                Économise {yearlySavings}%
              </Badge>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                    <h3 className="text-2xl font-bold">Plan Annuel</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-secondary">{yearlyPrice}€</span>
                    <span className="text-muted-foreground">/an</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Soit {(yearlyPrice / 12).toFixed(2)}€/mois
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Tous les avantages du plan mensuel</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Économise {(monthlyPrice * 12 - yearlyPrice).toFixed(0)}€ par an</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Pas de renouvellement mensuel</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Meilleur tarif garanti</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                  Paiement unique annuel • Résiliable à tout moment
                </p>
              </div>
            </Card>
          </div>

          {/* CTA Principal */}
          <div className="text-center space-y-4">
            <Button
              size="lg"
              onClick={handleStartTrial}
              disabled={loading}
              className="text-lg px-12 py-6 gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Redirection en cours...
                </>
              ) : (
                <>
                  Démarrer mon essai gratuit 7 jours
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Aucun paiement aujourd'hui • Annulation en 1 clic
            </p>
          </div>

          {/* Réassurance */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
          </Card>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">Questions fréquentes</h3>
            
            {faqs.map((faq) => (
              <Collapsible
                key={faq.id}
                open={openFaq === faq.id}
                onOpenChange={(isOpen) => setOpenFaq(isOpen ? faq.id : null)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {/* CTA Sticky sur Mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
            <Button
              size="lg"
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full gradient-hero text-primary-foreground shadow-glow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Démarrer mon essai gratuit 7 jours
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tarif;
