import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

export default function EmailVerified() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
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
      setChecking(false);
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (checking) return;
    
    console.log("⏱️ EmailVerified : Démarrage timer 5 secondes");
    
    // Timer pour le compte à rebours
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate('/training-setup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animation de la progress bar (0 à 100% en 5 secondes)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // +2% toutes les 100ms = 100% en 5 secondes
      });
    }, 100);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(progressInterval);
    };
  }, [navigate, checking]);

  const handleContinue = () => {
    console.log("➡️ Skip timer, redirection immédiate vers /training-setup");
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
      <div className="w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-glow p-8 animate-in">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icône de succès avec animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <CheckCircle className="w-20 h-20 text-primary relative animate-bounce" strokeWidth={2} />
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Email vérifié ! 🎉
              </h1>
              <p className="text-muted-foreground">
                Ton compte est activé, bienvenue sur Pulse !
              </p>
            </div>

            {/* Compte à rebours */}
            <div className="py-4">
              <div className="text-6xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                secondes
              </p>
            </div>

            {/* Barre de progression */}
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Redirection automatique vers ton questionnaire d'entraînement...
              </p>
            </div>

            {/* Bouton pour skip le timer */}
            <Button
              variant="hero"
              size="lg"
              onClick={handleContinue}
              className="w-full mt-4"
            >
              Continuer maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
