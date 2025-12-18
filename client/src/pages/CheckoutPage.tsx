import { useState } from "react";
import { useCart } from "@/lib/store";
import { useCreateOrder } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");

  const handlePlaceOrder = () => {
    const orderData = {
      userId: 1, // Mock user ID
      total: (total() + 2.00).toString(),
      status: "Processing",
      items: items.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      }))
    };

    createOrder.mutate(orderData, {
      onSuccess: () => {
        setStep("success");
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: "Check your email for confirmation.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (items.length === 0 && step !== "success") {
    setLocation("/");
    return null;
  }

  if (step === "success") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Thank you for your purchase. We've sent a confirmation email to alex@university.edu.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => setLocation("/orders")} variant="outline">
            View Order
          </Button>
          <Button onClick={() => setLocation("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Checkout</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === "address" ? "text-primary font-bold" : ""}>Shipping</span>
          <span>→</span>
          <span className={step === "payment" ? "text-primary font-bold" : ""}>Payment</span>
          <span>→</span>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="grid gap-8">
        {step === "address" && (
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Johnson" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Campus Building / Dorm</Label>
                <Input placeholder="e.g. North Hall, Room 304" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="(555) 123-4567" />
              </div>
              
              <Button 
                className="w-full mt-4 h-12 text-lg rounded-xl"
                onClick={() => setStep("payment")}
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "payment" && (
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-xl bg-secondary/20 flex gap-4 items-center">
                <div className="h-8 w-12 bg-white rounded border flex items-center justify-center font-bold text-xs">VISA</div>
                <div className="flex-1">
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/25</p>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                 <div className="flex justify-between font-medium">
                  <span>Total to pay</span>
                  <span>${(total() + 2.00).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep("address")}
                disabled={createOrder.isPending}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
