import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/lib/store";
import { Loader2, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-8">Your Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Order placed {order.createdAt ? format(new Date(order.createdAt), "MMMM d, yyyy") : ""}
                  </div>
                  <div className="font-bold text-lg">Order #{order.id}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="font-bold text-foreground">${order.total}</div>
                  </div>
                  <Badge 
                    className={
                      order.status === "Delivered" ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                      order.status === "Processing" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {/* @ts-ignore - items is jsonb, manually typed in mock */}
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                       <div className="bg-muted h-12 w-12 rounded-lg flex items-center justify-center">
                         <Package className="h-6 w-6 text-muted-foreground" />
                       </div>
                       <div>
                         <div className="font-medium">{item.title}</div>
                         <div className="text-muted-foreground">Qty: {item.quantity}</div>
                       </div>
                    </div>
                    <div className="font-medium">${item.price}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <Button variant="outline" size="sm">View Invoice</Button>
                {order.status === "Delivered" && (
                  <Button size="sm" variant="secondary">Write a Review</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
