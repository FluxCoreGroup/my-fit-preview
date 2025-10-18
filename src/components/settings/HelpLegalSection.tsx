import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, HelpCircle, Mail, FileText, Shield, Info } from "lucide-react";

export const HelpLegalSection = () => {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Aide & Légal</h2>
        <p className="text-muted-foreground">Support, documentation et informations légales</p>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Centre d'aide
          </h3>
          <div className="space-y-2">
            <Link to="/support">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://docs.pulse.ai" target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-2" />
                Documentation
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Informations légales
          </h3>
          <div className="space-y-2">
            <Link to="/legal?section=terms">
              <Button variant="ghost" className="w-full justify-start text-left">
                Conditions d'utilisation
              </Button>
            </Link>
            <Link to="/legal?section=privacy">
              <Button variant="ghost" className="w-full justify-start text-left">
                Politique de confidentialité
              </Button>
            </Link>
            <Link to="/legal?section=cookies">
              <Button variant="ghost" className="w-full justify-start text-left">
                Politique des cookies
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Version de l'application</p>
              <p className="text-muted-foreground">Pulse.ai v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
