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
import { useTranslation } from "react-i18next";

const Signup = () => {
  const { t } = useTranslation("auth");
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

  const signupSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    acceptedTerms: z.literal(true),
  });

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
      toast({ title: t("login.error"), description: t("signup.paymentError"), variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) { navigate("/hub"); return; }
    if (!isPostPayment) {
      const onboardingData = localStorage.getItem("onboardingData");
      if (!onboardingData) navigate("/start");
    }
  }, [user, navigate, isPostPayment]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validatedData = signupSchema.parse({ name: signupName, email: signupEmail, password: signupPassword, acceptedTerms });
      const { error } = await signUp(validatedData.email, validatedData.password, validatedData.name, isPostPayment);
      if (!error) {
        if (isPostPayment && sessionId) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Session non établie");
            const { error: linkError } = await supabase.functions.invoke("link-stripe-subscription", {
              body: { sessionId },
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (linkError) throw linkError;
            localStorage.removeItem("onboardingData");
            localStorage.removeItem("hasSeenPreview");
            navigate("/onboarding-intro");
          } catch (linkError: any) {
            console.error("Error linking subscription:", linkError);
            navigate("/onboarding-intro");
          }
        } else {
          localStorage.setItem("pendingEmail", validatedData.email);
          navigate("/email-confirmation");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("Validation error:", err.errors[0].message);
        toast({ title: t("signup.validationError"), description: err.errors[0].message, variant: "destructive" });
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
                <p className="font-semibold text-primary">{t("signup.paymentValidated")}</p>
                <p className="text-sm text-muted-foreground">{t("signup.trialActivated")}</p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {isPostPayment ? t("signup.finalizeSignup") : t("signup.createAccount")}
            </h1>
            <p className="text-muted-foreground">
              {isPostPayment ? t("signup.subtitlePostPayment") : t("signup.subtitle")}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">{t("signup.firstName")}</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-name" type="text" placeholder={t("signup.firstNamePlaceholder")} value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">{t("login.email")}</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-email" type="email" placeholder={t("login.emailPlaceholder")} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10" disabled={emailReadonly} required />
                </div>
                {emailReadonly && <p className="text-xs text-muted-foreground mt-1">{t("signup.emailRecovered")}</p>}
              </div>

              <div>
                <Label htmlFor="signup-password">{t("signup.password")}</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className={`text-xs flex items-center gap-1 ${signupPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}>
                    {signupPassword.length >= 8 ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}{t("signup.minChars")}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}`}>
                    {/[A-Z]/.test(signupPassword) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}{t("signup.oneUppercase")}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}`}>
                    {/[0-9]/.test(signupPassword) ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}{t("signup.oneDigit")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked === true)} className="mt-0.5" />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer font-normal">
                  {t("signup.acceptTerms")}{" "}
                  <a href="/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{t("signup.terms")}</a>
                  {" "}{t("signup.and")}{" "}
                  <a href="/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{t("signup.privacy")}</a>
                  . {t("signup.medicalAck")}{" "}
                  <a href="/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{t("signup.medicalWarnings")}</a>.
                </Label>
              </div>

              <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
                {loading
                  ? isPostPayment ? t("signup.finalizingLoading") : t("signup.creatingLoading")
                  : isPostPayment ? t("signup.activateProgram") : t("signup.createAccountBtn")}
              </Button>
            </form>

            {!isPostPayment && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t("signup.alreadyAccount")}{" "}
                <Link to="/auth" className="text-primary hover:underline font-medium">{t("signup.signIn")}</Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
