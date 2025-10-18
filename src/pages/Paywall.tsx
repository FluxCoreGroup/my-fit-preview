import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, CreditCard, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Paywall = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const monthlyPrice = 29.99;
  const yearlyPrice = 299.90;
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);
  const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: selectedPlan }
      });

      if (error) throw error;

      // Rediriger vers Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Stripe error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de créer la session de paiement. Réessaye.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-in space-y-4">
          <div className="w-20 h-20 gradient-hero rounded-full flex items-center justify-center mx-auto shadow-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Tu as aimé ta première séance ?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez ton programme complet et accède à toutes tes séances personnalisées,
            ton suivi nutrition et tes ajustements hebdomadaires.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in">
          {/* Plan Annuel - Recommandé */}
          <Card 
            className={`p-8 relative cursor-pointer transition-all ${
              selectedPlan === 'yearly' 
                ? 'ring-2 ring-primary shadow-glow scale-105' 
                : 'hover:scale-102'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Recommandé pour ton objectif
            </Badge>
            
            <div className="text-center mb-6 mt-2">
              <div className="mb-2">
                <span className="text-5xl font-bold">{yearlyMonthlyEquivalent}€</span>
                <span className="text-xl text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground">Facturé {yearlyPrice}€/an</p>
              <Badge variant="secondary" className="mt-2">
                Économise {savingsPercent}% 🎉
              </Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-medium">Meilleur pour résultats long terme</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Économise {Math.round(monthlyPrice * 12 - yearlyPrice)}€ sur l'année</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Programme complet sport + nutrition</span>
              </div>
            </div>

            <div className="w-full h-12 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium">
              {selectedPlan === 'yearly' ? '✓ Plan sélectionné' : 'Choisir ce plan'}
            </div>
          </Card>

          {/* Plan Mensuel */}
          <Card 
            className={`p-8 cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'ring-2 ring-primary shadow-glow scale-105' 
                : 'hover:scale-102'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="text-center mb-6 mt-9">
              <div className="mb-2">
                <span className="text-5xl font-bold">{monthlyPrice}€</span>
                <span className="text-xl text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground">Sans engagement</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Flexible et résiliable à tout moment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Idéal pour tester le programme</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Programme complet sport + nutrition</span>
              </div>
            </div>

            <div className="w-full h-12 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-medium">
              {selectedPlan === 'monthly' ? '✓ Plan sélectionné' : 'Choisir ce plan'}
            </div>
          </Card>
        </div>

        {/* Features incluses */}
        <Card className="p-8 animate-in max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-6 text-center">Tout ce qui est inclus :</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Programme complet sport + nutrition personnalisé",
              "Nouvelles séances chaque semaine",
              "Suivi et ajustements automatiques",
              "Alternatives d'exercices illimitées",
              "Vidéos et fiches techniques détaillées",
              "Support par email 7j/7",
              "Accès communauté (Discord)",
              "Mises à jour et nouvelles features incluses"
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Button */}
        <div className="max-w-2xl mx-auto space-y-4">
          <Button
            size="lg"
            variant="hero"
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full text-lg h-14 shadow-glow"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {loading ? "Redirection..." : "Commencer maintenant"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Résiliable à tout moment • Garantie satisfait ou remboursé 14 jours
          </p>
        </div>

        {/* Guarantees */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Via Stripe, leader mondial des paiements en ligne
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold mb-2">Sans engagement</h3>
            <p className="text-sm text-muted-foreground">
              Résilie quand tu veux en 1 clic depuis ton compte
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Garantie 14 jours</h3>
            <p className="text-sm text-muted-foreground">
              Remboursement intégral si pas satisfait
            </p>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Questions fréquentes</h2>
          {[
            {
              q: "Puis-je essayer avant de payer ?",
              a: "Oui ! Tu viens de faire ta première séance gratuitement. L'abonnement débloque toutes les autres séances et le suivi complet."
            },
            {
              q: "Y a-t-il des frais cachés ?",
              a: "Non. Le prix affiché est le prix final. Pas de frais d'inscription, pas de supplément."
            },
            {
              q: "Comment ça se passe si je veux annuler ?",
              a: "Tu vas dans Paramètres > Abonnement > Résilier. C'est instantané et sans justification."
            }
          ].map((faq, i) => (
            <Card key={i} className="p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </Card>
          ))}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button variant="ghost">
              Voir mon dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
