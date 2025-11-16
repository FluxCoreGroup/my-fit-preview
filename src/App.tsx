import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubscriptionGuard } from "./components/SubscriptionGuard";
import { useSaveOnboardingData } from "./hooks/useSaveOnboardingData";
import { AppLayout } from "./components/layouts/AppLayout";
import Landing from "./pages/Landing";
import Start from "./pages/Start";
import Preview from "./pages/Preview";
import Tarif from "./pages/Tarif";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import EmailConfirmation from "./pages/EmailConfirmation";
import EmailVerified from "./pages/EmailVerified";
import AuthCallback from "./components/AuthCallback";
import TrainingSetup from "./pages/TrainingSetup";
import OnboardingIntro from "./pages/OnboardingIntro";
import Session from "./pages/Session";
import Feedback from "./pages/Feedback";
import Paywall from "./pages/Paywall";
import Weekly from "./pages/Weekly";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import GeneratingSession from "./pages/GeneratingSession";
import Settings from "./pages/Settings";
import Profile from "./pages/settings/Profile";
import PhysicalInfo from "./pages/settings/PhysicalInfo";
import TrainingProgram from "./pages/settings/TrainingProgram";
import NutritionSettings from "./pages/settings/Nutrition";
import Subscription from "./pages/settings/Subscription";
import SettingsSupport from "./pages/settings/Support";
import Training from "./pages/Training";
import Nutrition from "./pages/Nutrition";
import CoachAlex from "./pages/CoachAlex";
import CoachJulie from "./pages/CoachJulie";
import Hub from "./pages/Hub";
import PaymentSuccess from "./pages/PaymentSuccess";
import Progression from "./pages/Progression";
import { ScrollToTop } from "./components/ScrollToTop";

// Component to sync onboarding data to Supabase as soon as user is authenticated
const OnboardingSyncGate = () => {
  useSaveOnboardingData();
  return null;
};

const App = () => (
  <TooltipProvider>
    <OnboardingSyncGate />
    <ScrollToTop />
    <Toaster />
    <Sonner />
    <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/start" element={<Start />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/tarif" element={<Tarif />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/training-setup" element={<TrainingSetup />} />
            <Route path="/onboarding-intro" element={<ProtectedRoute><OnboardingIntro /></ProtectedRoute>} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/support" element={<Support />} />
            
            {/* Protected routes with AppLayout */}
          <Route path="/generating-session" element={<ProtectedRoute><GeneratingSession /></ProtectedRoute>} />
          <Route path="/session" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Session /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/paywall" element={<ProtectedRoute><Paywall /></ProtectedRoute>} />
          <Route path="/weekly" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Weekly /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/progression" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Progression /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/hub" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Hub /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Home /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Training /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Nutrition /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/coach/alex" element={<ProtectedRoute><SubscriptionGuard><AppLayout><CoachAlex /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/coach/julie" element={<ProtectedRoute><SubscriptionGuard><AppLayout><CoachJulie /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Settings /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Profile /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/physical-info" element={<ProtectedRoute><SubscriptionGuard><AppLayout><PhysicalInfo /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/training-program" element={<ProtectedRoute><SubscriptionGuard><AppLayout><TrainingProgram /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/nutrition" element={<ProtectedRoute><SubscriptionGuard><AppLayout><NutritionSettings /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionGuard><AppLayout><Subscription /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/settings/support" element={<ProtectedRoute><SubscriptionGuard><AppLayout><SettingsSupport /></AppLayout></SubscriptionGuard></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
