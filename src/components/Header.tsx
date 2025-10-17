import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell } from "lucide-react";

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Dumbbell className="w-6 h-6 text-primary" />
          <span>Pulse.ai</span>
        </Link>

        {/* Navigation */}
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

        {/* CTA */}
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
