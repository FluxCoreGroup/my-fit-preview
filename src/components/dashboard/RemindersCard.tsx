import { Card } from "@/components/ui/card";
import { Bell, Scale, Droplet, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemindersCardProps {
  nextCheckIn: string;
}

export const RemindersCard = ({ nextCheckIn }: RemindersCardProps) => {
  const reminders = [
    {
      icon: Bell,
      label: "Check-in hebdo",
      value: nextCheckIn,
      urgent: nextCheckIn === "Maintenant !",
    },
    {
      icon: Scale,
      label: "Pesée",
      value: "Aujourd'hui",
      urgent: false,
    },
    {
      icon: Droplet,
      label: "Hydratation",
      value: "2-3L/jour",
      urgent: false,
    },
    {
      icon: Footprints,
      label: "Pas quotidien",
      value: "8-10k pas",
      urgent: false,
    },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <h3 className="text-lg font-bold mb-4">Rappels</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reminders.map((reminder, idx) => (
          <div
            key={idx}
            className={cn(
              "p-3 rounded-lg border transition-all",
              reminder.urgent
                ? "bg-accent/10 border-accent/30"
                : "bg-background/50 border-white/10"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <reminder.icon className={cn(
                "w-4 h-4",
                reminder.urgent ? "text-accent" : "text-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">{reminder.label}</span>
            </div>
            <p className={cn(
              "text-sm font-semibold",
              reminder.urgent && "text-accent"
            )}>
              {reminder.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
