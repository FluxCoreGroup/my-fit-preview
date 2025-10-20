import { BackButton } from "@/components/BackButton";
import { ProfileSection } from "@/components/settings/ProfileSection";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton to="/settings" />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <ProfileSection />
        </div>
      </div>
    </div>
  );
};

export default Profile;
