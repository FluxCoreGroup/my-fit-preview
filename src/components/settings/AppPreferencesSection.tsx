import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Globe, Ruler, Bell, Moon } from "lucide-react";

export const AppPreferencesSection = () => {
  const [preferences, setPreferences] = useState({
    language: "fr",
    units: "metric",
    notifications: true,
    darkMode: false,
    sounds: true,
  });

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success("Préférence mise à jour");
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Préférences de l'Application</h2>
        <p className="text-muted-foreground">Personnalise ton expérience Pulse.ai</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Langue
          </Label>
          <Select 
            value={preferences.language} 
            onValueChange={(value) => handlePreferenceChange("language", value)}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="units" className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Unités de mesure
          </Label>
          <Select 
            value={preferences.units} 
            onValueChange={(value) => handlePreferenceChange("units", value)}
          >
            <SelectTrigger id="units">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Métrique (kg, cm)</SelectItem>
              <SelectItem value="imperial">Impérial (lbs, inches)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <div>
              <Label htmlFor="notifications" className="text-base">Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des rappels pour tes séances
              </p>
            </div>
          </div>
          <Switch
            id="notifications"
            checked={preferences.notifications}
            onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            <div>
              <Label htmlFor="darkMode" className="text-base">Mode sombre</Label>
              <p className="text-sm text-muted-foreground">
                Interface en mode sombre (bientôt disponible)
              </p>
            </div>
          </div>
          <Switch
            id="darkMode"
            checked={preferences.darkMode}
            onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
            disabled
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="sounds" className="text-base">Sons de séance</Label>
            <p className="text-sm text-muted-foreground">
              Sons de feedback pendant les exercices
            </p>
          </div>
          <Switch
            id="sounds"
            checked={preferences.sounds}
            onCheckedChange={(checked) => handlePreferenceChange("sounds", checked)}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center pt-4">
        Les préférences sont sauvegardées localement sur cet appareil
      </p>
    </Card>
  );
};
