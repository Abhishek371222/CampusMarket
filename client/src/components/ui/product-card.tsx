import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="h-full"
      >
        <Card className="group overflow-visible cursor-pointer h-full hover:shadow-xl transition-shadow duration-300 border-border/50 bg-card hover:border-primary/20">
          <div className="aspect-square relative overflow-hidden bg-muted rounded-t-lg">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.status !== "available" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md">
                  {product.status}
                </span>
              </div>
            )}
            <motion.div 
              className="absolute top-2 right-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-black shadow-sm">
                {product.condition}
              </Badge>
            </motion.div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
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
            <p className="font-bold text-xl text-primary">
              ${product.price}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
