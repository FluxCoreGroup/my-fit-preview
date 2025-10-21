import { BackButton } from "@/components/BackButton";
import { Apple } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton />
      
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Apple className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Ma nutrition</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={Apple}
            title="Module en construction"
            description="La page Ma nutrition sera bientôt disponible avec tes calculs (BMI, TDEE, macros), des journées types et des recettes adaptées."
            action={{ label: "Voir mes paramètres nutrition", to: "/settings/nutrition" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
