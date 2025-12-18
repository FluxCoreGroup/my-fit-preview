import { LucideIcon, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SpotlightTooltip } from "@/components/onboarding/SpotlightTooltip";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  subtitle?: string;
  to: string;
  iconColor: string; // HSL format: "180 62% 45%"
  locked?: boolean;
  spotlight?: boolean;
  spotlightData?: {
    title: string;
    description: string;
    onAction: () => void;
    onSkip?: () => void;
  };
}

export const ModuleCard = ({
  icon: Icon,
  title,
  badge,
  subtitle,
  to,
  iconColor,
  locked = false,
  spotlight = false,
  spotlightData,
}: ModuleCardProps) => {
  const CardContent = (
    <div className="relative group">
      <div
        className={cn(
          "aspect-square rounded-xl border-2",
          locked 
            ? "border-muted/50 bg-muted/20 cursor-not-allowed" 
            : spotlight
              ? "border-primary/50 bg-primary/5 ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              : "border-blue-100 bg-white/80 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-300 hover:scale-105 active:scale-95",
          "backdrop-blur-sm shadow-sm transition-all duration-300",
          "flex flex-col items-center justify-center p-4",
          spotlight && "animate-pulse"
        )}
      >
        {/* Locked overlay */}
        {locked && (
          <div className="absolute inset-0 rounded-xl bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* Badge optionnel */}
        {badge && !locked && (
          <Badge
            className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-blue-600 text-white border-blue-400"
          >
            {badge}
          </Badge>
        )}

        {/* Icône avec fond semi-transparent et glow */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm transition-colors",
            locked ? "bg-muted/20" : "bg-blue-500/5 group-hover:bg-blue-500/10"
          )}
          style={{ 
            boxShadow: locked ? 'none' : `0 0 20px hsl(${iconColor} / 0.15)` 
          }}
        >
          <Icon 
            className={cn(
              "w-9 h-9 transition-transform",
              locked ? "text-muted-foreground" : "group-hover:scale-110"
            )}
            style={{ color: locked ? undefined : `hsl(${iconColor})` }} 
          />
        </div>

        {/* Titre */}
        <h3 className={cn(
          "text-sm font-semibold text-center",
          locked ? "text-muted-foreground" : "text-foreground"
        )}>
          {title}
        </h3>
        
        {/* Subtitle optionnel */}
        {subtitle && (
          <p className="text-xs text-muted-foreground text-center mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Spotlight tooltip */}
      {spotlight && spotlightData && (
        <SpotlightTooltip
          title={spotlightData.title}
          description={spotlightData.description}
          onAction={spotlightData.onAction}
          actionLabel="Découvrir →"
          onSkip={spotlightData.onSkip}
        />
      )}
    </div>
  );

  // If locked, don't wrap in Link
  if (locked) {
    return CardContent;
  }

  // If spotlight, clicking goes through onAction instead
  if (spotlight && spotlightData) {
    return (
      <div onClick={spotlightData.onAction} className="cursor-pointer">
        {CardContent}
      </div>
    );
  }

  return <Link to={to}>{CardContent}</Link>;
};
