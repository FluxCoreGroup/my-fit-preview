import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const emailProviders = [
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'Outlook', url: 'https://outlook.live.com' },
  { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' },
  { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
  { name: 'ProtonMail', url: 'https://mail.protonmail.com' },
];

export default function EmailConfirmation() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { resendConfirmationEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) { navigate('/signup'); return; }
    setEmail(pendingEmail);
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    setIsResending(true);
    await resendConfirmationEmail(email);
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t("emailConfirmation.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("emailConfirmation.sentTo")}<br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
            <p className="text-sm text-muted-foreground">{t("emailConfirmation.clickLink")}</p>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>{t("emailConfirmation.tip")}</strong> : {t("emailConfirmation.tipText")}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">{t("emailConfirmation.quickAccess")}</p>
              {emailProviders.map((provider) => (
                <Button key={provider.name} variant="outline" className="w-full justify-start" asChild>
                  <a href={provider.url} target="_blank" rel="noopener noreferrer">{provider.name}</a>
                </Button>
              ))}
            </div>

            <Button variant="ghost" className="w-full" onClick={handleResendEmail} disabled={isResending}>
              {isResending ? t("emailConfirmation.resending") : t("emailConfirmation.resend")}
            </Button>

            <Button variant="outline" className="w-full" onClick={() => { localStorage.removeItem('pendingEmail'); navigate('/auth'); }}>
              {t("emailConfirmation.alreadyConfirmed")}
            </Button>

            <Button variant="link" className="w-full" onClick={() => { localStorage.removeItem('pendingEmail'); navigate('/'); }}>
              {t("emailConfirmation.continueWithout")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
