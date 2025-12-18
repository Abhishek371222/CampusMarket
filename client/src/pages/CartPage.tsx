import { useCart, useAuth } from "@/lib/store";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeItem, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      });
      setLocation("/login");
    } else {
      setLocation("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Looks like you haven't added anything yet. Browse the marketplace to find great deals!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-card border shadow-sm hover:border-primary/20 transition-colors">
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.condition}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="font-bold text-lg">${item.price}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>$2.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>Included</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(total() + 2.00).toFixed(2)}</span>
              </div>
            </div>
            
            <Button onClick={handleCheckout} className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20 mb-3">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
