import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AnalysisResults from "./pages/AnalysisResults";
import Jobs from "./pages/Jobs";
import Admin from "./pages/Admin";
import About from "./pages/About";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeImprovements from "./pages/ResumeImprovements";
import SoftSkillAnalyzer from "./pages/SoftSkillAnalyzer";
import ATSSimulator from "./pages/ATSSimulator";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import MockInterview from "./pages/MockInterview";
import HiringPredictor from "./pages/HiringPredictor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="resumeai-ui-theme">
      <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analysis/:id" element={<AnalysisResults />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/resume-improvements" element={<ResumeImprovements />} />
              <Route path="/soft-skills" element={<SoftSkillAnalyzer />} />
              <Route path="/ats-simulator" element={<ATSSimulator />} />
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/hiring-predictor" element={<HiringPredictor />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
