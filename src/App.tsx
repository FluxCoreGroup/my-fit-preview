import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Start from "./pages/Start";
import Preview from "./pages/Preview";
import Auth from "./pages/Auth";
import Session from "./pages/Session";
import Feedback from "./pages/Feedback";
import Paywall from "./pages/Paywall";
import Weekly from "./pages/Weekly";
import Dashboard from "./pages/Dashboard";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Start />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/session" element={<Session />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/paywall" element={<Paywall />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
