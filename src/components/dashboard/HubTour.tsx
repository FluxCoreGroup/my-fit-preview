import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { useOnboarding, TOUR_STEPS } from "@/contexts/OnboardingContext";

export function HubTour() {
  const { 
    state, 
    isOnboardingActive, 
    nextStep, 
    prevStep, 
    skipTour, 
    completeTour,
    getCurrentStep,
    getTotalSteps,
  } = useOnboarding();

  if (!isOnboardingActive) return null;

  const currentStep = getCurrentStep();
  const totalSteps = getTotalSteps();
  const currentIndex = state.currentStepIndex;
  const isLastStep = currentIndex >= totalSteps - 1;
  const isFirstStep = currentIndex === 0;

  if (!currentStep) return null;

  const handleNext = async () => {
    if (isLastStep) {
      await completeTour();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      prevStep();
    }
  };

  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto transition-all duration-300" />
      
      {/* Tour Card */}
      <div className={`absolute left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md pointer-events-auto transition-all duration-500 ease-in-out ${(currentStep.moduleKey === 'settings' || currentStep.moduleKey === 'laststep') ? "top-4" : 'bottom-4'} ${(currentStep.moduleKey === 'settings' || currentStep.moduleKey === 'laststep' || currentStep.moduleKey === 'julie') ? 'md:top-10' : 'md:bottom-10'}`}>
        <Card className="p-5 bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/20 animate-fade-in">
          {/* Skip button */}
          <button 
            onClick={skipTour}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Étape {currentIndex + 1} sur {totalSteps}
              </span>
            </div>
            <Progress value={((currentIndex + 1) / totalSteps) * 100} className="h-1.5" />
          </div>

          {/* Icon + Content */}
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-all duration-300">
                <Icon className="w-5 h-5 text-primary transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold">{currentStep.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrev} className="flex-1 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}
            
            <Button 
              onClick={handleNext} 
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-secondary transition-all duration-200 hover:scale-105"
            >
              {isLastStep ? (
                <>
                  Terminer
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
