import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataConsentMessageProps {
  onAccept: () => void;
  onDecline: () => void;
  isLoading: boolean;
  coachAvatar: string;
  coachName: string;
}

const DataConsentMessage = ({ onAccept, onDecline, isLoading, coachAvatar, coachName }: DataConsentMessageProps) => {
  const { t } = useTranslation("coach");

  return (
    <div className="flex gap-3 animate-fade-in">
      <img src={coachAvatar} alt={coachName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      <Card className="p-4 bg-muted/50 border-primary/20 max-w-[85%]">
        <div className="flex items-start gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">{t("consent.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("consent.description")}</p>
          </div>
        </div>

        <ul className="text-sm space-y-1.5 ml-7 mb-4 text-muted-foreground">
          <li className="flex items-center gap-2"><span>📊</span> {t("consent.weightHistory")}</li>
          <li className="flex items-center gap-2"><span>💪</span> {t("consent.trainingSessions")}</li>
          <li className="flex items-center gap-2"><span>🎯</span> {t("consent.goalsSettings")}</li>
          <li className="flex items-center gap-2"><span>📈</span> {t("consent.weeklyCheckins")}</li>
        </ul>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={onAccept} disabled={isLoading} size="sm" className="gap-1">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t("consent.authorize")}
          </Button>
          <Button variant="outline" onClick={onDecline} disabled={isLoading} size="sm" className="gap-1">
            <X className="w-4 h-4" />
            {t("consent.decline")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DataConsentMessage;
