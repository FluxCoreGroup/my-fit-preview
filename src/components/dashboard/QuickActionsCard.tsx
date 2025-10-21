import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActionsCard = () => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button asChild variant="default" className="w-full">
          <Link to="/session">
            <Play className="mr-2 w-4 h-4" />
            Démarrer séance
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/weekly">
            <TrendingUp className="mr-2 w-4 h-4" />
            Faire mon check-in
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/training-setup">
            <RefreshCw className="mr-2 w-4 h-4" />
            Regénérer menus
          </Link>
        </Button>
      </div>
    </Card>
  );
};
