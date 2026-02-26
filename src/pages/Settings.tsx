import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { User, Dumbbell, Apple, CreditCard, HelpCircle, LogOut, ChevronRight, Settings as SettingsIcon, Activity } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();
  const { toast } = useToast();

  const settingsItems = [
    { title: t("menu.profile"), description: t("menu.profileDesc"), icon: User, to: "/settings/profile" },
    { title: t("menu.physicalInfo"), description: t("menu.physicalInfoDesc"), icon: Activity, to: "/settings/physical-info" },
    { title: t("menu.trainingProgram"), description: t("menu.trainingProgramDesc"), icon: Dumbbell, to: "/settings/training-program" },
    { title: t("menu.nutrition"), description: t("menu.nutritionDesc"), icon: Apple, to: "/settings/nutrition" },
    { title: t("menu.subscription"), description: t("menu.subscriptionDesc"), icon: CreditCard, to: "/settings/subscription" },
    { title: t("menu.support"), description: t("menu.supportDesc"), icon: HelpCircle, to: "/settings/support" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("menu.logoutSuccess"), description: t("menu.logoutSuccessDesc") });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackButton to="/hub" label={t("backToHub")} />
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><SettingsIcon className="w-6 h-6 text-primary" /></div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="space-y-3">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} to={item.to}>
                  <Card className="p-4 bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl"><Icon className="w-5 h-5 text-primary" /></div>
                        <div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.description}</p></div>
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
                      <div className="p-3 bg-destructive/10 rounded-xl"><LogOut className="w-5 h-5 text-destructive" /></div>
                      <div><h3 className="font-semibold">{t("menu.logout")}</h3><p className="text-sm text-muted-foreground">{t("menu.logoutDesc")}</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("menu.logoutConfirm")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("menu.logoutConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("menu.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>{t("menu.logoutButton")}</AlertDialogAction>
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
