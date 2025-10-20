import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  variant?: "primary" | "secondary" | "outline";
}

export const DashboardCard = ({
  title,
  description,
  icon: Icon,
  to,
  variant = "outline",
}: DashboardCardProps) => {
  const variantClasses = {
    primary: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30",
    secondary: "bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30",
    outline: "bg-card/50 border-white/10",
  };

  return (
    <Link to={to}>
      <Card
        className={`p-6 ${variantClasses[variant]} backdrop-blur-xl rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
