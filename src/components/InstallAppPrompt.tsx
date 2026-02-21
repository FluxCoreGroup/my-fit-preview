import { useState, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, Share, MoreVertical, Plus, Smartphone } from "lucide-react";

interface InstallAppPromptProps {
  trigger: "start" | "onboarding-complete";
}

export function InstallAppPrompt({ trigger }: InstallAppPromptProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    isStandalone,
    isIOS,
    isAndroid,
    hasDeferredPrompt,
    triggerInstall,
    isDismissed,
    dismiss,
  } = useInstallPrompt();

  const shouldShow = isMobile && !isStandalone && !isDismissed;

  useEffect(() => {
    if (!shouldShow) return;

    if (trigger === "start") {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }

    if (trigger === "onboarding-complete") {
      const flag = localStorage.getItem("show_install_prompt");
      if (flag) {
        localStorage.removeItem("show_install_prompt");
        const timer = setTimeout(() => setOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [shouldShow, trigger]);

  if (!shouldShow) return null;

  const handleInstall = async () => {
    if (hasDeferredPrompt) {
      await triggerInstall();
    }
    setOpen(false);
  };

  const handleDismiss = () => {
    dismiss();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="px-6 pb-8 pt-2">
        {/* Icon */}
        <div className="flex justify-center mt-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-center">
          Installe Pulse sur ton téléphone
        </h3>
        <p className="text-sm text-muted-foreground text-center mt-1 mb-5">
          Accès rapide, expérience fluide, meilleure immersion.
        </p>

        {/* Instructions */}
        {isIOS && (
          <div className="space-y-3 mb-6">
            <Step
              number={1}
              icon={<Share className="w-4 h-4" />}
              text={"Appuie sur l'icône de partage"}
            />
            <Step
              number={2}
              icon={<Plus className="w-4 h-4" />}
              text={"\"Sur l'écran d'accueil\""}
            />
            <Step
              number={3}
              icon={null}
              text={"Confirme en appuyant sur \"Ajouter\""}
            />
          </div>
        )}

        {isAndroid && !hasDeferredPrompt && (
          <div className="space-y-3 mb-6">
            <Step
              number={1}
              icon={<MoreVertical className="w-4 h-4" />}
              text="Appuie sur le menu ⋮ en haut à droite"
            />
            <Step
              number={2}
              icon={<Download className="w-4 h-4" />}
              text={"\"Ajouter à l'écran d'accueil\""}
            />
            <Step
              number={3}
              icon={null}
              text={"Confirme en appuyant sur \"Ajouter\""}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          {isAndroid && hasDeferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Installer
            </Button>
          ) : (
            <Button onClick={handleClose} className="w-full" size="lg">
              {isIOS ? "J'ai compris" : "OK"}
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Plus tard
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Step({
  number,
  icon,
  text,
}: {
  number: number;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
        {number}
      </span>
      {icon && (
        <span className="flex-shrink-0 text-muted-foreground">{icon}</span>
      )}
      <span className="text-sm">{text}</span>
    </div>
  );
}
