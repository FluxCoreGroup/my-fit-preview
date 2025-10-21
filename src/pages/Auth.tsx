import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";

const loginSchema = z.object({
  email: z.string().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});


const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, resetPassword } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/hub");
    }
  }, [user, navigate]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Reset password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse({ email: loginEmail, password: loginPassword });
      const { error } = await signIn(validatedData.email, validatedData.password);
      
      if (!error) {
        // Gérer la redirection post-auth
        const redirectPath = localStorage.getItem("redirectAfterAuth") || "/hub";
        localStorage.removeItem("redirectAfterAuth");
        navigate(redirectPath);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("Validation error:", err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await resetPassword(resetEmail);
    setLoading(false);
    setShowResetPassword(false);
  };

  return (
    <>
      <Header variant="onboarding" />
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8 pt-24">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Pulse.ai</h1>
            <p className="text-muted-foreground">Ton coach fitness personnalisé</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {!showResetPassword ? (
                <>
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ton@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setShowResetPassword(true)}
                  >
                    Mot de passe oublié ?
                  </Button>

                  <p className="text-sm text-center text-muted-foreground pt-4 border-t">
                    Pas encore de compte ?{" "}
                    <Link to="/start" className="font-semibold text-primary hover:underline">
                      Commence le questionnaire
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="ton@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetPassword(false)}
                      className="w-full"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={handleResetPassword}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Envoi..." : "Réinitialiser"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
