import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, ArrowLeft, LogOut, Settings } from "lucide-react";

interface HeaderProps {
  variant?: "marketing" | "onboarding" | "app";
  showBack?: boolean;
  onBack?: () => void;
}

export const Header = ({ variant = "marketing", showBack = false, onBack }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Header App (pour dashboard, session, etc.)
  if (variant === "app") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span>Pulse.ai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/session" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Séances
            </Link>
            <Link to="/weekly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Check-in
            </Link>
            <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/legal">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Header Onboarding (pour start, preview, auth)
  if (variant === "onboarding") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {showBack ? (
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          ) : (
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Dumbbell className="w-6 h-6 text-primary" />
              <span>Pulse.ai</span>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Header Marketing (pour landing)
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Dumbbell className="w-6 h-6 text-primary" />
          <span>Pulse.ai</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/preview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Démo
          </Link>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
          <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/start">
                <Button size="sm">
                  Commencer
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
