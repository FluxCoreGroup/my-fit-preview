import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
  to?: string;
  onClick?: () => void;
}

export const BackButton = ({ label = "Retour", to = "/dashboard", onClick }: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="fixed top-4 left-4 z-40 bg-card/50 backdrop-blur-sm border border-white/10 rounded-full"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
};
