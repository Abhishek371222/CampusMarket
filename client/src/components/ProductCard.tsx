import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart, useFavorites } from "@/lib/store";
import { ShoppingCart, Star, Heart, Share2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [isFav, setIsFav] = useState(isFavorite(product.id));
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({ description: "Added to cart!" });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFav(!isFav);
    if (isFav) {
      removeFavorite(product.id);
      toast({ description: "Removed from saved items" });
    } else {
      addFavorite(product.id);
      toast({ description: "Added to saved items" });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `Check out this ${product.condition} ${product.title} on Campus Market for $${product.price}!`;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ description: "Share text copied to clipboard!" });
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden border border-slate-200 bg-white shadow-md hover:shadow-2xl hover:border-primary/30 rounded-3xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-primary to-accent text-white backdrop-blur-md border-0 shadow-lg font-semibold px-3 py-1.5 text-xs uppercase tracking-wider">
            {product.condition}
          </Badge>
          
          {/* Like, Share, and Profile buttons */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <Button
              onClick={handleToggleFavorite}
              size="icon"
              variant="secondary"
              className="rounded-full shadow-sm backdrop-blur-md bg-white/80 hover:bg-white h-9 w-9"
              data-testid={`button-like-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-accent text-accent' : ''}`} />
            </Button>
            <Button
              onClick={handleShare}
              size="icon"
              variant="secondary"
              className="rounded-full shadow-sm backdrop-blur-md bg-white/80 hover:bg-white h-9 w-9"
              data-testid={`button-share-${product.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/people/${product.sellerId}`;
              }}
              size="icon"
              variant="secondary"
              className="rounded-full shadow-sm backdrop-blur-md bg-white/80 hover:bg-white h-9 w-9 button-3d"
              data-testid={`button-seller-profile-${product.id}`}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>

          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Quick add overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <Button 
              onClick={handleAddToCart}
              size="lg" 
              className="rounded-full font-semibold shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-xs text-muted-foreground border-border/50 bg-secondary/30">
              {product.category}
            </Badge>
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className="w-3 h-3 fill-current mr-1" />
              {product.sellerRating}
            </div>
          </div>
          
          <h3 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              ${product.price}
            </span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{product.sellerName}</p>
              <p className="text-xs font-semibold text-primary">{product.condition}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}
