import { Home, Play, TrendingUp, Settings, Dumbbell, Apple } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Accueil" },
  { path: "/training", icon: Dumbbell, label: "Entraînement" },
  { path: "/nutrition", icon: Apple, label: "Nutrition" },
  { path: "/weekly", icon: TrendingUp, label: "Suivi" },
  { path: "/session", icon: Play, label: "Séance" },
  { path: "/settings", icon: Settings, label: "Réglages" },
];

export const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-white/10 rounded-t-3xl">
      <div className="flex justify-around items-center h-16 max-w-6xl mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center gap-0.5 transition-all min-w-0 flex-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] truncate max-w-full px-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
