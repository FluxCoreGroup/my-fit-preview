import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User, AlertTriangle, Calendar, Euro } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SubscriptionInfo {
  hasSubscription: boolean;
  plan_type: string;
  ends_at: string;
  price: number;
  status: string;
}

export const ProfileSection = () => {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const checkSubscriptionBeforeDelete = async () => {
    setCheckingSubscription(true);
    setDialogOpen(true);
    
    try {
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('plan_type, ends_at, status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error || !sub || (sub.status !== 'active' && sub.status !== 'trialing')) {
        setSubscriptionInfo({ 
          hasSubscription: false, 
          plan_type: '', 
          ends_at: '', 
          price: 0,
          status: '' 
        });
      } else {
        // Mapper plan_type au prix
        const priceMap: Record<string, number> = {
          'month': 2999, // 29.99€
          'year': 29990  // 299.90€
        };
        
        setSubscriptionInfo({
          hasSubscription: true,
          plan_type: sub.plan_type,
          ends_at: sub.ends_at,
          price: priceMap[sub.plan_type] || 0,
          status: sub.status
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionInfo({ 
        hasSubscription: false, 
        plan_type: '', 
        ends_at: '', 
        price: 0,
        status: '' 
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expirée");
        return;
      }

      const response = await fetch(
        `https://nsowlnpntphxwykzbwmc.supabase.co/functions/v1/delete-user-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte');
      }

      toast.success("Compte supprimé avec succès");
      
      // Sign out and redirect
      await signOut();
      window.location.href = '/';
    } catch (error: any) {
      toast.error("Erreur lors de la suppression du compte");
      console.error(error);
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2).replace('.', ',') + '€';
  };

  const getPlanLabel = (planType: string) => {
    return planType === 'year' ? 'Annuel' : 'Mensuel';
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
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={checkSubscriptionBeforeDelete}
              disabled={checkingSubscription}
            >
              {checkingSubscription && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {subscriptionInfo?.hasSubscription && (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                Es-tu sûr(e) ?
              </AlertDialogTitle>
              
              {subscriptionInfo?.hasSubscription ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                    <Badge variant="destructive" className="mb-2">
                      Abonnement actif
                    </Badge>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date de fin :</span>
                        <span className="font-semibold">
                          {format(new Date(subscriptionInfo.ends_at), "dd MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Plan :</span>
                        <span className="font-semibold">
                          {getPlanLabel(subscriptionInfo.plan_type)} - {formatPrice(subscriptionInfo.price)}
                          {subscriptionInfo.plan_type === 'month' ? '/mois' : '/an'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <AlertDialogDescription className="text-base">
                    <span className="font-semibold text-destructive">
                      Ton abonnement sera immédiatement annulé
                    </span>{" "}
                    et tu ne seras plus facturé. Toutes tes données seront définitivement supprimées.
                  </AlertDialogDescription>
                  
                  <div className="flex items-start space-x-3 bg-muted/50 p-3 rounded-lg">
                    <Checkbox 
                      id="confirm-delete" 
                      checked={confirmDelete}
                      onCheckedChange={(checked) => setConfirmDelete(checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="confirm-delete"
                      className="text-sm leading-tight cursor-pointer select-none"
                    >
                      Je comprends que mon abonnement sera annulé et que cette action est irréversible
                    </label>
                  </div>
                </div>
              ) : (
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes tes données seront définitivement supprimées.
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setConfirmDelete(false);
                setDialogOpen(false);
              }}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={subscriptionInfo?.hasSubscription && !confirmDelete}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
