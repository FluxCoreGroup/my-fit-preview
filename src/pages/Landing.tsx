import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dumbbell, Target, Zap, Clock, Check, Star, Users, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const testimonials = [
  {
    name: "Sophie M.",
    role: "Perdu 12kg en 3 mois",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    quote: "J'ai enfin trouvé un programme qui s'adapte à ma vie de maman. Les résultats sont là !"
  },
  {
    name: "Thomas L.",
    role: "Prise de masse réussie",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    quote: "Le suivi nutrition est incroyable. J'ai pris 8kg de muscle en gardant mes abdos visibles."
  },
  {
    name: "Marie K.",
    role: "Débutante motivée",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    quote: "Je n'avais jamais fait de sport. Les exercices sont clairs et j'adore les alternatives proposées."
  }
];

const faqItems = [
  {
    q: "C'est vraiment gratuit pour commencer ?",
    a: "Oui ! Tu obtiens un aperçu complet de ton plan nutrition et une séance d'entraînement gratuite. Ensuite, l'abonnement démarre à partir de 9,90€/mois sans engagement."
  },
  {
    q: "Je suis débutant(e), ça marche pour moi ?",
    a: "Absolument ! Pulse.ai s'adapte à tous les niveaux, du débutant complet aux sportifs avancés. Les consignes sont claires, pédagogiques et les exercices sont montrés en vidéo."
  },
  {
    q: "Comment les plans sont-ils générés ?",
    a: "Notre IA analyse tes réponses (âge, poids, objectif, niveau, matériel disponible, contraintes...) et crée un plan 100% sur mesure en quelques secondes. Il s'ajuste ensuite automatiquement selon tes feedbacks hebdomadaires."
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, tu peux annuler ton abonnement quand tu veux, directement depuis ton tableau de bord en 1 clic. Aucune question posée, aucun frais cachés."
  },
  {
    q: "Quel matériel ai-je besoin ?",
    a: "Aucun matériel obligatoire ! Pulse.ai s'adapte à ce que tu as : poids du corps uniquement, haltères, barre, machines en salle... Tu sélectionnes ton équipement lors de la configuration."
  },
  {
    q: "Les résultats sont-ils garantis ?",
    a: "Nous garantissons des résultats visibles en 4 semaines si tu suis ton plan à 80% minimum. Sinon, tu es remboursé(e) intégralement, sans justification."
  },
  {
    q: "Puis-je suivre mes progrès ?",
    a: "Oui ! Dashboard complet avec historique des séances, évolution du poids/mensurations, graphiques de progression et ajustements automatiques du plan."
  },
  {
    q: "Le support est-il inclus ?",
    a: "Oui, support par email 7j/7 inclus dans tous les abonnements. Réponse garantie sous 24h (souvent bien plus rapide)."
  }
];

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero Section - Amélioré */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground space-y-8 animate-in">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Nouveau : Plans IA adaptatifs en temps réel
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Ton coach fitness
              <br />
              <span className="text-primary-glow">dans ta poche</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Des plans sport + nutrition 100% personnalisés par IA.
              <br />
              <strong>Résultats visibles en 4 semaines, garantis.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="hero" className="text-lg">
                    Aller au Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/start">
                    <Button size="lg" variant="hero" className="text-lg">
                      Commencer gratuitement <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/preview">
                    <Button size="lg" variant="outline" className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      Voir une démo
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Sans engagement
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Setup en 2 min
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                1ère séance offerte
              </div>
            </div>
            
            {/* Compteur de confiance */}
            <p className="text-sm text-primary-foreground/70 pt-2">
              <Users className="w-4 h-4 inline mr-1" />
              Déjà <strong>1,247 membres actifs</strong> qui transforment leur corps
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section - NOUVEAU */}
      <section className="py-12 border-y bg-muted/20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Stats clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1,247+</div>
              <div className="text-muted-foreground">Membres actifs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.8/5</div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                Note moyenne
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">-8kg</div>
              <div className="text-muted-foreground">Perte moyenne en 2 mois</div>
            </div>
          </div>
          
          {/* Témoignages */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm italic text-muted-foreground">"{t.quote}"</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche Section - NOUVEAU */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="mb-4">Comment ça marche ?</h2>
          <p className="text-xl text-muted-foreground">3 étapes simples pour transformer ton corps</p>
        </div>
        
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Étape 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <Badge variant="default" className="mb-2">
                Étape 1 • 2 minutes
              </Badge>
              <h3 className="text-3xl font-bold">Réponds à 5 questions</h3>
              <p className="text-muted-foreground text-lg">
                Âge, objectif, niveau, matériel disponible... Notre IA analyse ton profil pour créer un plan 100% personnalisé.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Aucune connaissance requise</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Questions simples et rapides</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Adapté à ton emploi du temps</span>
                </li>
              </ul>
            </div>
            <Card className="p-6 order-1 md:order-2 bg-muted/30">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <Target className="w-20 h-20 text-primary/40" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Questionnaire personnalisé</p>
            </Card>
          </div>
          
          {/* Étape 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 bg-muted/30">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-primary/40" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Analyse IA instantanée</p>
            </Card>
            <div className="space-y-4">
              <Badge variant="default" className="mb-2">
                Étape 2 • Instantané
              </Badge>
              <h3 className="text-3xl font-bold">Reçois ton plan complet</h3>
              <p className="text-muted-foreground text-lg">
                Nutrition (calories, macros, hydratation) + Programme d'entraînement adapté à ton matériel et ton emploi du temps.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Plan généré en 15 secondes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Explications détaillées de chaque métrique</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Ajustements automatiques chaque semaine</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Étape 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <Badge variant="default" className="mb-2">
                Étape 3 • Suivi continu
              </Badge>
              <h3 className="text-3xl font-bold">Lance ta 1ère séance gratuite</h3>
              <p className="text-muted-foreground text-lg">
                Timer intégré, alternatives d'exercices, tracking RPE/RIR... Tout pour progresser efficacement.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Vidéos de démonstration pour chaque exercice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Ajustements automatiques selon tes feedbacks</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>Historique complet de tes progrès</span>
                </li>
              </ul>
            </div>
            <Card className="p-6 order-1 md:order-2 bg-muted/30">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-20 h-20 text-primary/40" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Séance en cours avec timer</p>
            </Card>
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
                <TrendingUp className="w-6 h-6 text-accent" />
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

      {/* FAQ Section - Améliorée avec Accordion */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-4">Questions fréquentes</h2>
          <p className="text-center text-muted-foreground mb-12">
            Tout ce que tu dois savoir sur Pulse.ai
          </p>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section - Amélioré */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-grid-white/5" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 text-primary-foreground">
          <Badge variant="secondary" className="mb-4">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Satisfait ou remboursé sous 30 jours
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Prêt(e) à transformer ton corps ?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Rejoins <strong>1,247 membres</strong> qui progressent chaque jour avec Pulse.ai.
            Résultats visibles en 4 semaines ou remboursé.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/start">
              <Button size="lg" variant="secondary" className="text-lg">
                Commencer gratuitement <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/preview">
              <Button size="lg" variant="outline" className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Voir une démo
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Sans carte bancaire
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Setup en 2 min
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Annulation en 1 clic
            </div>
          </div>
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
