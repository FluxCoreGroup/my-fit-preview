import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

const QUOTES = [
  { text: "La discipline bat le talent quand le talent n'est pas discipliné", author: "Tim Notke" },
  { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte", author: "Winston Churchill" },
  { text: "La différence entre l'impossible et le possible réside dans la détermination", author: "Tommy Lasorda" },
  { text: "Ton seul limite, c'est toi", author: "Pulse.ai" },
  { text: "Chaque expert a d'abord été un débutant", author: "Robin Sharma" },
  { text: "La motivation te fait démarrer, l'habitude te fait continuer", author: "Jim Ryun" },
  { text: "Ne compte pas les jours, fais que les jours comptent", author: "Muhammad Ali" },
  { text: "Les champions sont faits dans le gymnase, pas dans le ring", author: "Joe Frazier" },
  { text: "La seule mauvaise séance, c'est celle que tu n'as pas faite", author: "Pulse.ai" },
  { text: "Ton corps peut tout encaisser, c'est ton mental qu'il faut convaincre", author: "Inconnu" },
];

export const QuoteOfTheDay = () => {
  // Rotation basée sur la date du jour pour que ce soit différent chaque jour
  const quote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <Card className="p-4 bg-primary/5 border-primary/10">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Citation du jour</p>
          <p className="text-sm font-medium leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-muted-foreground">— {quote.author}</p>
        </div>
      </div>
    </Card>
  );
};
