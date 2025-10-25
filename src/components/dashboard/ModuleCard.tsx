import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  subtitle?: string;
  to: string;
  iconColor: string; // HSL format: "180 62% 45%"
}

export const ModuleCard = ({
  icon: Icon,
  title,
  badge,
  subtitle,
  to,
  iconColor,
}: ModuleCardProps) => {
  return (
    <Link to={to}>
      <div className="relative group">
        <div
          className={cn(
            "aspect-square rounded-xl border-2 border-blue-100",
            "bg-white/80 backdrop-blur-sm",
            "shadow-sm hover:shadow-xl hover:shadow-blue-200/50",
            "hover:border-blue-300",
            "transition-all duration-300",
            "hover:scale-105 active:scale-95",
            "flex flex-col items-center justify-center p-4"
          )}
        >
          {/* Badge optionnel */}
          {badge && (
            <Badge
              className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-blue-600 text-white border-blue-400"
            >
              {badge}
            </Badge>
          )}

          {/* Icône avec fond semi-transparent et glow */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-blue-500/5 backdrop-blur-sm group-hover:bg-blue-500/10 transition-colors"
            style={{ 
              boxShadow: `0 0 20px hsl(${iconColor} / 0.15)` 
            }}
          >
            <Icon 
              className="w-9 h-9 transition-transform group-hover:scale-110" 
              style={{ color: `hsl(${iconColor})` }} 
            />
          </div>

          {/* Titre */}
          <h3 className="text-sm font-semibold text-center text-foreground">
            {title}
          </h3>
          
          {/* Subtitle optionnel */}
          {subtitle && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
