import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, ArrowLeft, LogOut, Settings, Menu, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant?: "marketing" | "onboarding" | "app";
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  hideAuthButton?: boolean;
  disableNavigation?: boolean;
  onNext?: () => void;
}

export const Header = ({ variant = "marketing", showBack = false, backLabel = "Retour", onBack, hideAuthButton = false, disableNavigation = false, onNext }: HeaderProps) => {
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
                <Button 
                  size="icon" 
                  onClick={() => {
                    // Si callback onNext fourni (ex: /start), l'utiliser
                    if (onNext) {
                      onNext();
                      return;
                    }
                    
                    // Sinon, vérifier si données onboarding complètes
                    const dataStr = localStorage.getItem("onboardingData");
                    if (!dataStr) {
                      navigate("/start");
                      return;
                    }
                    
                    try {
                      const data = JSON.parse(dataStr);
                      // Vérifier les champs requis pour /preview
                      const isComplete = !!(
                        data.birthDate &&
                        data.sex &&
                        data.height &&
                        data.weight &&
                        data.goal && data.goal.length > 0 &&
                        data.goalHorizon &&
                        data.activityLevel &&
                        data.frequency &&
                        data.sessionDuration &&
                        data.location
                      );
                      navigate(isComplete ? "/preview" : "/start");
                    } catch {
                      navigate("/start");
                    }
                  }}
                  className="w-10 h-10 rounded-full gradient-hero text-primary-foreground shadow-glow hover:opacity-90 transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }

  // Header Marketing (pour landing) - Simplifié et transparent
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled 
        ? "bg-background/90 backdrop-blur-lg border-b shadow-sm" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative">
        {/* Logo gauche */}
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className={cn(
            "w-7 h-7 transition-colors duration-300",
            scrolled ? "text-primary" : "text-primary-foreground"
          )} />
        </Link>
        
        {/* Titre centré */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className={cn(
            "text-xl font-bold transition-colors duration-300",
            scrolled ? "text-foreground" : "text-primary-foreground"
          )}>
            Pulse.ai
          </span>
        </div>
        
        {/* Bouton connexion droite */}
        <div className="flex items-center">
          {user ? (
            <Link to="/hub">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "transition-all duration-300",
                  scrolled 
                    ? "" 
                    : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "transition-all duration-300",
                  scrolled 
                    ? "" 
                    : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                Connexion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
