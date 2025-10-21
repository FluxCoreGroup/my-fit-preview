import { Card } from "@/components/ui/card";
import { Bell, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

interface RemindersCardProps {
  nextCheckIn: string;
}

export const RemindersCard = ({ nextCheckIn }: RemindersCardProps) => {
  const { user } = useAuth();

  const { data: lastWeighIn } = useQuery({
    queryKey: ["last-weigh-in", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("weekly_checkins")
        .select("average_weight, created_at")
        .eq("user_id", user.id)
        .not("average_weight", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const daysSinceWeighIn = lastWeighIn 
    ? differenceInDays(new Date(), new Date(lastWeighIn.created_at))
    : null;

  const weighInValue = daysSinceWeighIn !== null
    ? daysSinceWeighIn === 0 
      ? "Fait aujourd'hui ✅" 
      : `Il y a ${daysSinceWeighIn}j`
    : "Jamais";

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
      value: weighInValue,
      urgent: daysSinceWeighIn !== null && daysSinceWeighIn > 7,
    },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <h3 className="text-lg font-bold mb-4">Rappels</h3>
      <div className="grid grid-cols-2 gap-3">
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
