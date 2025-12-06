import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/mockData";
import { formatDistanceToNow } from "date-fns";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden cursor-pointer h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card hover:border-primary/20">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.status !== "available" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md">
                {product.status}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-black shadow-sm">
              {product.condition}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
              {product.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="font-bold text-xl text-primary">${product.price}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center gap-2">
          <img 
            src={product.sellerAvatar} 
            alt={product.sellerName}
            className="w-6 h-6 rounded-full object-cover" 
          />
          <span className="text-sm text-muted-foreground truncate">
            {product.sellerName}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
