import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";

interface SpotlightTooltipProps {
  title: string;
  description: string;
  onAction: () => void;
  actionLabel: string;
  onSkip?: () => void;
  position?: "bottom" | "top";
}

export function SpotlightTooltip({
  title,
  description,
  onAction,
  actionLabel,
  onSkip,
  position = "bottom",
}: SpotlightTooltipProps) {
  return (
    <Card className={`
      absolute z-50 w-72 p-4 bg-card/95 backdrop-blur-xl border-primary/30 shadow-xl shadow-primary/20
      animate-fade-in
      ${position === "bottom" ? "top-full mt-3" : "bottom-full mb-3"}
      left-1/2 -translate-x-1/2
    `}>
      {/* Arrow */}
      <div className={`
        absolute w-3 h-3 bg-card border-l border-t border-primary/30 rotate-45
        ${position === "bottom" ? "-top-1.5 left-1/2 -translate-x-1/2" : "-bottom-1.5 left-1/2 -translate-x-1/2 rotate-[225deg]"}
      `} />
      
      {onSkip && (
        <button 
          onClick={onSkip}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <Button 
        onClick={onAction} 
        className="w-full bg-gradient-to-r from-primary to-secondary"
        size="sm"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}
