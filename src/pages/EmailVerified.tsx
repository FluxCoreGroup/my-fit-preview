import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Dumbbell, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function EmailVerified() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Vérifier que l'utilisateur est bien connecté
    const checkAuth = async () => {
      console.log("✅ EmailVerified : Vérification session...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ Pas de session, redirection vers /auth");
        navigate("/auth");
        return;
      }
      
      console.log("✅ Session confirmée pour", session.user.email);
      localStorage.removeItem("pendingEmail");
      setChecking(false);
    };
    
    checkAuth();
  }, [navigate]);

  const handleStartProgram = () => {
    console.log("🚀 Redirection vers /training-setup");
    navigate('/training-setup');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 gradient-hero rounded-full mx-auto animate-pulse"></div>
          <p className="text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-glow p-8 md:p-10 animate-in space-y-8">
          
          {/* En-tête avec icône et badge */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icône de succès */}
            <div className="relative">
              <div className="bg-primary/10 p-6 rounded-full">
                <CheckCircle 
                  className="w-16 h-16 text-primary" 
                  strokeWidth={2.5} 
                />
              </div>
            </div>

            {/* Badge succès */}
            <Badge className="gradient-accent text-white px-4 py-1 text-sm font-medium">
              ✓ Compte vérifié
            </Badge>

            {/* Titre principal */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-in">
                Bienvenue sur Pulse ! 🎉
              </h1>
              <p className="text-muted-foreground text-lg">
                Ton email est confirmé, tu es prêt à transformer ton entraînement.
              </p>
            </div>
          </div>

          {/* Section "Ce qui t'attend" */}
          <div className="space-y-4 py-6 border-t border-border">
            <h3 className="text-lg font-semibold text-center mb-4">
              Ce qui t'attend :
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Programme personnalisé</p>
                  <p className="text-xs text-muted-foreground">
                    Adapté à tes objectifs et ton niveau
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Suivi de progression</p>
                  <p className="text-xs text-muted-foreground">
                    Visualise ton évolution en temps réel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Coaching intelligent</p>
                  <p className="text-xs text-muted-foreground">
                    Des recommandations adaptées à ta progression
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA principal */}
          <div className="pt-4">
            <Button
              variant="hero"
              size="lg"
              onClick={handleStartProgram}
              className="w-full text-lg group hover:shadow-glow transition-all"
            >
              Créer mon programme 💪
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
