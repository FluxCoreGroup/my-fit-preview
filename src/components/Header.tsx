import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, ArrowLeft, LogOut, Settings, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  variant?: "marketing" | "onboarding" | "app";
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  hideAuthButton?: boolean;
  disableNavigation?: boolean;
}

export const Header = ({ variant = "marketing", showBack = false, backLabel = "Retour", onBack, hideAuthButton = false, disableNavigation = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Header App (pour dashboard, session, etc.)
  if (variant === "app") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/hub" className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="hidden sm:inline">Pulse.ai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/training" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Entraînements
            </Link>
            <Link to="/nutrition" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Nutrition
            </Link>
            <Link to="/settings/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    Pulse.ai
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/hub" 
                    onClick={closeMobileMenu}
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/training" 
                    onClick={closeMobileMenu}
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                  >
                    Entraînements
                  </Link>
                  <Link 
                    to="/nutrition" 
                    onClick={closeMobileMenu}
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                  >
                    Nutrition
                  </Link>
                  <Link 
                    to="/settings/support" 
                    onClick={closeMobileMenu}
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                  >
                    Support
                  </Link>
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <Link 
                      to="/settings" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors py-2"
                    >
                      <Settings className="w-5 h-5" />
                      Paramètres
                    </Link>
                    <button 
                      onClick={() => { closeMobileMenu(); signOut(); }}
                      className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors py-2 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
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
          {disableNavigation ? (
            <div className="flex items-center gap-2 font-bold text-xl">
              <Dumbbell className="w-6 h-6 text-primary" />
              <span className="hidden sm:inline">Pulse.ai</span>
            </div>
          ) : showBack ? (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          ) : (
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Dumbbell className="w-6 h-6 text-primary" />
              <span className="hidden sm:inline">Pulse.ai</span>
            </Link>
          )}

          {!hideAuthButton && !disableNavigation && (
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/hub">
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
          )}
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
          <a href="#comment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Comment ?
          </a>
          <a href="#pourquoi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pourquoi ?
          </a>
          <a href="#coachs-ia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Coach IA
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Prix
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/hub">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
          )}

          {/* Mobile menu for marketing */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Pulse.ai
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <a 
                  href="#comment" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    setTimeout(() => {
                      document.getElementById('comment')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                >
                  Comment ?
                </a>
                <a 
                  href="#pourquoi" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    setTimeout(() => {
                      document.getElementById('pourquoi')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                >
                  Pourquoi ?
                </a>
                <a 
                  href="#coachs-ia" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    setTimeout(() => {
                      document.getElementById('coachs-ia')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                >
                  Coach IA
                </a>
                <a 
                  href="#features" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                >
                  Prix
                </a>
                <a 
                  href="#faq" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    setTimeout(() => {
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                >
                  FAQ
                </a>
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <Link to="/hub" onClick={closeMobileMenu}>
                      <Button className="w-full">Dashboard</Button>
                    </Link>
                  ) : (
                    <Link to="/auth" onClick={closeMobileMenu}>
                      <Button className="w-full">Connexion</Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
