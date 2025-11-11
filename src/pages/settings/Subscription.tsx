import { BackButton } from "@/components/BackButton";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";

const Subscription = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/settings" />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <SubscriptionSection />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
