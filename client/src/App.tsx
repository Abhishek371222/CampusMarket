import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiChatbot } from "@/components/AiChatbot";

import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import Sell from "@/pages/Sell";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import ProfileSetup from "@/pages/ProfileSetup";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Community from "@/pages/Community";
import AdminDashboard from "@/pages/Admin";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";
import Safety from "@/pages/Safety";
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";

function AuthenticatedChatbot() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;
  return <AiChatbot />;
}

function ProfileSetupRedirect() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && user && !user.locationId) {
      const allowedPaths = ["/profile/setup", "/login", "/signup", "/api/logout", "/privacy", "/terms", "/cookies", "/safety", "/support"];
      if (!allowedPaths.some(path => location.startsWith(path))) {
        setLocation("/profile/setup");
      }
    }
  }, [user, isLoading, location, setLocation]);
  
  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ProfileSetupRedirect />
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/market" component={Marketplace} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/sell" component={Sell} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/profile/setup" component={ProfileSetup} />
          <Route path="/messages" component={Messages} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/community" component={Community} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/cookies" component={Cookies} />
          <Route path="/safety" component={Safety} />
          <Route path="/support" component={Support} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <AuthenticatedChatbot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
