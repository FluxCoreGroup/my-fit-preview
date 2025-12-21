import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dumbbell,
  Target,
  Zap,
  Clock,
  Check,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  Smartphone,
  Apple,
  Heart,
  MessageSquare,
  Salad,
  Bot,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import heroPhone from "@/assets/hero-phone.png";
import questionnairePreview from "@/assets/questionnaire-preview.png";
import programCreationPreview from "@/assets/program-creation-preview.png";
import sessionPreview from "@/assets/session-preview.png";
import coachAlexAvatar from "@/assets/coach-alex-avatar.png";
import coachJulieAvatar from "@/assets/coach-julie-avatar.png";
const testimonials = [
  {
    name: "Sophie M.",
    role: "Perdu 12kg en 3 mois",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    quote: "J'ai enfin trouvé un programme qui s'adapte à ma vie de maman. Les résultats sont là !",
  },
  {
    name: "Thomas L.",
    role: "Prise de masse réussie",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    quote: "Le suivi nutrition est incroyable. J'ai pris 8kg de muscle en gardant mes abdos visibles.",
  },
  {
    name: "Marie K.",
    role: "Débutante motivée",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    quote: "Je n'avais jamais fait de sport. Les exercices sont clairs et j'adore les alternatives proposées.",
  },
];
const faqItems = [
  {
    q: "C'est vraiment gratuit pour commencer ?",
    a: "Oui ! Tu obtiens un aperçu complet de ton plan nutrition et une séance d'entraînement gratuite. Ensuite, l'abonnement démarre à 8,99€/mois sans engagement.",
  },
  {
    q: "Je suis débutant(e), ça marche pour moi ?",
    a: "Absolument ! Pulse.ai s'adapte à tous les niveaux, du débutant complet aux sportifs avancés. Les consignes sont claires, pédagogiques et les exercices sont montrés en vidéo.",
  },
  {
    q: "Comment les plans sont-ils générés ?",
    a: "Notre IA analyse tes réponses (âge, poids, objectif, niveau, matériel disponible, contraintes...) et crée un plan 100% sur mesure en quelques secondes. Il s'ajuste ensuite automatiquement selon tes feedbacks hebdomadaires.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, tu peux annuler ton abonnement quand tu veux, directement depuis ton tableau de bord en 1 clic. Aucune question posée, aucun frais cachés.",
  },
  {
    q: "Quel matériel ai-je besoin ?",
    a: "Aucun matériel obligatoire ! Pulse.ai s'adapte à ce que tu as : poids du corps uniquement, haltères, barre, machines en salle... Tu sélectionnes ton équipement lors de la configuration.",
  },
  {
    q: "Les résultats sont-ils garantis ?",
    a: "Nous garantissons des résultats visibles en 4 semaines si tu suis ton plan à 80% minimum. Sinon, tu es remboursé(e) intégralement, sans justification.",
  },
  {
    q: "Puis-je suivre mes progrès ?",
    a: "Oui ! Dashboard complet avec historique des séances, évolution du poids/mensurations, graphiques de progression et ajustements automatiques du plan.",
  },
  {
    q: "Le support est-il inclus ?",
    a: "Oui ! Nos coachs IA Alex et Julie sont disponibles 24/7 pour t'accompagner. Pour le service client humain, nous répondons sous 48h (jours ouvrés) à general@pulse-ai.app.",
  },
];
const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 md:pt-24 px-4 md:px-6 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-hero rounded-[2.5rem] min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-between px-6 py-8 md:py-12 relative overflow-hidden">
            {/* Content - Top */}
            <div className="text-center text-primary-foreground space-y-6 animate-in pt-8 z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Ton coach fitness
                <br />
                dans ta poche.
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed px-4">
                Obtiens un plan sport & nutrition <strong>100% personnalisé</strong>. Résultats visibles en 4 semaines,
                garantis.
              </p>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-2 text-primary-foreground/90 py-2">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="text-base md:text-lg font-semibold">4,8/5 sur +1 200 utilisateurs actifs</span>
              </div>
            </div>

            {/* Phone Mockup - Centered */}
            <div className="flex justify-center z-10 my-4 flex-shrink">
              <img
                src={heroPhone}
                alt="Interface du Hub Pulse.ai avec 6 modules : Entraînements, Nutrition, Coach Alex, Coach Julie, Paramètres et Aide"
                className="w-[clamp(130px,30vw,240px)] max-h-[35vh] object-contain drop-shadow-2xl pointer-events-none select-none"
              />
            </div>

            {/* CTA - Bottom */}
            <div className="pb-4 md:pb-6 z-10 flex-shrink-0">
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
                    <span className="ml-2 text-sm opacity-70">~2 min</span>
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
      <section className="py-20 px-4" id="comment">
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
              <h3 className="text-3xl font-bold">Réponds à 15 questions</h3>
              <p className="text-muted-foreground text-lg">
                Âge, objectif, niveau, matériel disponible... Notre IA analyse ton profil pour créer un plan 100%
                personnalisé.
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
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={questionnairePreview}
                  alt="Questionnaire personnalisé"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Un questionnaire adaptatif selon tes objectifs.
              </p>
            </Card>
          </div>

          {/* Étape 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 bg-muted/30">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={programCreationPreview}
                  alt="Création de programme IA"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">L'IA crée ton programme sur mesure</p>
            </Card>
            <div className="space-y-4">
              <Badge variant="default" className="mb-2">
                Étape 2 • Instantané
              </Badge>
              <h3 className="text-3xl font-bold">Reçois ton plan complet</h3>
              <p className="text-muted-foreground text-lg">
                Nutrition (calories, macros, hydratation) + Programme d'entraînement adapté à ton matériel et ton emploi
                du temps.
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
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img src={sessionPreview} alt="Séance d'entraînement" className="w-full h-full object-cover" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Ta séance guidée pas à pas</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30" id="pourquoi">
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
                  "Coach sport IA Alex disponible 24/7",
                  "Nutritionniste IA Julie pour tes repas",
                  "Timer intégré et suivi RPE/RIR",
                  "Check-in hebdomadaire pour ajustements",
                  "Exercices en vidéo avec consignes claires",
                  "Support par email (réponse sous 48h)",
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
                Que tu aies une salle complète ou juste ton poids du corps, Pulse.ai adapte tes séances à ton matériel
                disponible.
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

      {/* Section Coachs IA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5" id="coachs-ia">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Intelligence Artificielle
            </Badge>
            <h2 className="mb-4">Tes Coachs IA 24/7</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des experts virtuels qui connaissent ton profil et répondent à toutes tes questions, jour et nuit
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Alex - Coach Sport */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={coachAlexAvatar}
                    alt="Alex - Coach Sport IA"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">Alex</h3>
                    <p className="text-muted-foreground">Coach Sport IA</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Adapte tes séances en temps réel selon ta forme</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Propose des alternatives si douleur ou fatigue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Répond à toutes tes questions entraînement</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Simplifie ma séance"
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Alternative sans douleur"
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Séance de 30 min"
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Julie - Nutritionniste IA */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-secondary/20 bg-gradient-to-br from-card to-secondary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={coachJulieAvatar}
                    alt="Julie - Nutritionniste IA"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-secondary/20"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">Julie</h3>
                    <p className="text-muted-foreground">Nutritionniste IA</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Génère des recettes personnalisées à tes goûts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Ajuste tes macros selon tes objectifs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Crée ta liste de courses en 1 clic</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Génère une journée-type"
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Remplace ce plat"
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    "Liste de courses"
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/coachs-ia">
              <Button size="lg" variant="default">
                Découvrir mes coachs IA
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

          {/* Mobile Cards Layout */}
          <div className="md:hidden space-y-4">
            {/* Pulse.ai Card - Featured */}
            <div className="bg-card rounded-xl border-2 border-primary p-5 relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Recommandé
              </div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <h3 className="font-bold text-lg text-primary">Pulse.ai</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">8,99€</span>
                  <span className="text-muted-foreground text-sm">/mois</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Personnalisation IA",
                    has: true,
                  },
                  {
                    label: "Ajustements automatiques",
                    has: true,
                  },
                  {
                    label: "Disponibilité 24/7",
                    has: true,
                  },
                  {
                    label: "Plans nutrition + sport",
                    has: true,
                  },
                  {
                    label: "Coach IA 24/7",
                    has: true,
                  },
                  {
                    label: "Support 7j/7",
                    has: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Personnel Card */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-muted-foreground">Coach personnel</h3>
                <div className="text-right">
                  <span className="text-xl font-bold text-muted-foreground">50-150€</span>
                  <span className="text-muted-foreground text-sm">/mois</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Personnalisation IA",
                    has: true,
                  },
                  {
                    label: "Ajustements automatiques",
                    has: true,
                  },
                  {
                    label: "Disponibilité 24/7",
                    has: false,
                  },
                  {
                    label: "Plans nutrition + sport",
                    has: true,
                  },
                  {
                    label: "Coach IA 24/7",
                    has: false,
                  },
                  {
                    label: "Support 7j/7",
                    has: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.has ? (
                      <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={`text-sm ${!item.has ? "text-muted-foreground/50" : ""}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apps Génériques Card */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-muted-foreground">Apps génériques</h3>
                <div className="text-right">
                  <span className="text-xl font-bold text-muted-foreground">0-15€</span>
                  <span className="text-muted-foreground text-sm">/mois</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Personnalisation IA",
                    has: false,
                  },
                  {
                    label: "Ajustements automatiques",
                    has: false,
                  },
                  {
                    label: "Disponibilité 24/7",
                    has: true,
                  },
                  {
                    label: "Plans nutrition + sport",
                    has: false,
                  },
                  {
                    label: "Coach IA 24/7",
                    has: false,
                  },
                  {
                    label: "Support 7j/7",
                    has: false,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.has ? (
                      <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={`text-sm ${!item.has ? "text-muted-foreground/50" : ""}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-card rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-6 px-3 lg:px-6 font-semibold"></th>
                  <th className="text-center py-6 px-3 lg:px-6 bg-primary/5">
                    <div className="font-bold text-primary text-lg">Pulse.ai</div>
                  </th>
                  <th className="text-center py-6 px-3 lg:px-6">
                    <div className="font-semibold text-muted-foreground">Coach personnel</div>
                  </th>
                  <th className="text-center py-6 px-3 lg:px-6">
                    <div className="font-semibold text-muted-foreground">Apps génériques</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Prix mensuel</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <span className="font-bold text-primary">8,99€</span>
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6 text-muted-foreground">50-150€</td>
                  <td className="text-center py-4 px-3 lg:px-6 text-muted-foreground">0-15€</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Personnalisation IA</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Ajustements automatiques</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Disponibilité 24/7</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Plans nutrition + sport</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-3 lg:px-6 font-medium">Coach IA 24/7</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-3 lg:px-6 font-medium">Support 7j/7</td>
                  <td className="text-center py-4 px-3 lg:px-6 bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center py-4 px-3 lg:px-6">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <Link to="/start">
              <Button size="lg">
                Essayer Pulse.ai gratuitement
                <span className="ml-2 text-sm opacity-70">~2 min</span>
                <ArrowRight className="w-5 h-5 ml-2" />
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
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="mb-4">Questions fréquentes</h2>
            <p className="text-muted-foreground text-lg">Tout ce que tu dois savoir sur Pulse.ai</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border rounded-xl px-6 transition-all duration-300 hover:shadow-md data-[state=open]:border-l-4 data-[state=open]:border-l-primary data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-base group-hover:text-primary transition-colors">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 pl-11 text-[15px] leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA Contact */}
          <div className="mt-12 text-center p-8 bg-card rounded-2xl border shadow-sm">
            <p className="text-muted-foreground mb-4 text-lg">Tu n'as pas trouvé ta réponse ?</p>
            <Link to="/support">
              <Button variant="outline" size="lg" className="group">
                <MessageSquare className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                Contacte notre équipe
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Amélioré */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-grid-white/5" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-bold">Prêt(e) à transformer ton corps ?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Rejoins <strong>1,247 membres</strong> qui progressent chaque jour avec Pulse.ai. Résultats visibles en 4
            semaines.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/start">
              <Button size="lg" className="text-lg">
                Commencer gratuitement
                <span className="ml-2 text-sm opacity-70">~2 min</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              Sans engagement
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Logo + Tagline */}
            <div className="space-y-4 col-span-2 md:col-span-1">
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
                  <a href="#comment" className="hover:text-foreground transition-colors">
                    Comment ?
                  </a>
                </li>
                <li>
                  <a href="#pourquoi" className="hover:text-foreground transition-colors">
                    Pourquoi ?
                  </a>
                </li>
                <li>
                  <a href="#coachs-ia" className="hover:text-foreground transition-colors">
                    Coach IA
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Prix
                  </a>
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
    </div>
  );
};
export default Landing;
