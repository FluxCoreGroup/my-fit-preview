import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubscriptionGuard } from "./components/SubscriptionGuard";
import { useSaveOnboardingData } from "./hooks/useSaveOnboardingData";
import Landing from "./pages/Landing";
import Start from "./pages/Start";
import Preview from "./pages/Preview";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import EmailConfirmation from "./pages/EmailConfirmation";
import EmailVerified from "./pages/EmailVerified";
import TrainingSetup from "./pages/TrainingSetup";
import Session from "./pages/Session";
import Feedback from "./pages/Feedback";
import Paywall from "./pages/Paywall";
import Weekly from "./pages/Weekly";
import Dashboard from "./pages/Dashboard";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import GeneratingSession from "./pages/GeneratingSession";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Component to sync onboarding data to Supabase as soon as user is authenticated
const OnboardingSyncGate = () => {
  useSaveOnboardingData();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnboardingSyncGate />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/start" element={<Start />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/training-setup" element={<TrainingSetup />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/support" element={<Support />} />
            
            {/* Protected routes */}
          <Route path="/generating-session" element={<ProtectedRoute><GeneratingSession /></ProtectedRoute>} />
          <Route path="/session" element={<ProtectedRoute><SubscriptionGuard><Session /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/paywall" element={<ProtectedRoute><Paywall /></ProtectedRoute>} />
          <Route path="/weekly" element={<ProtectedRoute><SubscriptionGuard><Weekly /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><Dashboard /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SubscriptionGuard><Settings /></SubscriptionGuard></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
