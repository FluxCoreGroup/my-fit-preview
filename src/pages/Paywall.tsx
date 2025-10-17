import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Paywall = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planType: 'monthly' | 'yearly' = 'monthly') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
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
        <div className="text-center animate-in">
          <div className="w-16 h-16 gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Tu as aimé ta première séance ?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez ton programme complet et accède à toutes tes séances personnalisées,
            ton suivi nutrition et tes ajustements hebdomadaires.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="p-8 md:p-12 animate-in max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold">9,90€</span>
              <span className="text-xl text-muted-foreground">/mois</span>
            </div>
            <p className="text-muted-foreground">ou 89€/an (2 mois offerts)</p>
          </div>

          <div className="space-y-4 mb-8">
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
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            variant="hero"
            onClick={() => handleSubscribe('monthly')}
            disabled={loading}
            className="w-full text-lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {loading ? "Redirection..." : "S'abonner maintenant"}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Résiliable à tout moment • Garantie satisfait ou remboursé 14 jours
          </p>
        </Card>

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
