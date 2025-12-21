import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, CheckCircle2, Check, Circle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(255),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
  }),
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
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      const { data, error } = await supabase.functions.invoke("get-checkout-session", {
        body: { sessionId: stripeSessionId },
      });

      if (error) throw error;

      if (data?.customer_email) {
        setSignupEmail(data.customer_email);
        setEmailReadonly(true);
      }
    } catch (error: any) {
      console.error("Error fetching session:", error);
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
        acceptedTerms: acceptedTerms,
      });

      // For post-payment flow, skip email confirmation
      const { error } = await signUp(
        validatedData.email,
        validatedData.password,
        validatedData.name,
        isPostPayment, // Skip email confirmation if post-payment
      );

      if (!error) {
        if (isPostPayment && sessionId) {
          // Link Stripe subscription to user

          try {
            // Wait for user session to be fully established
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Get fresh session
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
              throw new Error("Session non établie");
            }

            const { error: linkError } = await supabase.functions.invoke("link-stripe-subscription", {
              body: { sessionId },
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (linkError) throw linkError;

            // Clear onboarding data
            localStorage.removeItem("onboardingData");
            localStorage.removeItem("hasSeenPreview");

            // Redirect to onboarding intro
            navigate("/onboarding-intro");
          } catch (linkError: any) {
            console.error("Error linking subscription:", linkError);
            navigate("/onboarding-intro");
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
      <Header variant="onboarding" showBack={false} hideAuthButton />
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8 pt-24">
        <div className="max-w-md w-full">
          {isPostPayment && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary">Paiement validé !</p>
                <p className="text-sm text-muted-foreground">Essai gratuit de 7 jours activé • Aucun débit immédiat</p>
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
                : "Accède à ton programme personnalisé et ta première séance gratuite"}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Prénom</Label>
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
                  <p className="text-xs text-muted-foreground mt-1">Email récupéré depuis ton paiement</p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                <div className="mt-2 space-y-1">
                  <p
                    className={`text-xs flex items-center gap-1 ${signupPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {signupPassword.length >= 8 ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}8
                    caractères minimum
                  </p>
                  <p
                    className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {/[A-Z]/.test(signupPassword) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}1
                    majuscule
                  </p>
                  <p
                    className={`text-xs flex items-center gap-1 ${/[0-9]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {/[0-9]/.test(signupPassword) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}1
                    chiffre
                  </p>
                </div>
              </div>

              {/* Terms acceptance checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal">
                  J'accepte les{" "}
                  <a
                    href="/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Conditions Générales d'Utilisation
                  </a>
                  {" "}et la{" "}
                  <a
                    href="/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Politique de Confidentialité
                  </a>
                  . Je reconnais avoir pris connaissance des{" "}
                  <a
                    href="/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    avertissements médicaux
                  </a>
                  .
                </Label>
              </div>

              <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
                {loading
                  ? isPostPayment
                    ? "Finalisation..."
                    : "Création..."
                  : isPostPayment
                    ? "Activer mon programme"
                    : "Créer mon compte"}
              </Button>
            </form>

            {!isPostPayment && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Déjà un compte ?{" "}
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
