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

  const price = 8.99;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {}
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

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto animate-in">
          <Card className="p-10 border-2 border-primary shadow-2xl bg-gradient-to-br from-background to-primary/5">
            <div className="text-center mb-8">
              <Badge className="mb-4 text-base px-4 py-1.5 bg-gradient-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Plan Unique
              </Badge>
              <h2 className="text-4xl font-bold mb-2">All In</h2>
              <p className="text-muted-foreground">
                Toutes les fonctionnalités débloquées
              </p>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl font-bold text-primary">{price}€</span>
                <span className="text-xl text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sans engagement • Annulation en 1 clic
              </p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                "Programme sport + nutrition personnalisé",
                "Nouvelles séances chaque semaine",
                "Ajustements automatiques",
                "Alternatives d'exercices illimitées",
                "Vidéos et fiches techniques",
                "Support par email 7j/7",
                "Accès communauté Discord",
                "Toutes les futures fonctionnalités"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
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
          <Link to="/hub">
            <Button variant="ghost">
              Retour au hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
