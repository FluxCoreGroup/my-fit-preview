import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Clock, Dumbbell, CheckCircle2, CalendarClock, MessageSquare } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { SessionDetailsDrawer } from "./SessionDetailsDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { getDateLocale } from "@/lib/dateLocale";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  rpe: number;
  rir: number;
  tips?: string[];
  commonMistakes?: string[];
}

interface SessionData {
  sessionName?: string;
  warmup?: string[];
  exercises?: Exercise[];
  checklist?: string[];
  coachNotes?: string;
  estimatedTime?: number;
}

interface SessionPreviewCardProps {
  session: {
    id: string;
    session_date: string;
    exercises: SessionData;
    completed: boolean;
    partially_completed?: boolean;
  };
  sessionNumber: number;
  onStartSession: () => void;
  onSessionUpdated?: () => void;
}

export const SessionPreviewCard = ({ session, sessionNumber, onStartSession, onSessionUpdated }: SessionPreviewCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation("training");
  const [showDetails, setShowDetails] = useState(false);
  const [isPostponing, setIsPostponing] = useState(false);

  const locale = getDateLocale(i18n.language);
  const sessionData = session.exercises || {};
  const exercises = Array.isArray(sessionData.exercises) ? sessionData.exercises : [];
  const warmup = sessionData.warmup || [];
  const checklist = sessionData.checklist || [];
  const coachNotes = sessionData.coachNotes || '';
  const estimatedTime = sessionData.estimatedTime || exercises.length * 5;
  const sessionName = sessionData.sessionName || t("session.defaultName");

  const sessionDate = session.session_date
    ? format(new Date(session.session_date), "EEEE dd MMM", { locale })
    : null;

  const coachNotePreview = coachNotes
    ? coachNotes.length > 90 ? coachNotes.substring(0, 87) + "..." : coachNotes
    : null;

  const handlePostpone = async () => {
    if (!user) return;
    setIsPostponing(true);
    try {
      const newDate = new Date(session.session_date);
      newDate.setDate(newDate.getDate() + 1);
      const { error } = await supabase.from("sessions").update({ session_date: newDate.toISOString() }).eq("id", session.id).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: t("session.postponed"), description: t("session.postponedTo", { date: format(newDate, "EEEE dd MMM", { locale }) }) });
      onSessionUpdated?.();
    } catch {
      toast({ title: t("session.error"), description: t("session.postponeError"), variant: "destructive" });
    } finally {
      setIsPostponing(false);
    }
  };

  return (
    <>
      <Card className="p-5 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 rounded-full text-primary">
              {t("session.sessionLabel", { number: sessionNumber })}
            </span>
            {session.completed ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {session.partially_completed ? t("session.partial") : t("session.completed")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {t("session.toDo")}
              </Badge>
            )}
          </div>
          {sessionDate && <span className="text-xs text-muted-foreground capitalize">{sessionDate}</span>}
        </div>

        <h3 className="text-lg font-bold mb-1">{sessionName}</h3>

        {coachNotePreview && (
          <div className="flex items-start gap-1.5 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground italic leading-relaxed">{coachNotePreview}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />~{estimatedTime}min</span>
          <span className="flex items-center gap-1"><Dumbbell className="w-4 h-4" />{t("session.exerciseCount", { count: exercises.length })}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!session.completed && (
            <Button size="sm" onClick={onStartSession} className="flex-1 bg-gradient-to-r from-primary to-secondary">
              <Play className="w-4 h-4 mr-2" />{t("session.start")}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className={session.completed ? "flex-1" : ""}>
            <Eye className="w-4 h-4 mr-2" />{t("session.details")}
          </Button>
          {!session.completed && (
            <Button variant="ghost" size="sm" onClick={handlePostpone} disabled={isPostponing} className="text-muted-foreground hover:text-foreground">
              <CalendarClock className="w-4 h-4 mr-1" />{isPostponing ? "..." : t("session.postpone")}
            </Button>
          )}
        </div>
      </Card>

      <SessionDetailsDrawer
        open={showDetails}
        onOpenChange={setShowDetails}
        sessionName={sessionName}
        estimatedTime={estimatedTime}
        warmup={warmup}
        exercises={exercises}
        checklist={checklist}
        coachNotes={coachNotes}
      />
    </>
  );
};
