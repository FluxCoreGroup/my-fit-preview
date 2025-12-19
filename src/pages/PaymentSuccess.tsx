import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartyPopper, CheckCircle, Sparkles, Dumbbell, Apple, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get("session_id");
  const isNewUser = searchParams.get("is_new") === "true";

  useEffect(() => {
    // Wait for auth to load before deciding
    if (authLoading) return;

    // If user is not authenticated, redirect to signup with payment info
    if (!user) {
      const signupUrl = `/signup?payment_success=true${sessionId ? `&session_id=${sessionId}` : ""}`;
      navigate(signupUrl);
      return;
    }

    // User is authenticated - start countdown and redirect to hub
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/hub?subscription=success");
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate, user, authLoading, sessionId]);

  const handleStartNow = () => {
    if (!user) {
      navigate(`/signup?payment_success=true${sessionId ? `&session_id=${sessionId}` : ""}`);
    } else {
      navigate("/hub?subscription=success");
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-8 border-primary/20 shadow-2xl">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <PartyPopper className="w-20 h-20 text-primary animate-pulse" />
            <Sparkles className="w-8 h-8 text-secondary absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Bienvenue dans Pulse.ai Premium ! 🎉
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-muted-foreground">Ton abonnement est actif</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Dumbbell className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Séances d'entraînement illimitées personnalisées</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Apple className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Plan nutrition adapté à tes objectifs</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Suivi de progression détaillé</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Accès aux coachs IA Alex & Julie 24/7</span>
          </div>
        </div>

        {/* Timer */}
        {user && countdown > 0 && (
          <p className="text-center text-sm text-muted-foreground mb-4">
            Redirection dans {countdown} seconde{countdown > 1 ? "s" : ""}...
          </p>
        )}

        {/* CTA */}
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          onClick={handleStartNow}
        >
          {user ? "Accéder à mon espace" : "Créer mon compte"}
        </Button>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
