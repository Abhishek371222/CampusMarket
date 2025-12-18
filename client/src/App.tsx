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
import OrdersPage from "@/pages/OrdersPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products/:id" component={ProductDetailsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/orders" component={OrdersPage} />
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
              // Hide Navbar/Footer on login page for cleaner look
              const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
              return !isAuthPage && <Navbar />;
            }}
          </Route>
          
          <main className="flex-1">
            <Router />
          </main>
          
          <Route>
            {(params) => {
              const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
              return !isAuthPage && <Footer />;
            }}
          </Route>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
