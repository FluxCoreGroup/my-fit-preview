import { BackButton } from "@/components/BackButton";
import { NutritionSection } from "@/components/settings/NutritionSection";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/settings" />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <NutritionSection />
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
