import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Eye,
  Clock, 
  Dumbbell,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { SessionDetailsDrawer } from "./SessionDetailsDrawer";

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
  };
  sessionNumber: number;
  onStartSession: () => void;
}

export const SessionPreviewCard = ({ 
  session, 
  sessionNumber,
  onStartSession 
}: SessionPreviewCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const sessionData = session.exercises || {};
  const exercises = Array.isArray(sessionData.exercises) ? sessionData.exercises : [];
  const warmup = sessionData.warmup || [];
  const checklist = sessionData.checklist || [];
  const coachNotes = sessionData.coachNotes || '';
  const estimatedTime = sessionData.estimatedTime || exercises.length * 5;
  const sessionName = sessionData.sessionName || 'Entraînement';

  return (
    <>
      <Card className="p-5 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all duration-300">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 rounded-full text-primary">
              SÉANCE {sessionNumber}
            </span>
            {session.completed ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Terminée
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                À faire
              </Badge>
            )}
          </div>
        </div>

        {/* Session Name */}
        <h3 className="text-lg font-bold mb-1">{sessionName}</h3>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            ~{estimatedTime}min
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            {exercises.length} exercices
          </span>
        </div>

        {/* Actions - Side by Side */}
        <div className="flex gap-2">
          {!session.completed && (
            <Button 
              size="sm" 
              onClick={onStartSession}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              <Play className="w-4 h-4 mr-2" />
              Lancer
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(true)}
            className={session.completed ? "flex-1" : ""}
          >
            <Eye className="w-4 h-4 mr-2" />
            Détails
          </Button>
        </div>
      </Card>

      {/* Session Details Drawer */}
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
