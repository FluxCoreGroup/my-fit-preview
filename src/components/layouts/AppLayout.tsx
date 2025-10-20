import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  
  // Masquer la bottom nav sur les pages de session
  const hideBottomNav = location.pathname === "/session";
  
  return (
    <div className="min-h-screen w-full">
      {children}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};
