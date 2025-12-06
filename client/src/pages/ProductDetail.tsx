import { useRoute, useLocation } from "wouter";
import { useMarketStore } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Share2, ShieldCheck, ArrowLeft, Wand2, Eye, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  
  const product = useMarketStore((state) => 
    state.products.find((p) => p.id === params?.id)
  );
  
  const seller = useMarketStore((state) => 
    state.users.find((u) => u.id === product?.sellerId)
  );

  const { toggleWishlist, wishlist, createChat, makeOffer, followUser, currentUser } = useMarketStore();
  const isInWishlist = useMarketStore((state) => 
    params?.id ? state.wishlist.includes(params.id) : false
  );

  const isFollowing = seller && currentUser?.following.includes(seller.id);

  if (!product || !seller) return <NotFound />;

  const handleContact = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.id === product.sellerId) {
      toast({ title: "This is your item", variant: "destructive" });
      return;
    }
    
    const chatId = createChat(product.id, product.sellerId);
    setLocation(`/messages?chat=${chatId}`);
  };

  const handleOffer = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    makeOffer(product.id, Number(offerAmount));
    setIsOfferOpen(false);
    toast({ title: "Offer sent!", description: `You offered $${offerAmount}` });
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
                  {product.aiEstimatedPrice && (
                    <div className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                      <Wand2 className="h-3 w-3" />
                      AI Est: ${product.aiEstimatedPrice.min} - ${product.aiEstimatedPrice.max}
                    </div>
                  )}
                </div>
             </div>

             <div className="flex gap-3">
                <Button size="lg" className="flex-1 gap-2" onClick={handleContact}>
                   <MessageCircle className="h-5 w-5" /> Chat
                </Button>
                
                <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="secondary" className="flex-1 gap-2">
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
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The seller will be notified immediately. Payment is held in escrow until you verify the item in person.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleOffer}>Send Offer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="icon" onClick={() => toggleWishlist(product.id)}>
                   <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
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
                     <AvatarImage src={seller.avatar} />
                     <AvatarFallback>{seller.name[0]}</AvatarFallback>
                  </Avatar>
                  {seller.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>
                <div>
                   <p className="font-heading font-semibold text-lg">{seller.name}</p>
                   <div className="flex items-center gap-2">
                     {seller.isVerified && (
                       <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
                       </div>
                     )}
                     <span className="text-xs text-muted-foreground">
                       {seller.followers.length} followers
                     </span>
                   </div>
                </div>
             </div>
             <Button 
               variant={isFollowing ? "outline" : "default"} 
               size="sm"
               onClick={() => followUser(seller.id)}
             >
               {isFollowing ? "Unfollow" : "Follow"}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
