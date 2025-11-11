import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp } = useAuth();
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPostPayment, setIsPostPayment] = useState(false);
  const [emailReadonly, setEmailReadonly] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check for post-payment flow
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const stripeSessionId = searchParams.get("session_id");

    if (paymentSuccess === "true" && stripeSessionId) {
      setIsPostPayment(true);
      setSessionId(stripeSessionId);
      fetchStripeSessionData(stripeSessionId);
    }
  }, [searchParams]);

  const fetchStripeSessionData = async (stripeSessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-checkout-session', {
        body: { sessionId: stripeSessionId }
      });

      if (error) throw error;

      if (data?.customer_email) {
        setSignupEmail(data.customer_email);
        setEmailReadonly(true);
        toast({
          title: "Paiement validé ! 🎉",
          description: "Créé ton compte pour accéder à ton programme",
        });
      }
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de paiement",
        variant: "destructive",
      });
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/hub");
      return;
    }

    // Check if onboarding data exists (skip for post-payment flow)
    if (!isPostPayment) {
      const onboardingData = localStorage.getItem("onboardingData");
      if (!onboardingData) {
        navigate("/start");
      }
    }
  }, [user, navigate, isPostPayment]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = signupSchema.parse({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      // For post-payment flow, skip email confirmation
      const { error } = await signUp(
        validatedData.email,
        validatedData.password,
        validatedData.name,
        isPostPayment // Skip email confirmation if post-payment
      );

      if (!error) {
        if (isPostPayment && sessionId) {
          // Link Stripe subscription to user
          toast({
            title: "Compte créé ! 🎉",
            description: "Liaison de ton abonnement...",
          });

          try {
            // Wait for user session to be fully established
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get fresh session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              throw new Error("Session non établie");
            }

            const { error: linkError } = await supabase.functions.invoke('link-stripe-subscription', {
              body: { sessionId },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });

            if (linkError) throw linkError;

            toast({
              title: "Abonnement activé !",
              description: "Accès à ton programme personnalisé",
            });

            // Clear onboarding data
            localStorage.removeItem("onboardingData");
            localStorage.removeItem("hasSeenPreview");

            // Redirect to training setup
            navigate("/training-setup");
          } catch (linkError: any) {
            console.error('Error linking subscription:', linkError);
            toast({
              title: "Avertissement",
              description: "Compte créé mais erreur de liaison. Contacte le support.",
              variant: "destructive",
            });
            navigate("/hub");
          }
        } else {
          // Normal flow with email confirmation
          localStorage.setItem("pendingEmail", validatedData.email);
          navigate("/email-confirmation");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("Validation error:", err.errors[0].message);
        toast({
          title: "Erreur de validation",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="onboarding" showBack onBack={() => navigate(isPostPayment ? "/tarif" : "/preview")} />
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8 pt-24">
        <div className="max-w-md w-full">
          {isPostPayment && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary">Paiement validé !</p>
                <p className="text-sm text-muted-foreground">
                  Essai gratuit de 7 jours activé • Aucun débit immédiat
                </p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {isPostPayment ? "Finalise ton inscription" : "Crée ton compte"}
            </h1>
            <p className="text-muted-foreground">
              {isPostPayment 
                ? "Dernière étape pour accéder à ton programme personnalisé"
                : "Accède à ton programme personnalisé et ta première séance gratuite"
              }
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Nom</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Ton prénom"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ton@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    disabled={emailReadonly}
                    required
                  />
                </div>
                {emailReadonly && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Email récupéré depuis ton paiement
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
                {loading ? (isPostPayment ? "Finalisation..." : "Création...") : (isPostPayment ? "Activer mon programme" : "Créer mon compte")}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Tu as déjà un compte ?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => navigate("/auth")}
                >
                  Connecte-toi
                </Button>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
