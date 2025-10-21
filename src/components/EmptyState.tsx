import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    to: string;
  };
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <Card className="p-8 text-center bg-card/50 backdrop-blur-xl border-white/10">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          <Button asChild className="mt-2">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        )}
      </div>
    </Card>
  );
};
