import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Activity, Dumbbell, Heart, Utensils, Stethoscope, CreditCard, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { PhysicalInfoSection } from "@/components/settings/PhysicalInfoSection";
import { TrainingProgramSection } from "@/components/settings/TrainingProgramSection";
import { CardioMobilitySection } from "@/components/settings/CardioMobilitySection";
import { NutritionSection } from "@/components/settings/NutritionSection";
import { HealthConditionsSection } from "@/components/settings/HealthConditionsSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { AppPreferencesSection } from "@/components/settings/AppPreferencesSection";
import { HelpLegalSection } from "@/components/settings/HelpLegalSection";

const Settings = () => {
  return (
    <>
      <Header variant="app" showBack />
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="physical" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Physique</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span className="hidden sm:inline">Programme</span>
              </TabsTrigger>
              <TabsTrigger value="cardio" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Cardio</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                <span className="hidden sm:inline">Nutrition</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Santé</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Abonnement</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Préférences</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Aide</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>

            <TabsContent value="physical">
              <PhysicalInfoSection />
            </TabsContent>

            <TabsContent value="training">
              <TrainingProgramSection />
            </TabsContent>

            <TabsContent value="cardio">
              <CardioMobilitySection />
            </TabsContent>

            <TabsContent value="nutrition">
              <NutritionSection />
            </TabsContent>

            <TabsContent value="health">
              <HealthConditionsSection />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionSection />
            </TabsContent>

            <TabsContent value="preferences">
              <AppPreferencesSection />
            </TabsContent>

            <TabsContent value="help">
              <HelpLegalSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Settings;
