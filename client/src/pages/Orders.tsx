import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingBag, Package, Loader2, Check, X, Truck, Clock, MapPin, CreditCard } from "lucide-react";
import { useOrders, useUpdateOrderStatus, useProduct, useUserProfile } from "@/lib/api-hooks";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Order } from "@shared/schema";

function OrderCard({ order, type }: { order: Order; type: "buying" | "selling" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: product } = useProduct(order.productId);
  const { data: otherUser } = useUserProfile(type === "buying" ? order.sellerId : order.buyerId);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId: order.id, status });
      toast({ title: `Order ${status}` });
    } catch (error) {
      toast({ 
        title: "Failed to update order", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700 border-transparent"><Check className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-700 border-transparent"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-700 border-transparent"><Check className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-order-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {product && (
            <div 
              className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setLocation(`/product/${product.id}`)}
            >
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-semibold text-lg">
                  {product?.title || "Loading..."}
                </h3>
                <p className="text-2xl font-bold text-primary">${order.amount}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>Order #{order.id.slice(0, 8)}</span>
              <span>Created {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
            </div>

            {otherUser && (
              <div className="flex items-center gap-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar || undefined} />
                  <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{type === "buying" ? "Seller" : "Buyer"}: {otherUser.name}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {order.paymentMethod && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  {order.paymentMethod}
                </div>
              )}
              {order.meetupLocation && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {order.meetupLocation}
                </div>
              )}
            </div>

            {order.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {order.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {type === "selling" && order.status === "pending" && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateStatus("confirmed")}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-confirm-${order.id}`}
                  >
                    {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Confirm Order
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-cancel-${order.id}`}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {type === "selling" && order.status === "confirmed" && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateStatus("shipped")}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-ship-${order.id}`}
                >
                  {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                  Mark as Ready for Pickup
                </Button>
              )}
              {type === "buying" && order.status === "shipped" && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateStatus("delivered")}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-received-${order.id}`}
                >
                  {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Confirm Received
                </Button>
              )}
              {type === "buying" && order.status === "pending" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUpdateStatus("cancelled")}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-cancel-${order.id}`}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: buyingOrders, isLoading: buyingLoading } = useOrders("buying");
  const { data: sellingOrders, isLoading: sellingLoading } = useOrders("selling");

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          My Orders
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your purchases and sales in one place
        </p>
      </div>

      <Tabs defaultValue="buying" className="w-full">
        <TabsList className="w-full justify-start flex-wrap gap-1 border-b rounded-none bg-transparent p-0 h-auto mb-6">
          <TabsTrigger 
            value="buying" 
            className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            data-testid="tab-buying"
          >
            <Package className="h-4 w-4 mr-2" />
            Buying ({buyingLoading ? "..." : buyingOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger 
            value="selling" 
            className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            data-testid="tab-selling"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Selling ({sellingLoading ? "..." : sellingOrders?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buying" className="mt-0">
          {buyingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : buyingOrders && buyingOrders.length > 0 ? (
            <div className="space-y-4">
              {buyingOrders.map((order) => (
                <OrderCard key={order.id} order={order} type="buying" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No purchases yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  When you buy items, they'll appear here so you can track your orders.
                </CardDescription>
                <Button onClick={() => setLocation("/market")} data-testid="button-browse-buying">
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="selling" className="mt-0">
          {sellingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sellingOrders && sellingOrders.length > 0 ? (
            <div className="space-y-4">
              {sellingOrders.map((order) => (
                <OrderCard key={order.id} order={order} type="selling" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No sales yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  When someone buys your items, their orders will appear here.
                </CardDescription>
                <Button onClick={() => setLocation("/sell")} data-testid="button-start-selling">
                  Start Selling
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
