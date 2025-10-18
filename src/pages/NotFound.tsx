import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, MessageSquare } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">
            Oups, tu n'es pas sensé arriver là
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => navigate("/")}
            className="flex-1"
            size="lg"
          >
            <Home className="mr-2" />
            Retour à l'accueil
          </Button>
          
          <Button 
            onClick={() => navigate("/support")}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <MessageSquare className="mr-2" />
            Signaler aux staffs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
