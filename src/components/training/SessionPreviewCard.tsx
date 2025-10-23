import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Timer
} from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  rpe: number;
  rir: number;
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
  const [isOpen, setIsOpen] = useState(false);
  
  const sessionData = session.exercises || {};
  const exercises = Array.isArray(sessionData.exercises) ? sessionData.exercises : [];
  const warmup = sessionData.warmup || [];
  const checklist = sessionData.checklist || [];
  const coachNotes = sessionData.coachNotes || '';
  const estimatedTime = sessionData.estimatedTime || exercises.length * 5;
  const sessionName = sessionData.sessionName || 'Entraînement';

  const getStatusBadge = () => {
    if (session.completed) {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Terminée
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        À faire
      </Badge>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-white/10 hover:border-primary/30 transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 bg-primary/10 rounded-full text-primary">
                SÉANCE {sessionNumber}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="text-xl font-bold mb-1">
              Séance {sessionNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{sessionName}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>~{estimatedTime}min</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{exercises.length} exercices</span>
          </div>
        </div>

        {/* Exercise Preview */}
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Aperçu:</p>
          <p className="line-clamp-1">
            {exercises.slice(0, 3).map(ex => ex.name).join(' • ')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!session.completed && (
            <Button 
              size="sm" 
              onClick={onStartSession}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              <Play className="w-4 h-4 mr-2" />
              Lancer séance
            </Button>
          )}
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Masquer programme
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Voir le programme complet
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            {/* Collapsible Content */}
            <CollapsibleContent className="mt-4 space-y-4">
              {/* Warmup */}
              {warmup.length > 0 && (
                <div className="p-4 bg-card/50 rounded-lg border border-primary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    A. ÉCHAUFFEMENT ({Math.floor(estimatedTime * 0.15)}min)
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {warmup.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Exercises */}
              <div className="p-4 bg-card/50 rounded-lg border border-secondary/10">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-secondary" />
                  B. EXERCICES PRINCIPAUX
                </h4>
                <div className="space-y-3">
                  {exercises.map((exercise, i) => (
                    <div key={i} className="pb-3 border-b border-white/5 last:border-0">
                      <p className="font-medium mb-1">
                        {i + 1}. {exercise.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{exercise.sets}×{exercise.reps}</span>
                        <span>|</span>
                        <span>{exercise.rest}s repos</span>
                        <span>|</span>
                        <span>RPE {exercise.rpe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              {checklist.length > 0 && (
                <div className="p-4 bg-card/50 rounded-lg border border-accent/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    C. CHECKLIST PRÉ-SÉANCE
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">☐</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coach Notes */}
              {coachNotes && (
                <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    D. NOTES DU COACH IA
                  </h4>
                  <p className="text-sm text-muted-foreground">{coachNotes}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Card>
  );
};