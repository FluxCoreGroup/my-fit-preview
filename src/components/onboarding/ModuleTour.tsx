import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { useOnboarding, ONBOARDING_MODULES } from "@/contexts/OnboardingContext";

interface ModuleTourProps {
  moduleKey: string;
}

export function ModuleTour({ moduleKey }: ModuleTourProps) {
  const navigate = useNavigate();
  const { state, isOnboardingActive, nextModuleStep, nextModule, skipTour, exitModule } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  // Only show if in-module phase and correct module
  const currentModule = ONBOARDING_MODULES[state.currentModuleIndex];
  const shouldShow = isOnboardingActive && state.phase === 'in-module' && currentModule?.key === moduleKey;

  useEffect(() => {
    if (shouldShow) {
      setCurrentStep(state.currentModuleStep);
    }
  }, [shouldShow, state.currentModuleStep]);

  if (!shouldShow || !currentModule) return null;

  const steps = currentModule.steps;
  const step = steps[currentStep];
  const isLastStep = currentStep >= steps.length - 1;
  const isLastModule = state.currentModuleIndex >= ONBOARDING_MODULES.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Go back to hub and move to next module
      nextModule();
      navigate("/hub");
    } else {
      setCurrentStep(prev => prev + 1);
      nextModuleStep();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReturnToHub = () => {
    nextModule();
    navigate("/hub");
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto" />
      
      {/* Tour Card */}
      <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md pointer-events-auto">
        <Card className="p-5 bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/20 animate-fade-in">
          {/* Skip button */}
          <button 
            onClick={skipTour}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                {currentModule.name} - Étape {currentStep + 1}/{steps.length}
              </span>
              <span className="text-xs text-muted-foreground">
                Module {state.currentModuleIndex + 1}/{ONBOARDING_MODULES.length}
              </span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1.5" />
          </div>

          {/* Content */}
          <div className="mb-5">
            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}
            
            <Button 
              onClick={handleNext} 
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              {isLastStep ? (
                <>
                  {isLastModule ? "Terminer le tour" : "Module suivant"}
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

          {/* Quick return option */}
          {!isLastStep && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReturnToHub}
              className="w-full mt-2 text-xs text-muted-foreground"
            >
              J'ai compris, passer au module suivant
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
