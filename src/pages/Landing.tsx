import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Award, Users, Clock, Gift, Target, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { useEffect } from "react";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      navigate("/hub");
    }
  }, [user, navigate]);

  // Ne rien afficher pendant la redirection
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header transparent overlay */}
      <Header variant="landing-overlay" />
      
      {/* Hero Section - Fullscreen avec image de fond */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond Unsplash */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(3px)",
            transform: "scale(1.05)",
          }}
        />
        
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-black/75 z-10" />
        
        {/* Contenu hero */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 py-24 md:py-20 text-center text-white space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" style={{ textShadow: "0 4px 16px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)" }}>
            Es-tu prêt à enfin voir des résultats concrets chaque semaine ?
          </h1>
          
          <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{ textShadow: "0 3px 12px rgba(0,0,0,0.7), 0 1px 6px rgba(0,0,0,0.5)" }}>
            Réponds à ces 15 questions pour que nous puissions mesurer et améliorer : ton meilleur physique, ta santé, ton alimentation.
          </p>
          
          <div className="pt-4">
            <Link to="/start">
              <Button size="lg" variant="hero" className="text-lg px-8 py-6 h-auto shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-105 transition-all duration-300">
                Commencer le quiz <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Crédibilité */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Fondé sur la science, conçu par des experts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pulse.ai a été créé par des coachs sportifs certifiés et s'appuie sur des décennies de recherche scientifique en sport et nutrition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 - Recherche scientifique */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Basé sur 20+ études scientifiques
              </h3>
              <p className="text-muted-foreground mb-4">
                Nos algorithmes s'appuient sur les recherches les plus récentes en science de l'entraînement et nutrition sportive.
              </p>
              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Progressive Overload (Schoenfeld et al., 2017)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Periodization Training (Rhea et al., 2003)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Protein Timing (Morton et al., 2018)</span>
                </li>
              </ul>
            </Card>

            {/* Card 2 - Créateurs */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Créé par des coachs certifiés
              </h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe fondatrice cumule plus de 15 ans d'expérience en coaching sportif et nutrition.
              </p>
              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Certifications NASM, ACE, ISSA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>+500 clients suivis en coaching privé</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Spécialistes en transformation physique</span>
                </li>
              </ul>
            </Card>

            {/* Card 3 - Collaboration */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Collaboration avec des professionnels
              </h3>
              <p className="text-muted-foreground mb-4">
                Nous travaillons main dans la main avec des experts reconnus pour garantir la qualité de nos programmes.
              </p>
              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Nutritionnistes diplômés d'État</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Kinésithérapeutes du sport</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Préparateurs physiques professionnels</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Bandeau de confiance */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Pulse.ai est approuvé par des professionnels de santé et du sport
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <div className="text-2xl font-bold">NASM</div>
              <div className="text-2xl font-bold">ACE</div>
              <div className="text-2xl font-bold">ISSA</div>
              <div className="text-2xl font-bold">ISO 27001</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA Finale */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            Prêt à transformer ton corps ?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Commence dès maintenant avec notre quiz personnalisé et reçois tes premières recommandations.
          </p>

          {/* 3 arguments clés */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Clock className="w-10 h-10 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Durée : 3 minutes</p>
              <p className="text-sm text-white/80">Quiz rapide et simple</p>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Gift className="w-10 h-10 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Complètement gratuit</p>
              <p className="text-sm text-white/80">Sans engagement ni CB</p>
            </Card>
            
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Target className="w-10 h-10 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Résultats immédiats</p>
              <p className="text-sm text-white/80">Recommandations personnalisées</p>
            </Card>
          </div>

          <div className="pt-6">
            <Link to="/start">
              <Button size="lg" variant="hero" className="text-lg px-8 py-6 h-auto bg-white text-primary hover:bg-white/90">
                Commencer le quiz <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/70 pt-4">
            Déjà <strong className="text-white">1,247+ personnes</strong> ont commencé leur transformation
          </p>
        </div>
      </section>

      {/* Footer minimaliste */}
      <footer className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Target className="w-6 h-6 text-primary" />
              <span>Pulse.ai</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/legal" className="hover:text-foreground transition-colors">
                Mentions légales
              </Link>
              <Link to="/legal" className="hover:text-foreground transition-colors">
                CGU
              </Link>
              <Link to="/legal" className="hover:text-foreground transition-colors">
                Confidentialité
              </Link>
              <Link to="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </nav>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-8">
            © 2025 Pulse.ai • Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
