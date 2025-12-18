import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store";
import { ShoppingCart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
          <Badge className="absolute top-3 left-3 z-10 bg-white/90 text-foreground backdrop-blur-md hover:bg-white border-0 shadow-sm font-medium px-2.5 py-1">
            {product.condition}
          </Badge>
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
            <div className="text-xs text-muted-foreground text-right">
              Sold by<br/>
              <span className="font-medium text-foreground">{product.sellerName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
