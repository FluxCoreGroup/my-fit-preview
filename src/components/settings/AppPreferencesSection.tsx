import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Globe, Ruler, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const AppPreferencesSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    language: "fr",
    units: "metric",
    notifications: true,
    sounds: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("app_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          language: data.language,
          units: data.units,
          notifications: data.notifications,
          sounds: data.sounds,
        });
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!user) return;

    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      await supabase.from("app_preferences").upsert({
        user_id: user.id,
        ...updatedPreferences,
      });
      toast.success("Préférence mise à jour");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

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
        Les préférences sont synchronisées avec ton compte
      </p>
    </Card>
  );
};
