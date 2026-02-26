import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Target, Clock, Settings, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const OnboardingIntro = () => {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();

  const features = [
    { icon: Target, title: t("intro.goalTitle"), description: t("intro.goalDesc") },
    { icon: Clock, title: t("intro.availabilityTitle"), description: t("intro.availabilityDesc") },
    { icon: Settings, title: t("intro.preferencesTitle"), description: t("intro.preferencesDesc") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4 py-8">
      <Card className="max-w-lg w-full p-8 md:p-12 border-primary/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Sparkles className="w-16 h-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">{t("intro.welcome")}</h1>
        <p className="text-center text-muted-foreground mb-8">{t("intro.subtitle")}</p>
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <feature.icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-8">
          <p className="text-sm text-center">
            ⏱️ <span className="font-semibold">{t("intro.timeInfo")}</span> {t("intro.timeInfoSuffix")}
          </p>
        </div>
        <div className="flex justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" onClick={() => navigate('/training-setup')}>
            {t("intro.continue")}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingIntro;
