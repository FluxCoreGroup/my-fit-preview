import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicStats } from "@/hooks/usePublicStats";
import { Star, ShieldCheck, Clock, Sparkles, MapPin, Bot } from "lucide-react";

const MINIMUM_USERS_FOR_STATS = 50;

export const SocialProofStats = () => {
  const { data: stats } = usePublicStats();

  // Phase 1: Pre-launch - Show trust badges instead of fake stats
  const showRealStats = stats && stats.total_users >= MINIMUM_USERS_FOR_STATS;

  // Phase 2+: Real stats
  if (showRealStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
        <div>
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {stats.total_users.toLocaleString('fr-FR')}+
          </div>
          <div className="text-muted-foreground">Membres actifs</div>
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {stats.average_rating?.toFixed(1) || '4.5'}/5
          </div>
          <div className="text-muted-foreground flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            Note moyenne
          </div>
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {stats.completed_sessions.toLocaleString('fr-FR')}
          </div>
          <div className="text-muted-foreground">Séances complétées</div>
        </div>
      </div>
    );
  }

  // Phase 1: Trust badges & product metrics
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-1">2 min</div>
          <div className="text-muted-foreground text-sm">Pour ton plan personnalisé</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-secondary" />
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-1">30 jours</div>
          <div className="text-muted-foreground text-sm">Satisfait ou remboursé</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <Bot className="w-7 h-7 text-accent" />
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-1">24/7</div>
          <div className="text-muted-foreground text-sm">Coach IA disponible</div>
        </div>
      </div>
    </div>
  );
};

// Hero social proof badge for Phase 1
export const HeroSocialProof = () => {
  const { data: stats } = usePublicStats();
  
  const showRealStats = stats && stats.total_users >= MINIMUM_USERS_FOR_STATS;

  // Phase 2+: Real stats (smooth transition once data loads)
  if (showRealStats && stats.average_rating) {
    return (
      <div className="flex items-center justify-center gap-2 text-primary-foreground/90 py-2">
        <Star className="w-5 h-5 fill-accent text-accent" />
        <span className="text-base md:text-lg font-semibold">
          {stats.average_rating.toFixed(1)}/5 sur {stats.total_users.toLocaleString('fr-FR')} membres
        </span>
      </div>
    );
  }

  // Phase 1: Trust-oriented message
  return (
    <div className="flex items-center justify-center gap-3 text-primary-foreground/90 py-2 flex-wrap">
      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
        <Sparkles className="w-3 h-3 mr-1" />
        Nouveau
      </Badge>
      <span className="text-base md:text-lg font-medium">
        Résultats visibles en 4 semaines, garantis
      </span>
    </div>
  );
};
