import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartyPopper, CheckCircle, Sparkles, Dumbbell, Apple, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate(`/signup?payment_success=true${sessionId ? `&session_id=${sessionId}` : ""}`); return; }
    const countdownInterval = setInterval(() => { setCountdown((prev) => { if (prev <= 1) { clearInterval(countdownInterval); return 0; } return prev - 1; }); }, 1000);
    const redirectTimer = setTimeout(() => navigate("/hub?subscription=success"), 5000);
    return () => { clearInterval(countdownInterval); clearTimeout(redirectTimer); };
  }, [navigate, user, authLoading, sessionId]);

  const handleStartNow = () => {
    if (!user) navigate(`/signup?payment_success=true${sessionId ? `&session_id=${sessionId}` : ""}`);
    else navigate("/hub?subscription=success");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-8 border-primary/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <PartyPopper className="w-20 h-20 text-primary animate-pulse" />
            <Sparkles className="w-8 h-8 text-secondary absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">{t("hub.premiumWelcome")} 🎉</h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-muted-foreground">{t("paymentSuccess.description")}</p>
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"><Dumbbell className="w-5 h-5 text-primary flex-shrink-0" /><span className="text-sm">{t("hub.myTraining")}</span></div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"><Apple className="w-5 h-5 text-primary flex-shrink-0" /><span className="text-sm">{t("hub.myNutrition")}</span></div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"><TrendingUp className="w-5 h-5 text-primary flex-shrink-0" /><span className="text-sm">{t("hub.coachSport")} & {t("hub.nutritionist")}</span></div>
        </div>
        {user && countdown > 0 && <p className="text-center text-sm text-muted-foreground mb-4">{countdown}s...</p>}
        <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" onClick={handleStartNow}>
          {user ? t("paymentSuccess.goToHub") : t("auth:signup.title", { defaultValue: "Create account" })}
        </Button>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
