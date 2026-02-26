import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Dumbbell, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export default function EmailVerified() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
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
          <p className="text-muted-foreground">{t("emailVerified.verifying")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-glow p-8 md:p-10 animate-in space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="bg-primary/10 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-primary" strokeWidth={2.5} />
              </div>
            </div>
            <Badge className="gradient-accent text-white px-4 py-1 text-sm font-medium">{t("emailVerified.accountVerified")}</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-in">{t("emailVerified.welcome")}</h1>
              <p className="text-muted-foreground text-lg">{t("emailVerified.emailConfirmed")}</p>
            </div>
          </div>

          <div className="space-y-4 py-6 border-t border-border">
            <h3 className="text-lg font-semibold text-center mb-4">{t("emailVerified.whatAwaits")}</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Dumbbell className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t("emailVerified.personalizedProgram")}</p>
                  <p className="text-xs text-muted-foreground">{t("emailVerified.personalizedProgramDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-accent/10 text-accent"><TrendingUp className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t("emailVerified.progressTracking")}</p>
                  <p className="text-xs text-muted-foreground">{t("emailVerified.progressTrackingDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary"><Target className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t("emailVerified.smartCoaching")}</p>
                  <p className="text-xs text-muted-foreground">{t("emailVerified.smartCoachingDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="hero" size="lg" onClick={() => navigate('/onboarding-intro')} className="w-full text-lg group hover:shadow-glow transition-all">
              {t("emailVerified.createProgram")}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
