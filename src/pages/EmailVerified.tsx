import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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

            {/* Messages */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Email vérifié ! 🎉
              </h1>
              <p className="text-muted-foreground">
                Ton compte est activé, bienvenue sur Pulse !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
