import { useAuth } from "@/lib/auth";
import { useMarketStore } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ui/product-card";
import { useLocation } from "wouter";
import { Mail, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const products = useMarketStore((state) => state.products);
  const wishlistIds = useMarketStore((state) => state.wishlist);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const myListings = products.filter((p) => p.sellerId === user.id);
  const wishlistItems = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="text-3xl font-heading font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Student
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="listings" 
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            My Listings ({myListings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="wishlist" 
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Wishlist ({wishlistItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings" className="mt-6">
          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {myListings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground mb-4">You haven't listed any items yet.</p>
              <Button onClick={() => setLocation("/sell")}>Start Selling</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="wishlist" className="mt-6">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">Your wishlist is empty.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
