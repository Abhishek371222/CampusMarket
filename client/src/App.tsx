import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMarketStore } from "@/lib/mockData";
import { useEffect } from "react";
import { nanoid } from "nanoid";

import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import Sell from "@/pages/Sell";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Community from "@/pages/Community";
import AdminDashboard from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/market" component={Marketplace} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/sell" component={Sell} />
          <Route path="/profile" component={Profile} />
          <Route path="/messages" component={Messages} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/community" component={Community} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function SimulationRunner() {
  const { currentUser, addNotification } = useMarketStore();

  useEffect(() => {
    if (!currentUser) return;

    // Randomly trigger a notification every 60-120 seconds to simulate live activity
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const notifications = [
          "Someone viewed your item 'Graphing Calculator'",
          "Price drop alert for 'Biology 101'",
          "Sarah Chen followed you",
          "New trending post in Community"
        ];
        const randomMsg = notifications[Math.floor(Math.random() * notifications.length)];
        addNotification(currentUser.id, "system", randomMsg);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser, addNotification]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SimulationRunner />
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
