import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "primary" | "secondary" | "accent" | "default";
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KPICardProps) => {
  const variantClasses = {
    primary: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30",
    secondary: "bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30",
    accent: "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30",
    default: "bg-card/50 border-white/10",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn(
      "p-4 backdrop-blur-xl transition-all duration-300 hover:scale-105",
      variantClasses[variant]
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {trend && (
          <TrendIcon className={cn(
            "w-4 h-4",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-muted-foreground"
          )} />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};
