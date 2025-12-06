import { useRoute, useLocation } from "wouter";
import { useMarketStore } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const product = useMarketStore((state) => 
    state.products.find((p) => p.id === params?.id)
  );

  const toggleWishlist = useMarketStore((state) => state.toggleWishlist);
  const isInWishlist = useMarketStore((state) => 
    params?.id ? state.wishlist.includes(params.id) : false
  );
  const createChat = useMarketStore((state) => state.createChat);

  if (!product) return <NotFound />;

  const handleContact = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (user.id === product.sellerId) {
      toast({
        title: "This is your item",
        description: "You cannot message yourself.",
        variant: "destructive",
      });
      return;
    }
    
    const chatId = createChat(product.id, product.sellerId);
    setLocation(`/messages?chat=${chatId}`);
  };

  const handleWishlist = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    toggleWishlist(product.id);
    toast({
      title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
             {/* Placeholder for multiple images if supported later */}
             <div className="aspect-square bg-muted rounded-lg overflow-hidden border cursor-pointer ring-2 ring-primary">
                <img src={product.images[0]} className="w-full h-full object-cover" />
             </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
             <div className="flex items-center justify-between mb-4">
               <Badge>{product.category}</Badge>
               <span className="text-sm text-muted-foreground">
                 Posted {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
               </span>
             </div>
             <h1 className="text-4xl font-heading font-bold mb-2">{product.title}</h1>
             <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-primary">${product.price}</p>
                <div className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={handleWishlist}>
                      <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                   </Button>
                   <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                   </Button>
                </div>
             </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
            <h3 className="font-heading font-semibold text-lg">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold">Condition</span>
                <span className="font-medium">{product.condition}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground uppercase font-bold">Status</span>
                 <span className="font-medium capitalize">{product.status}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                   <AvatarImage src={product.sellerAvatar} />
                   <AvatarFallback>{product.sellerName[0]}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="font-heading font-semibold">{product.sellerName}</p>
                   <div className="flex items-center text-xs text-green-600">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
                   </div>
                </div>
             </div>
             <Button size="lg" className="gap-2" onClick={handleContact}>
                <MessageCircle className="h-5 w-5" /> Contact Seller
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
