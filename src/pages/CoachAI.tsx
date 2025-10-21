import { BackButton } from "@/components/BackButton";
import { Bot } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

const CoachAI = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <BackButton />
      
      <div className="pt-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Bot className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Coach IA</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={Bot}
            title="Module en construction"
            description="Alex (coach sportif) et Julie (nutritionniste) seront bientôt disponibles pour répondre à toutes tes questions via IA."
            action={{ label: "Retour au dashboard", to: "/dashboard" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
