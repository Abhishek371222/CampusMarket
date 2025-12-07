import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Share2, ShieldCheck, ArrowLeft, Wand2, Eye, CircleDollarSign, Loader2, ShoppingCart, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct, useProductView, useCreateOffer, useCreateChat, useUserProfile, useFollowUser, useUnfollowUser, useBuyProduct } from "@/lib/api-hooks";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [buyNotes, setBuyNotes] = useState("");
  
  const { data: product, isLoading: productLoading, error: productError } = useProduct(params?.id);
  const { data: seller, isLoading: sellerLoading } = useUserProfile(product?.sellerId);
  const productViewMutation = useProductView(params?.id || "");
  const createOfferMutation = useCreateOffer();
  const createChatMutation = useCreateChat();
  const followUserMutation = useFollowUser(product?.sellerId || "");
  const unfollowUserMutation = useUnfollowUser(product?.sellerId || "");
  const buyProductMutation = useBuyProduct();

  // Note: isFollowing would need to be fetched from followers/following API
  const isFollowing = false; // TODO: Implement following check

  useEffect(() => {
    if (params?.id && user) {
      productViewMutation.mutate();
    }
  }, [params?.id]);

  if (productLoading || sellerLoading) {
    return (
      <div className="container px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (productError || !product || !seller) return <NotFound />;

  const handleContact = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.id === product.sellerId) {
      toast({ title: "This is your item", variant: "destructive" });
      return;
    }
    
    try {
      const chat = await createChatMutation.mutateAsync({ 
        productId: product.id, 
        sellerId: product.sellerId 
      });
      setLocation(`/messages?chat=${chat.id}`);
    } catch (error) {
      toast({ 
        title: "Failed to create chat", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleOffer = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    try {
      await createOfferMutation.mutateAsync({
        productId: product.id,
        amount: offerAmount
      });
      setIsOfferOpen(false);
      setOfferAmount("");
      toast({ title: "Offer sent!", description: `You offered $${offerAmount}` });
    } catch (error) {
      toast({ 
        title: "Failed to send offer", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleFollow = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUserMutation.mutateAsync();
        toast({ title: `Unfollowed ${seller.name}` });
      } else {
        await followUserMutation.mutateAsync();
        toast({ title: `Following ${seller.name}` });
      }
    } catch (error) {
      toast({ 
        title: "Failed to update follow status", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.id === product.sellerId) {
      toast({ title: "You cannot buy your own item", variant: "destructive" });
      return;
    }

    try {
      await buyProductMutation.mutateAsync({
        productId: product.id,
        data: {
          paymentMethod: paymentMethod || undefined,
          meetupLocation: meetupLocation || undefined,
          notes: buyNotes || undefined,
        }
      });
      setIsBuyOpen(false);
      setPaymentMethod("");
      setMeetupLocation("");
      setBuyNotes("");
      toast({ 
        title: "Purchase initiated!", 
        description: "The seller has been notified. Check your orders for updates." 
      });
      setLocation("/orders");
    } catch (error) {
      toast({ 
        title: "Purchase failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* 3D Carousel Mockup */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square bg-muted rounded-xl overflow-hidden border relative group"
          >
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-md">
              <Eye className="h-3 w-3" /> {product.viewCount} views
            </div>
          </motion.div>
          
          <div className="grid grid-cols-4 gap-4">
             {[...product.images, ...Array(3).fill(product.images[0])].slice(0, 4).map((img, i) => (
               <motion.div 
                 key={i}
                 whileHover={{ scale: 1.05 }}
                 className="aspect-square bg-muted rounded-lg overflow-hidden border cursor-pointer ring-offset-2 hover:ring-2 ring-primary transition-all"
               >
                  <img src={img} className="w-full h-full object-cover" />
               </motion.div>
             ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
             <div className="flex items-center justify-between mb-4">
               <Badge className="px-3 py-1 text-sm">{product.category}</Badge>
               <span className="text-sm text-muted-foreground">
                 Posted {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
               </span>
             </div>
             
             <h1 className="text-4xl font-heading font-bold mb-4">{product.title}</h1>
             
             <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-4xl font-bold text-primary">${product.price}</p>
                  {product.aiEstimatedPriceMin && product.aiEstimatedPriceMax && (
                    <div className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                      <Wand2 className="h-3 w-3" />
                      AI Est: ${product.aiEstimatedPriceMin} - ${product.aiEstimatedPriceMax}
                    </div>
                  )}
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="flex-1 gap-2"
                        disabled={product.status !== "available" || user?.id === product.sellerId}
                        data-testid="button-buy-now"
                      >
                        <ShoppingCart className="h-5 w-5" /> Buy Now - ${product.price}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-medium">{product.title}</p>
                          <p className="text-2xl font-bold text-primary">${product.price}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash on meetup</SelectItem>
                              <SelectItem value="venmo">Venmo</SelectItem>
                              <SelectItem value="zelle">Zelle</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Meetup Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              value={meetupLocation} 
                              onChange={(e) => setMeetupLocation(e.target.value)}
                              placeholder="e.g., Student Center, Library"
                              className="pl-10"
                              data-testid="input-meetup-location"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes for Seller (optional)</Label>
                          <Textarea 
                            value={buyNotes} 
                            onChange={(e) => setBuyNotes(e.target.value)}
                            placeholder="Any special requests or questions..."
                            className="resize-none"
                            data-testid="input-buy-notes"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The seller will be notified immediately. Arrange a safe public meetup location on campus.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleBuyNow}
                          disabled={buyProductMutation.isPending}
                          data-testid="button-confirm-purchase"
                        >
                          {buyProductMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Confirm Purchase
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="flex-1 gap-2" 
                    onClick={handleContact}
                    disabled={createChatMutation.isPending}
                    data-testid="button-chat"
                  >
                     {createChatMutation.isPending ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                     ) : (
                       <MessageCircle className="h-5 w-5" />
                     )}
                     Chat
                  </Button>
                  
                  <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="flex-1 gap-2"
                        data-testid="button-make-offer"
                      >
                        <CircleDollarSign className="h-5 w-5" /> Make Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make an Offer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Your Price ($)</Label>
                          <Input 
                            type="number" 
                            value={offerAmount} 
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder={product.price.toString()}
                            data-testid="input-offer-amount"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The seller will be notified immediately. Payment is held in escrow until you verify the item in person.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleOffer}
                          disabled={createOfferMutation.isPending || !offerAmount}
                          data-testid="button-send-offer"
                        >
                          {createOfferMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Send Offer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
             </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
            <h3 className="font-heading font-semibold text-lg">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <div className="flex gap-8 pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Condition</span>
                <span className="font-medium mt-1">{product.condition}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                 <span className="font-medium capitalize mt-1 text-green-600">{product.status}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6 flex items-center justify-between hover:border-primary/50 transition-colors">
             <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14">
                     <AvatarImage src={seller.avatar || undefined} />
                     <AvatarFallback>{seller.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                   <p className="font-heading font-semibold text-lg">{seller.name}</p>
                   <div className="flex items-center gap-2">
                     {seller.isVerified && (
                       <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
                       </div>
                     )}
                   </div>
                </div>
             </div>
             <Button 
               variant={isFollowing ? "outline" : "default"} 
               size="sm"
               onClick={handleFollow}
               disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
               data-testid="button-follow"
             >
               {followUserMutation.isPending || unfollowUserMutation.isPending ? (
                 <Loader2 className="h-3 w-3 animate-spin mr-2" />
               ) : null}
               {isFollowing ? "Unfollow" : "Follow"}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
