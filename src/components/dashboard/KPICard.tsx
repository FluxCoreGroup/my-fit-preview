import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line } from "recharts";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "primary" | "secondary" | "accent" | "default";
  sparklineData?: Array<{ value: number }>;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  sparklineData,
}: KPICardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className="p-3 bg-card border-border/50">
      <div className="flex items-start justify-between mb-2">
        <div className="p-1.5 bg-primary/5 rounded-md">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        {trend && (
          <TrendIcon className={cn(
            "w-3.5 h-3.5",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-muted-foreground"
          )} />
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{title}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-xl font-bold">{value}</p>
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-6 w-12 -mb-0.5">
              <LineChart width={48} height={24} data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};
