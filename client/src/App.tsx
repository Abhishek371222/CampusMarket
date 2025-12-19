import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Pages
import HomePage from "@/pages/HomePage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OrdersPage from "@/pages/OrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import SellItemPage from "@/pages/SellItemPage";
import SearchPage from "@/pages/SearchPage";
import MyListingsPage from "@/pages/MyListingsPage";
import SavedItemsPage from "@/pages/SavedItemsPage";
import ReviewsPage from "@/pages/ReviewsPage";
import PeoplePage from "@/pages/PeoplePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import TermsPage from "@/pages/TermsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products/:id" component={ProductDetailsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/sell" component={SellItemPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/my-listings" component={MyListingsPage} />
      <Route path="/saved-items" component={SavedItemsPage} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/people" component={PeoplePage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsPage} />
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
          {/* We conditinally render Navbar based on route if needed, but for simplicity wrapping everything */}
          <Route>
            {(params) => {
              // Hide Navbar/Footer on auth pages for cleaner look
              const isAuthPage = ['/login', '/signup'].includes(window.location.pathname);
              return !isAuthPage && <Navbar />;
            }}
          </Route>
          
          <main className="flex-1">
            <Router />
          </main>
          
          <Route>
            {(params) => {
              const isAuthPage = ['/login', '/signup'].includes(window.location.pathname);
              return !isAuthPage && <Footer />;
            }}
          </Route>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
