import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Dumbbell, ArrowLeft, LogOut, Settings, Menu, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  variant?: "marketing" | "onboarding" | "app";
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  hideAuthButton?: boolean;
  disableNavigation?: boolean;
  onNext?: () => void;
}

const LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export const Header = ({ variant = "marketing", showBack = false, backLabel, onBack, hideAuthButton = false, disableNavigation = false, onNext }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useAdminRole();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const LanguageSelector = ({ className }: { className?: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="w-4 h-4 mr-1" />
          {i18n.language?.substring(0, 2).toUpperCase() || "FR"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(i18n.language?.startsWith(lang.code) && "font-bold text-primary")}
          >
            {t(`language.${lang.code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Header App
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
              {t("nav.dashboard")}
            </Link>
            <Link to="/training" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.training")}
            </Link>
            <Link to="/nutrition" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.nutrition")}
            </Link>
            <Link to="/settings/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.support")}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("nav.admin")}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelector />
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

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
                  <Link to="/hub" onClick={closeMobileMenu} className="text-lg font-medium hover:text-primary transition-colors py-2">
                    {t("nav.dashboard")}
                  </Link>
                  <Link to="/training" onClick={closeMobileMenu} className="text-lg font-medium hover:text-primary transition-colors py-2">
                    {t("nav.training")}
                  </Link>
                  <Link to="/nutrition" onClick={closeMobileMenu} className="text-lg font-medium hover:text-primary transition-colors py-2">
                    {t("nav.nutrition")}
                  </Link>
                  <Link to="/settings/support" onClick={closeMobileMenu} className="text-lg font-medium hover:text-primary transition-colors py-2">
                    {t("nav.support")}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={closeMobileMenu} className="text-lg font-medium text-primary hover:text-primary/80 transition-colors py-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      {t("nav.admin")}
                    </Link>
                  )}
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <LanguageSelector className="w-full justify-start text-lg" />
                    <Link to="/settings" onClick={closeMobileMenu} className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors py-2">
                      <Settings className="w-5 h-5" />
                      {t("nav.settings")}
                    </Link>
                    <button onClick={() => { closeMobileMenu(); signOut(); }} className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors py-2 w-full text-left">
                      <LogOut className="w-5 h-5" />
                      {t("nav.logout")}
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

  // Header Onboarding
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
              <span className="hidden sm:inline">{backLabel || t("nav.back")}</span>
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
                  <Button size="sm">{t("nav.dashboard")}</Button>
                </Link>
              ) : (
                <Button 
                  size="icon" 
                  onClick={() => {
                    if (onNext) { onNext(); return; }
                    const dataStr = localStorage.getItem("onboardingData");
                    if (!dataStr) { navigate("/start"); return; }
                    try {
                      const data = JSON.parse(dataStr);
                      const isComplete = !!(data.birthDate && data.sex && data.height && data.weight && data.goal && data.goal.length > 0 && data.goalHorizon && data.activityLevel && data.frequency && data.sessionDuration && data.location);
                      navigate(isComplete ? "/preview" : "/start");
                    } catch { navigate("/start"); }
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

  // Header Marketing
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-background/90 backdrop-blur-lg border-b shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className={cn("w-7 h-7 transition-colors duration-300", scrolled ? "text-primary" : "text-primary-foreground")} />
        </Link>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className={cn("text-xl font-bold transition-colors duration-300", scrolled ? "text-foreground" : "text-primary-foreground")}>
            Pulse.ai
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector className={cn(
            "transition-all duration-300",
            scrolled ? "" : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
          )} />
          {user ? (
            <Link to="/hub">
              <Button variant="outline" size="sm" className={cn("transition-all duration-300", scrolled ? "" : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground")}>
                {t("nav.dashboard")}
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className={cn("transition-all duration-300", scrolled ? "" : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10")}>
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
