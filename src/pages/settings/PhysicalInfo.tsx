import { BackButton } from "@/components/BackButton";
import { PhysicalInfoSection } from "@/components/settings/PhysicalInfoSection";

const PhysicalInfo = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/settings" />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <PhysicalInfoSection />
        </div>
      </div>
    </div>
  );
};

export default PhysicalInfo;
