import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const emailProviders = [
  { name: 'Gmail', url: 'https://mail.google.com', color: 'bg-red-500 hover:bg-red-600' },
  { name: 'Outlook', url: 'https://outlook.live.com', color: 'bg-blue-500 hover:bg-blue-600' },
  { name: 'Yahoo Mail', url: 'https://mail.yahoo.com', color: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'iCloud Mail', url: 'https://www.icloud.com/mail', color: 'bg-slate-700 hover:bg-slate-800' },
  { name: 'ProtonMail', url: 'https://mail.protonmail.com', color: 'bg-purple-700 hover:bg-purple-800' },
];

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const { resendConfirmationEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/signup');
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    setIsResending(true);
    await resendConfirmationEmail(email);
    setIsResending(false);
  };

  const handleContinue = () => {
    localStorage.removeItem('pendingEmail');
    navigate('/');
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
            <CardTitle className="text-2xl">Vérifie ton email !</CardTitle>
            <CardDescription className="text-base">
              Nous avons envoyé un email de confirmation à :<br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Clique sur le lien dans l'email pour activer ton compte.
            </p>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Astuce</strong> : Si tu cliques sur le lien depuis un autre appareil (téléphone), 
                tu devras te reconnecter manuellement sur cet appareil avec ton email et mot de passe.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Accès rapide à ton email :
              </p>
              {emailProviders.map((provider) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {provider.name}
                  </a>
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? 'Envoi...' : 'Renvoyer l\'email de confirmation'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                localStorage.removeItem('pendingEmail');
                navigate('/auth');
              }}
            >
              J'ai déjà confirmé, me connecter
            </Button>

            <Button
              variant="link"
              className="w-full"
              onClick={handleContinue}
            >
              Ou continuer sans confirmer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
