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
            "aspect-square rounded-xl border bg-card",
            "shadow-sm hover:shadow-md",
            "transition-all duration-300",
            "hover:scale-105 active:scale-95",
            "flex flex-col items-center justify-center p-4"
          )}
        >
          {/* Badge optionnel */}
          {badge && (
            <Badge
              variant="default"
              className="absolute top-2 right-2 text-xs px-2 py-0.5"
            >
              {badge}
            </Badge>
          )}

          {/* Icône avec fond coloré */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: `hsl(${iconColor})` }}
          >
            <Icon className="w-9 h-9 text-white" />
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
