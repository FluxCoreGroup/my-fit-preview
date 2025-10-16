import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Target, Zap, Clock, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground space-y-8 animate-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Ton coach fitness
              <br />
              <span className="text-primary-glow">personnalisé et IA</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Plans sport + nutrition adaptés à ton niveau, ton matériel et tes objectifs.
              Commence gratuitement en 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="hero" className="text-lg">
                    Aller au Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/start">
                    <Button size="lg" variant="hero" className="text-lg">
                      Commencer gratuitement
                    </Button>
                  </Link>
                  <Link to="/preview">
                    <Button size="lg" variant="outline" className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      Voir un exemple
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <p className="text-sm text-primary-foreground/70">
              1ère séance offerte • Sans engagement • Résultats garantis
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-12">Pourquoi Pulse.ai ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% personnalisé</h3>
              <p className="text-muted-foreground">
                Plans adaptés à ton âge, ton niveau, ton matériel et tes contraintes de temps.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rapide & efficace</h3>
              <p className="text-muted-foreground">
                Ton plan en moins de 5 minutes. Des séances de 30 à 60 minutes adaptées à ton emploi du temps.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Suivi & progression</h3>
              <p className="text-muted-foreground">
                Feedback après chaque séance. Ajustements automatiques pour des résultats constants.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Ce que tu obtiens</h2>
              <ul className="space-y-4">
                {[
                  "Plans nutrition personnalisés (calories + macros)",
                  "Séances d'entraînement détaillées avec alternatives",
                  "Timer intégré et suivi RPE/RIR",
                  "Check-in hebdomadaire pour ajustements",
                  "Exercices en vidéo avec consignes claires",
                  "Support par email 7j/7"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-8 bg-card">
              <Dumbbell className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">À la maison ou en salle</h3>
              <p className="text-muted-foreground mb-6">
                Que tu aies une salle complète ou juste ton poids du corps, Pulse.ai adapte tes séances à ton matériel disponible.
              </p>
              <Link to="/start">
                <Button variant="default" size="lg" className="w-full">
                  Essayer maintenant
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "C'est vraiment gratuit pour commencer ?",
                a: "Oui ! Tu obtiens un aperçu complet de ton plan et une séance gratuite. Ensuite, l'abonnement démarre à partir de 9,90€/mois."
              },
              {
                q: "Je suis débutant(e), ça marche pour moi ?",
                a: "Absolument ! Pulse.ai s'adapte à tous les niveaux, du débutant complet aux sportifs avancés. Les consignes sont claires et pédagogiques."
              },
              {
                q: "Comment les plans sont-ils générés ?",
                a: "Notre IA analyse tes réponses (âge, poids, objectif, matériel...) et crée un plan sur mesure en quelques secondes. Il s'ajuste ensuite selon tes feedbacks."
              },
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui, tu peux annuler ton abonnement quand tu veux, directement depuis ton tableau de bord. Aucune question posée."
              }
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2>Prêt(e) à commencer ?</h2>
          <p className="text-xl text-muted-foreground">
            Réponds à quelques questions et obtiens ton plan personnalisé en moins de 5 minutes.
          </p>
          <Link to="/start">
            <Button size="lg" variant="hero" className="text-lg">
              Lancer mon évaluation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Pulse.ai - Tous droits réservés</p>
          <div className="flex gap-6">
            <Link to="/legal" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link to="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
