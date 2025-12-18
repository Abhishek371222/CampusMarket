import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/lib/store";
import { Loader2, Package, FileText, Star, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MOCK_INVOICES, MOCK_REVIEWS } from "@/lib/mockData";

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [reviewData, setReviewData] = useState({ rating: 5, title: "", content: "" });
  const { toast } = useToast();

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
              
              <div className="mt-6 pt-4 border-t flex gap-2 flex-wrap">
                {/* Invoice Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      View Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Order Invoice #{order.id}</DialogTitle>
                    </DialogHeader>
                    <InvoiceView orderId={order.id} />
                  </DialogContent>
                </Dialog>

                {/* Review Button */}
                {order.status === "Delivered" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Write Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>
                      <ReviewForm 
                        orderId={order.id}
                        onSubmit={() => toast({ title: "Review submitted!", description: "Thank you for your feedback." })}
                      />
                    </DialogContent>
                  </Dialog>
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

function InvoiceView({ orderId }: { orderId: number }) {
  const invoice = MOCK_INVOICES[orderId as keyof typeof MOCK_INVOICES];
  
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Invoice #</p>
          <p className="font-semibold">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="font-semibold">{format(new Date(invoice.date), "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tracking #</p>
          <p className="font-semibold">{invoice.trackingNumber}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="font-semibold">{invoice.status}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="font-semibold mb-2">Items</p>
        {invoice.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span>{item.title} x{item.quantity}</span>
            <span>${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span>${invoice.platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="font-semibold text-xs mb-2">Ship To</p>
        <p className="text-xs">{invoice.buyerName}</p>
        <p className="text-xs text-muted-foreground">{invoice.shippingAddress}</p>
      </div>
    </div>
  );
}

function ReviewForm({ orderId, onSubmit }: { orderId: number; onSubmit: () => void }) {
  const [data, setData] = useState({ rating: 5, title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!data.title || !data.content) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSubmit();
    setData({ rating: 5, title: "", content: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4" />
          Rating
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setData(p => ({ ...p, rating: star }))}
              className={`text-2xl transition-colors ${star <= data.rating ? "text-accent" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Review Title</Label>
        <input
          id="review-title"
          type="text"
          value={data.title}
          onChange={(e) => setData(p => ({ ...p, title: e.target.value }))}
          placeholder="e.g., Great condition!"
          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <Label htmlFor="review-content">Your Review</Label>
        <Textarea
          id="review-content"
          value={data.content}
          onChange={(e) => setData(p => ({ ...p, content: e.target.value }))}
          placeholder="Tell other students about this item..."
          className="w-full mt-1 min-h-24 text-sm"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !data.title || !data.content}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
