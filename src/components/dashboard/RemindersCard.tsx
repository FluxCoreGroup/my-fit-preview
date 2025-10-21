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
    <Card className="p-4 bg-card border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/5 rounded-lg shrink-0">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Rappels
          </p>
          <div className="space-y-2">
            {reminders.map((reminder, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <reminder.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">{reminder.label}</span>
                </div>
                <span className={cn(
                  "text-xs",
                  reminder.urgent ? "text-red-500 font-medium" : "text-muted-foreground"
                )}>
                  {reminder.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
