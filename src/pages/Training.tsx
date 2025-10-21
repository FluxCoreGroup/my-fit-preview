import { BackButton } from "@/components/BackButton";
import { Dumbbell } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

const Training = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton />
      
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Mes entraînements</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={Dumbbell}
            title="Module en construction"
            description="La page Mes entraînements sera bientôt disponible avec la vue hebdomadaire, l'historique et la génération de programmes."
            action={{ label: "Générer une séance", to: "/training-setup" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Training;
