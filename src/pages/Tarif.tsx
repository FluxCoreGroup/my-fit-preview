import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Check, Sparkles, ArrowRight, Shield, RefreshCw, CreditCard, Users, Gift, Dumbbell, Utensils, TrendingUp, MessageCircle, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Tarif = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

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
      // Sauvegarder le contexte du checkout
      sessionStorage.setItem('checkout_context', JSON.stringify({
        plan: 'all_in',
        timestamp: new Date().toISOString(),
        from: 'tarif'
      }));
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { mode: 'trial' }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement",
        variant: "destructive"
      });
    }
  };

  // Prix unique
  const price = 8.99;
  const features = [{
    icon: Dumbbell,
    text: "Programme d'entraînement personnalisé",
    highlight: true
  }, {
    icon: Utensils,
    text: "Plan nutrition complet avec macros",
    highlight: true
  }, {
    icon: TrendingUp,
    text: "Nouvelles séances chaque semaine",
    highlight: false
  }, {
    icon: RefreshCw,
    text: "Ajustements automatiques selon tes progrès",
    highlight: false
  }, {
    icon: MessageCircle,
    text: "Support 7j/7 par nos coachs",
    highlight: false
  }];
  const allFeatures = ["Programme sport personnalisé adapté à ton niveau", "Plan nutrition détaillé avec calcul des macros", "Nouvelles séances d'entraînement chaque semaine", "Ajustements automatiques basés sur tes progrès", "Suivi de tes performances et statistiques", "Bibliothèque de recettes saines et équilibrées", "Générateur de repas intelligent", "Support illimité par email", "Accès mobile et desktop", "Mises à jour et nouvelles fonctionnalités incluses"];
  const faqs = [{
    id: "billing",
    question: "Quand serai-je débité ?",
    answer: "Tu ne seras débité qu'après 7 jours d'essai gratuit. Si tu annules pendant cette période, aucun montant ne sera prélevé."
  }, {
    id: "cancel",
    question: "Puis-je annuler pendant l'essai ?",
    answer: "Oui, absolument ! Tu peux annuler à tout moment pendant les 7 jours d'essai sans aucun frais. La résiliation se fait en un clic depuis tes paramètres."
  }, {
    id: "access",
    question: "Que se passe-t-il après le paiement ?",
    answer: "Tu auras un accès immédiat et complet à ton programme personnalisé. Tu pourras commencer ta première séance d'entraînement dès maintenant et suivre ton plan nutrition."
  }, {
    id: "refund",
    question: "Et si je ne suis pas satisfait ?",
    answer: "Nous offrons une garantie satisfait ou remboursé de 14 jours. Si notre programme ne te convient pas, contacte-nous pour un remboursement intégral."
  }];

  return (
    <>
      {/* Overlay de transition */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            {/* Cercle animé */}
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-medium animate-pulse">Préparation du paiement...</p>
          <p className="mt-2 text-sm text-muted-foreground">Redirection vers Stripe</p>
        </div>
      )}

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
              Ton programme personnalisé est prêt !
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Commence ton essai gratuit de <span className="font-bold text-primary">7 jours</span> et accède à ton programme complet sport + nutrition
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {features.map((feature, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${feature.highlight ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}>
                  <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto mb-12 animate-in">
            <Card className="p-10 border-2 border-primary shadow-2xl bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
              {/* Badge */}
              <div className="text-center mb-8">
                <Badge className="mb-4 text-base px-4 py-1.5">Plan Unique</Badge>
                <h2 className="text-4xl font-bold mb-2">All In</h2>
                <p className="text-muted-foreground">
                  Toutes les fonctionnalités incluses
                </p>
              </div>
              
              {/* Prix */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold text-primary">{price}€</span>
                  <span className="text-xl text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sans engagement • Annulation en 1 clic
                </p>
              </div>
              
              {/* Fonctionnalités */}
              <ul className="space-y-4 mb-8">
                {["Programme sport + nutrition personnalisé", "Nouvelles séances chaque semaine", "Ajustements automatiques selon tes feedbacks", "Alternatives d'exercices illimitées", "Vidéos et fiches techniques détaillées", "Support par email 7j/7", "Accès communauté Discord", "Toutes les futures fonctionnalités incluses"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Button size="lg" className="w-full text-lg py-6" onClick={handleStartTrial} disabled={loading}>
                Démarrer mon essai gratuit 7 jours
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Essai gratuit de 7 jours • Aucune carte bancaire requise
              </p>
            </Card>
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
            
            {faqs.map(faq => (
              <Collapsible key={faq.id} open={openAccordion === faq.id} onOpenChange={isOpen => setOpenAccordion(isOpen ? faq.id : undefined)}>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openAccordion === faq.id ? 'rotate-180' : ''}`} />
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

          {/* CTA fixe mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:hidden z-50">
            <Button size="lg" className="w-full shadow-glow" onClick={handleStartTrial} disabled={loading}>
              8,99€/mois • Essai gratuit 7 jours
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tarif;