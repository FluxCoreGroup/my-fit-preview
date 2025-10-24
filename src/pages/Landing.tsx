import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Apple, Target, ShieldCheck, Award, Users, Star, Clock, ArrowRight, Mail, Instagram, Linkedin, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header variant="marketing" />

      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-8 animate-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                En avez-vous assez de ne pas voir de progrès malgré tous vos efforts ?
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Répondez à 15 questions pour comprendre ce qui freine vos progrès et recevez des conseils sur mesure pour enfin avancer. Vous allez découvrir pourquoi vous stagnez et comment changer les choses – dès maintenant.
              </p>
              
              <div className="space-y-4">
                <Link to="/start">
                  <Button size="lg" className="w-full md:w-auto text-lg h-14 px-8">
                    Commencer l'évaluation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  15 questions · ~3 minutes
                </p>
              </div>
            </div>

            {/* Right: Illustration placeholder */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Target className="w-20 h-20 text-primary mx-auto" />
                    <div className="space-y-2">
                      <div className="h-2 w-32 bg-primary/30 rounded mx-auto"></div>
                      <div className="h-2 w-24 bg-primary/30 rounded mx-auto"></div>
                      <div className="h-2 w-28 bg-primary/30 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Pourquoi passer cette évaluation ?" */}
      <section id="evaluation" className="py-20 md:py-32 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Pourquoi passer cette évaluation ?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              En participant à l'évaluation Pulse.ai, vous obtiendrez un aperçu clair de vos forces et faiblesses sur trois axes clés de votre transformation :
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Entraînement */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Entraînement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Un plan d'entraînement adapté à votre niveau et à vos objectifs pour des progrès réels.
              </p>
            </Card>

            {/* Nutrition */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Apple className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Nutrition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Des recommandations nutritionnelles personnalisées pour soutenir vos efforts et optimiser vos résultats.
              </p>
            </Card>

            {/* Motivation */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Motivation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Des astuces de coaching pour rester motivé, garder le cap et ne plus abandonner en cours de route.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Section "Conçu par des experts" */}
      <section id="experts" className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">Conçu par des experts</h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Des études ont montré que sans accompagnement, la majorité des personnes abandonnent leurs bonnes résolutions sportives en quelques semaines. Chez Pulse.ai, nous avons décidé de changer la donne.
                </p>
                <p>
                  Notre équipe de coachs certifiés et de spécialistes en IA a développé cette évaluation afin de vous fournir des résultats fiables et personnalisés, adaptés à votre profil unique.
                </p>
                <p>
                  Notre algorithme analyse plus de <strong className="text-foreground">20 paramètres individuels</strong> pour cerner vos besoins spécifiques. Chaque recommandation est ensuite validée par de vrais coachs professionnels afin de garantir un programme <strong className="text-foreground">100 % personnalisé</strong>, efficace et sans danger. En combinant l'intelligence artificielle et l'expertise humaine, Pulse.ai vous offre le meilleur accompagnement possible vers vos objectifs.
                </p>
              </div>
            </div>

            {/* Right: Metrics & Badges */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">20+</div>
                  <div className="text-sm text-muted-foreground">Paramètres analysés</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">1 247+</div>
                  <div className="text-sm text-muted-foreground">Membres actifs</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-primary">4.8</span>
                    <Star className="w-6 h-6 fill-primary text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Note satisfaction</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">-8kg</div>
                  <div className="text-sm text-muted-foreground">Moyenne en 2 mois</div>
                </Card>
              </div>

              <div className="flex gap-4 justify-center">
                <Badge variant="secondary" className="px-4 py-2">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Coachs certifiés
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Award className="w-4 h-4 mr-2" />
                  IA validée
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 md:py-32 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Témoignages</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jean" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Jean D.</div>
                  <div className="text-sm text-muted-foreground">29 ans, Lyon</div>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground italic">
                "J'ai enfin compris comment adapter mon entraînement et ma nutrition grâce à Pulse.ai. En quelques semaines, j'ai vu des progrès incroyables !"
              </p>
            </Card>

            {/* Témoignage 2 */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Sophie M.</div>
                  <div className="text-sm text-muted-foreground">34 ans, Paris</div>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground italic">
                "Les conseils personnalisés reçus à la fin du quiz m'ont motivée à fond. Chaque recommandation était adaptée à ma routine, ce qui m'a vraiment aidée à ne pas abandonner."
              </p>
            </Card>

            {/* Témoignage 3 */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Antoine" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Antoine L.</div>
                  <div className="text-sm text-muted-foreground">41 ans, Bordeaux</div>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground italic">
                "Incroyable : en 3 minutes, j'ai obtenu un plan d'action clair. On sent que c'est fait par des pros – tout est sur mesure et ça m'a remotivé comme jamais !"
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Partenaires */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">Ils nous font confiance</p>
          
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
            <div className="text-2xl font-bold">NIKE</div>
            <div className="text-2xl font-bold">DECATHLON</div>
            <div className="text-2xl font-bold">INSEP</div>
            <div className="text-2xl font-bold">LesMills</div>
            <div className="text-2xl font-bold">Men's Health</div>
          </div>
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="py-20 md:py-32 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">Passez à l'action</h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            Ne remettez pas votre transformation à plus tard. Commencez le quiz Pulse.ai dès maintenant – cela ne prend que 3 minutes, c'est gratuit, et vous recevrez immédiatement un plan d'action personnalisé pour atteindre vos objectifs. Prenez de l'avance dès aujourd'hui sur la route de votre réussite !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/start">
              <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
                Commencer le quiz maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-primary-foreground/80">
            <div>✓ Sans carte bancaire</div>
            <div>✓ Gratuit</div>
            <div>✓ 3 minutes chrono</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Colonne 1: Marque */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Dumbbell className="w-6 h-6 text-primary" />
                <span>Pulse.ai</span>
              </div>
              <p className="text-sm text-slate-400">
                Votre coach fitness IA personnel pour des résultats garantis.
              </p>
            </div>

            {/* Colonne 2: Produit */}
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/start" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Évaluation
                  </Link>
                </li>
                <li>
                  <Link to="/preview" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link to="/paywall" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Tarifs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Ressources */}
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#experts" className="text-slate-400 hover:text-slate-100 transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <Link to="/support" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4: Légal */}
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/legal" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-slate-400 hover:text-slate-100 transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="text-slate-400 hover:text-slate-100 transition-colors">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-slate-700" />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2025 Pulse.ai. Tous droits réservés.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
