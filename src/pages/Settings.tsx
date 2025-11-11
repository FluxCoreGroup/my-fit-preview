import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { User, Dumbbell, Apple, CreditCard, HelpCircle, LogOut, ChevronRight, Settings as SettingsIcon, Activity } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const settingsItems = [
  {
    title: "Profil",
    description: "Informations personnelles",
    icon: User,
    to: "/settings/profile",
  },
  {
    title: "Infos physiques",
    description: "Âge, poids, taille, objectifs",
    icon: Activity,
    to: "/settings/physical-info",
  },
  {
    title: "Programme d'entraînement",
    description: "Objectifs et matériel",
    icon: Dumbbell,
    to: "/settings/training-program",
  },
  {
    title: "Nutrition",
    description: "Régime et préférences alimentaires",
    icon: Apple,
    to: "/settings/nutrition",
  },
  {
    title: "Abonnement",
    description: "Gérer ton abonnement Pulse.ai",
    icon: CreditCard,
    to: "/settings/subscription",
  },
  {
    title: "Aide & Support",
    description: "FAQ, contact et mentions légales",
    icon: HelpCircle,
    to: "/support",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt ! 👋",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label="Retour au Hub" />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <SettingsIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Réglages</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Gère ton compte et tes préférences
            </p>
          </div>

          <div className="space-y-3">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} to={item.to}>
                  <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              );
            })}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-destructive/10 rounded-xl">
                        <LogOut className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Déconnexion</h3>
                        <p className="text-sm text-muted-foreground">Se déconnecter de l'application</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Es-tu sûr(e) de vouloir te déconnecter ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Se déconnecter</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
