import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ProfileSection = () => {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });

      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("id", user?.id);

      toast.success("Nom mis à jour avec succès");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du nom");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast.success("Email de réinitialisation envoyé ! Vérifie ta boîte mail.");
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi de l'email");
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Here you would typically call an edge function to handle account deletion
      // For now, we'll just sign out the user
      toast.info("Fonctionnalité bientôt disponible. Contacte le support pour supprimer ton compte.");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression du compte");
      console.error(error);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Mon Profil</h2>
        <p className="text-muted-foreground">Gère tes informations personnelles</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            L'email ne peut pas être modifié
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Nom
          </Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton nom"
            />
            <Button
              onClick={handleNameUpdate}
              disabled={loading || name === user?.user_metadata?.name}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Mot de passe
          </Label>
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            disabled={passwordLoading}
            className="w-full"
          >
            {passwordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Réinitialiser mon mot de passe
          </Button>
          <p className="text-sm text-muted-foreground">
            Un email te sera envoyé pour changer ton mot de passe
          </p>
        </div>
      </div>

      <div className="pt-6 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Es-tu sûr(e) ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes tes données seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
