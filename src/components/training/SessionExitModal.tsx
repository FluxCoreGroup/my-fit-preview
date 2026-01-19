import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RotateCcw, CheckCircle, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionExitModalProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  onEndEarly: (reason: string, details?: string) => void;
}

const exitReasons = [
  { value: "time", label: "Manque de temps" },
  { value: "fatigue", label: "Fatigue ou douleur" },
  { value: "difficulty", label: "Séance trop difficile" },
  { value: "technical", label: "Problème technique" },
  { value: "interruption", label: "Interruption externe" },
  { value: "other", label: "Autre" }
];

export const SessionExitModal = ({
  open,
  onClose,
  onRestart,
  onEndEarly
}: SessionExitModalProps) => {
  const [step, setStep] = useState<"choice" | "reason">("choice");
  const [selectedReason, setSelectedReason] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const handleRestart = () => {
    onRestart();
    resetState();
  };

  const handleEndEarly = () => {
    setStep("reason");
  };

  const handleConfirmEnd = () => {
    const details = selectedReason === "other" ? otherDetails : undefined;
    onEndEarly(selectedReason, details);
    resetState();
  };

  const handleBack = () => {
    setStep("choice");
    setSelectedReason("");
    setOtherDetails("");
  };

  const resetState = () => {
    setStep("choice");
    setSelectedReason("");
    setOtherDetails("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border-border/20">
        {step === "choice" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl">Quitter la séance ?</DialogTitle>
              <DialogDescription>
                Que souhaites-tu faire ?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {/* Continue */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 px-4 border-2 border-primary bg-primary/5 hover:bg-primary/10 group"
                onClick={handleClose}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Continuer la séance</p>
                  <p className="text-xs text-muted-foreground">Reprendre là où tu en étais</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </Button>

              {/* Restart */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 px-4 border-border/50 hover:border-secondary/50 hover:bg-secondary/5 group"
                onClick={handleRestart}
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <RotateCcw className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Recommencer depuis le début</p>
                  <p className="text-xs text-muted-foreground">La séance sera réinitialisée</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </Button>

              {/* End Early */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 px-4 border-border/50 hover:border-orange-500/50 hover:bg-orange-500/5 group"
                onClick={handleEndEarly}
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Terminer et sauvegarder</p>
                  <p className="text-xs text-muted-foreground">Enregistrer ta progression actuelle</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <DialogTitle className="text-xl">Pourquoi terminer ?</DialogTitle>
              </div>
              <DialogDescription>
                Aide-nous à mieux comprendre pour améliorer tes séances
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="space-y-2"
              >
                {exitReasons.map((reason) => (
                  <div
                    key={reason.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      selectedReason === reason.value
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border hover:bg-muted/30"
                    )}
                    onClick={() => setSelectedReason(reason.value)}
                  >
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="flex-1 cursor-pointer font-medium">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedReason === "other" && (
                <Textarea
                  placeholder="Précise la raison..."
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  rows={3}
                  className="resize-none bg-muted/30 border-border/50 focus:border-primary"
                />
              )}

              <Button
                onClick={handleConfirmEnd}
                disabled={!selectedReason || (selectedReason === "other" && !otherDetails.trim())}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl py-5"
                size="lg"
              >
                Valider et terminer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
