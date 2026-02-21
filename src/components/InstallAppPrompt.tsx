import { useState, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Download,
  Share,
  MoreVertical,
  Smartphone,
  Copy,
  Compass,
  Chrome,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const APP_URL = "https://www.pulse-ai.app";

interface InstallAppPromptProps {
  trigger: "start" | "onboarding-complete";
}

export function InstallAppPrompt({ trigger }: InstallAppPromptProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

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

  const copyButton = (
    <Button
      size="sm"
      className="mt-2 h-9 text-xs"
      onClick={handleCopyLink}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 mr-1.5" />
      ) : (
        <Copy className="w-3.5 h-3.5 mr-1.5" />
      )}
      {copied ? "Copié !" : "Copier le lien"}
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="px-6 pb-8 pt-2">
        <div className="flex justify-center mt-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-center">
          Installe Pulse sur ton téléphone
        </h3>
        <p className="text-sm text-muted-foreground text-center mt-1 mb-5">
          Accès rapide, expérience fluide, meilleure immersion.
        </p>

        {/* Android with native prompt — simple install button */}
        {isAndroid && hasDeferredPrompt ? (
          <div className="space-y-2">
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Installer
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Plus tard
            </Button>
          </div>
        ) : (
          <>
            {/* iOS tutorial — 3 steps */}
            {isIOS && (
              <div className="space-y-3 mb-6">
                <Step
                  number={1}
                  icon={<Copy className="w-4 h-4" />}
                  text="Copie le lien de la webapp"
                  action={copyButton}
                />
                <Step
                  number={2}
                  icon={<Compass className="w-4 h-4" />}
                  text={<>Ouvre <strong>Safari</strong> et colle le lien dans la barre d'adresse</>}
                />
                <Step
                  number={3}
                  icon={<Share className="w-4 h-4" />}
                  text={<>Appuie sur <strong>Partager</strong> → <strong>Sur l'écran d'accueil</strong> → <strong>Ajouter</strong></>}
                />
              </div>
            )}

            {/* Android without native prompt — 3 steps */}
            {isAndroid && !hasDeferredPrompt && (
              <div className="space-y-3 mb-6">
                <Step
                  number={1}
                  icon={<Copy className="w-4 h-4" />}
                  text="Copie le lien de la webapp"
                  action={copyButton}
                />
                <Step
                  number={2}
                  icon={<Chrome className="w-4 h-4" />}
                  text={<>Ouvre <strong>Chrome</strong> et colle le lien dans la barre d'adresse</>}
                />
                <Step
                  number={3}
                  icon={<MoreVertical className="w-4 h-4" />}
                  text={<><strong>⋮</strong> → <strong>Ajouter à l'écran d'accueil</strong> → Confirmer</>}
                />
              </div>
            )}

            {!isIOS && !isAndroid && (
              <div className="space-y-3 mb-6">
                <Step
                  number={1}
                  icon={<Copy className="w-4 h-4" />}
                  text="Copie le lien de la webapp"
                  action={copyButton}
                />
                <Step
                  number={2}
                  icon={<Compass className="w-4 h-4" />}
                  text={<>Ouvre ton <strong>navigateur</strong> et colle le lien dans la barre d'adresse</>}
                />
                <Step
                  number={3}
                  icon={<Download className="w-4 h-4" />}
                  text={<>Cherche l'option <strong>Ajouter à l'écran d'accueil</strong> dans le menu</>}
                />
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleClose} className="w-full" size="lg">
                J'ai compris
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Plus tard
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Step({
  number,
  icon,
  text,
  action,
}: {
  number: number;
  icon: React.ReactNode;
  text: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-muted/50 rounded-lg px-4 py-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      {icon && (
        <span className="flex-shrink-0 text-muted-foreground mt-0.5">{icon}</span>
      )}
      <div className="flex-1">
        <span className="text-sm">{text}</span>
        {action}
      </div>
    </div>
  );
}
