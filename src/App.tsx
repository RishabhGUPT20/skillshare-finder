import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Teams from "./pages/Teams";
import Profiles from "./pages/Profiles";
import NotFound from "./pages/NotFound";
import CreateEventForm from "./components/CreateEventForm";
import CreateTeamForm from "./components/CreateTeamForm";
import CreateProfileForm from "./components/CreateProfileForm";
import EventDetail from "./pages/EventDetail";
import TeamDetail from "./pages/TeamDetail";
import ProfileDetail from "./pages/ProfileDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/create" element={<CreateEventForm />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/teams/create" element={<CreateTeamForm />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profiles/:id" element={<ProfileDetail />} />
          <Route path="/profiles/create" element={<CreateProfileForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
