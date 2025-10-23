import { Card } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { addWeeks, differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";

export const NextCheckInCTA = () => {
  const nextCheckInDate = addWeeks(new Date(), 1);
  const daysUntil = differenceInDays(nextCheckInDate, new Date());

  return (
    <Card className="p-6 bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Prochain check-in</h3>
          <p className="text-sm text-muted-foreground">
            Dans {daysUntil} jour{daysUntil > 1 ? "s" : ""} · {format(nextCheckInDate, "EEEE d MMMM", { locale: fr })}
          </p>
        </div>
        <CalendarClock className="w-8 h-8 text-muted-foreground" />
      </div>
    </Card>
  );
};
