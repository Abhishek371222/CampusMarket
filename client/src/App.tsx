import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ListingDetails from "@/pages/ListingDetails";
import CreateListing from "@/pages/CreateListing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import SavedListings from "@/pages/SavedListings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { UserProvider } from "@/components/ui/animations";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar 
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onMobileSearchToggle={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            isMobileSearchOpen={isMobileSearchOpen}
          />
          
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
          
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/listings/:id" component={ListingDetails} />
                <Route path="/create-listing" component={CreateListing} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/messages" component={Messages} />
                <Route path="/messages/:userId/:listingId" component={Messages} />
                <Route path="/profile" component={Profile} />
                <Route path="/profile/:id" component={Profile} />
                <Route path="/saved" component={SavedListings} />
                <Route component={NotFound} />
              </Switch>
            </AnimatePresence>
          </main>
          
          <Footer />
        </div>
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
