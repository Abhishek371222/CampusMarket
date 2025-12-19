import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, ShieldCheck, ArrowLeft, Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SellerRating } from "@/components/SellerRating";

export default function ProductDetailsPage() {
  const [match, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0");
  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb / Back */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <div className="relative rounded-3xl overflow-hidden bg-muted aspect-square shadow-sm border">
             {/* Category Tag */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-white/90 text-foreground backdrop-blur-md px-3 py-1.5 text-sm font-medium shadow-sm">
                {product.category}
              </Badge>
            </div>
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {product.condition}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> North Campus
                </span>
              </div>
              
              <h1 className="text-4xl font-display font-bold leading-tight mb-4 text-foreground">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold tracking-tight text-primary">
                  ${product.price}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>

            {/* Seller Card */}
            <SellerRating 
              sellerName={product.sellerName}
              rating={product.sellerRating}
              reviewCount={42}
              responseTime="< 2 hours"
            />

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-6">
              <Button 
                onClick={handleAddToCart}
                size="lg" 
                className="flex-1 h-14 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 w-14 p-0 rounded-xl"
                title="Save for later"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 w-14 p-0 rounded-xl"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-6 mt-4 pt-6 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span>Verified Student Seller</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span>Secure Meetup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products / Recommendations */}
        <div className="mt-20 pt-20 border-t">
          <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-2">
            <span>Similar Items</span>
            <span className="text-2xl">✨</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products - using same product for demo */}
            {[1, 2, 3, 4].map((idx) => (
              <Link key={idx} href={`/products/${product.id}`} className="group">
                <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] mb-3 relative">
                  <img 
                    src={product.image} 
                    alt="Related"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-primary font-bold text-sm mt-1">${product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
