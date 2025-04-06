import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/authContext";
import { AnimatePresence } from "framer-motion";

// Pages
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import CategoryPage from "@/pages/CategoryPage";
import MyListings from "@/pages/MyListings";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import CreateListing from "@/pages/CreateListing";
import Search from "@/pages/Search";
import Wallet from "@/pages/Wallet";
import ChatSupport from "@/pages/ChatSupport";
import NotFound from "@/pages/not-found";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileMenu from "./components/layout/MobileMenu";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
          <Navbar />
          <AnimatePresence mode="wait">
            <main className="flex-grow container mx-auto px-4 py-6">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/listing/:id" component={ListingDetail} />
                <Route path="/category/:slug" component={CategoryPage} />
                <Route path="/my-listings" component={MyListings} />
                <Route path="/messages" component={Messages} />
                <Route path="/messages/:userId/:listingId" component={Messages} />
                <Route path="/profile" component={Profile} />
                <Route path="/create-listing" component={CreateListing} />
                <Route path="/search" component={Search} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/support" component={ChatSupport} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </AnimatePresence>
          <Footer />
          <MobileMenu />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
