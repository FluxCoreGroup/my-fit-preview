import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface CoachWelcomeProps {
  name: string;
  avatar: string;
  role: string;
  description: string;
  shortcuts: string[];
  onShortcutClick: (shortcut: string) => void;
  primaryColor: string;
}

const CoachWelcome = ({
  name,
  avatar,
  role,
  description,
  shortcuts,
  onShortcutClick,
  primaryColor,
}: CoachWelcomeProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Coach Avatar with glow effect */}
      <div className="relative mb-6">
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: `hsl(var(--${primaryColor}))` }}
        />
        <img
          src={avatar}
          alt={name}
          className="relative w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-xl"
        />
        <span 
          className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background"
          title="En ligne"
        />
      </div>

      {/* Welcome message */}
      <div className="text-center max-w-md mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Salut, je suis {name} 👋
        </h2>
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {role}
        </p>
        <p className="text-muted-foreground mt-3">
          {description}
        </p>
      </div>

      {/* Shortcuts */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Commencez par une de ces questions
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {shortcuts.map((shortcut, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onShortcutClick(shortcut)}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
            >
              {shortcut}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachWelcome;
