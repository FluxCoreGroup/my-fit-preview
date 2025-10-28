import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dumbbell, Target, Zap, Clock, Check, Star, Users, TrendingUp, Sparkles, ShieldCheck, ArrowRight, X, Smartphone, Apple, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import handPhoneMockup from "@/assets/hand-phone-mockup.png";
const testimonials = [{
  name: "Sophie M.",
  role: "Perdu 12kg en 3 mois",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  quote: "J'ai enfin trouvé un programme qui s'adapte à ma vie de maman. Les résultats sont là !"
}, {
  name: "Thomas L.",
  role: "Prise de masse réussie",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
  quote: "Le suivi nutrition est incroyable. J'ai pris 8kg de muscle en gardant mes abdos visibles."
}, {
  name: "Marie K.",
  role: "Débutante motivée",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
  quote: "Je n'avais jamais fait de sport. Les exercices sont clairs et j'adore les alternatives proposées."
}];
const faqItems = [{
  q: "C'est vraiment gratuit pour commencer ?",
  a: "Oui ! Tu obtiens un aperçu complet de ton plan nutrition et une séance d'entraînement gratuite. Ensuite, l'abonnement démarre à partir de 9,90€/mois sans engagement."
}, {
  q: "Je suis débutant(e), ça marche pour moi ?",
  a: "Absolument ! Pulse.ai s'adapte à tous les niveaux, du débutant complet aux sportifs avancés. Les consignes sont claires, pédagogiques et les exercices sont montrés en vidéo."
}, {
  q: "Comment les plans sont-ils générés ?",
  a: "Notre IA analyse tes réponses (âge, poids, objectif, niveau, matériel disponible, contraintes...) et crée un plan 100% sur mesure en quelques secondes. Il s'ajuste ensuite automatiquement selon tes feedbacks hebdomadaires."
}, {
  q: "Puis-je annuler à tout moment ?",
  a: "Oui, tu peux annuler ton abonnement quand tu veux, directement depuis ton tableau de bord en 1 clic. Aucune question posée, aucun frais cachés."
}, {
  q: "Quel matériel ai-je besoin ?",
  a: "Aucun matériel obligatoire ! Pulse.ai s'adapte à ce que tu as : poids du corps uniquement, haltères, barre, machines en salle... Tu sélectionnes ton équipement lors de la configuration."
}, {
  q: "Les résultats sont-ils garantis ?",
  a: "Nous garantissons des résultats visibles en 4 semaines si tu suis ton plan à 80% minimum. Sinon, tu es remboursé(e) intégralement, sans justification."
}, {
  q: "Puis-je suivre mes progrès ?",
  a: "Oui ! Dashboard complet avec historique des séances, évolution du poids/mensurations, graphiques de progression et ajustements automatiques du plan."
}, {
  q: "Le support est-il inclus ?",
  a: "Oui, support par email 7j/7 inclus dans tous les abonnements. Réponse garantie sous 24h (souvent bien plus rapide)."
}];
const Landing = () => {
  const {
    user
  } = useAuth();
  return <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 md:pt-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-hero rounded-[2.5rem] min-h-[90vh] flex flex-col items-center justify-between px-6 py-12 md:py-16 relative overflow-hidden">
            {/* Content - Top */}
            <div className="text-center text-primary-foreground space-y-6 animate-in pt-8 z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Ton coach fitness
                <br />
                dans ta poche.
              </h1>
              
              <p className="text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed px-4">
                Obtiens un plan sport & nutrition <strong>100% personnalisé</strong>. Résultats visibles en 4 semaines, garantis.
              </p>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center gap-2 text-primary-foreground/90 py-2">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="text-base md:text-lg font-semibold">4,9/5 sur +1 200 utilisateurs actifs</span>
              </div>
            </div>
            
            {/* Phone Mockup - Right side with overflow */}
            <div className="absolute -right-8 md:-right-12 bottom-0 z-10 w-1/2 md:w-2/5 max-w-sm animate-in" style={{ animationDelay: '0.2s' }}>
              <img 
                src={handPhoneMockup} 
                alt="Interface Pulse.ai" 
                className="w-full drop-shadow-2xl"
              />
            </div>
            
            {/* CTA - Bottom */}
            <div className="pb-6 z-10">
              {user ? (
                <Link to="/hub">
                  <Button 
                    size="lg" 
                    className="text-base md:text-lg px-12 py-6 h-auto rounded-full shadow-glow hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-primary-foreground/90 hover:bg-primary-foreground text-primary font-semibold"
                  >
                    Aller au Hub
                  </Button>
                </Link>
              ) : (
                <Link to="/start">
                  <Button 
                    size="lg" 
                    className="text-base md:text-lg px-12 py-6 h-auto rounded-full shadow-glow hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-primary-foreground/90 hover:bg-primary-foreground text-primary font-semibold"
                  >
                    Faire le quiz
                  </Button>
                </Link>
              )}
            </div>
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
            {testimonials.map((t, i) => <Card key={i} className="p-6">
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
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}
                </div>
              </Card>)}
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
                {["Plans nutrition personnalisés (calories + macros)", "Séances d'entraînement détaillées avec alternatives", "Timer intégré et suivi RPE/RIR", "Check-in hebdomadaire pour ajustements", "Exercices en vidéo avec consignes claires", "Support par email 7j/7"].map((feature, i) => <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>)}
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

      {/* Comparaison Section */}
      <section className="py-20 px-4 bg-muted/30" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Pourquoi choisir Pulse.ai ?</h2>
            <p className="text-muted-foreground text-lg">
              Compare notre approche avec les alternatives traditionnelles
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-6 px-6 font-semibold"></th>
                  <th className="text-center py-6 px-6 bg-primary/5">
                    <div className="font-bold text-primary text-lg">Pulse.ai</div>
                  </th>
                  <th className="text-center py-6 px-6">
                    <div className="font-semibold text-muted-foreground">Coach personnel</div>
                  </th>
                  <th className="text-center py-6 px-6">
                    <div className="font-semibold text-muted-foreground">Apps génériques</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-6 font-medium">Prix mensuel</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <span className="font-bold text-primary">9,90€</span>
                  </td>
                  <td className="text-center py-4 px-6 text-muted-foreground">50-150€</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">0-15€</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 font-medium">Personnalisation IA</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 font-medium">Ajustements automatiques</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 font-medium">Disponibilité 24/7</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 font-medium">Plans nutrition + sport</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Support 7j/7</td>
                  <td className="text-center py-4 px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/start">
              <Button size="lg">
                Essayer Pulse.ai gratuitement <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intégrations Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="mb-4">Synchronise avec tes apps préférées</h2>
          <p className="text-muted-foreground text-lg mb-12">
            Connecte Pulse.ai à tes applications de santé et fitness pour un suivi optimal
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">Apple Health</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">Google Fit</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">Fitbit</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">Strava</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - Améliorée avec Accordion */}
      <section className="py-20 px-4 bg-muted/30" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-4">Questions fréquentes</h2>
          <p className="text-center text-muted-foreground mb-12">
            Tout ce que tu dois savoir sur Pulse.ai
          </p>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((faq, i) => <AccordionItem key={i} value={`item-${i}`} className="bg-card border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>)}
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
              <Button size="lg" variant="outline" className="text-lg border-primary-foreground hover:bg-primary-foreground text-zinc-800">
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

      {/* Footer Amélioré */}
      <footer className="border-t py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo + Tagline */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                <Dumbbell className="w-6 h-6 text-primary" />
                <span>Pulse.ai</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Ton coach fitness IA, disponible 24/7 pour transformer ton corps.
              </p>
              <div className="flex gap-4 pt-2">
                <Badge variant="outline" className="text-xs">
                  🔒 Paiement sécurisé
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ✓ RGPD
                </Badge>
              </div>
            </div>

            {/* Produit */}
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <Link to="/preview" className="hover:text-foreground transition-colors">
                    Voir une démo
                  </Link>
                </li>
                <li>
                  <Link to="/start" className="hover:text-foreground transition-colors">
                    Commencer
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/support" className="hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-foreground transition-colors">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/legal" className="hover:text-foreground transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-foreground transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-foreground transition-colors">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Pulse.ai - Tous droits réservés</p>
            <div className="flex gap-4">
              <span>Fait avec ❤️ pour ta transformation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;