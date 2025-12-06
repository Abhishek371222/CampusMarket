import { useAuth } from "@/lib/auth";
import { useMarketStore } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ui/product-card";
import { useLocation } from "wouter";
import { Mail, Settings, LogOut, ShieldCheck, CheckCircle2, Upload, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { products, wishlist, submitVerification } = useMarketStore();
  const { toast } = useToast();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const myListings = products.filter((p) => p.sellerId === user.id);
  const wishlistItems = products.filter((p) => wishlist.includes(p.id));

  const handleVerify = () => {
    submitVerification();
    toast({
      title: "Documents Uploaded",
      description: "Admin will review your student ID shortly.",
    });
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
           <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          {user.isVerified && (
            <div className="absolute bottom-0 right-0 bg-background rounded-full p-1 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-green-500 fill-white" />
            </div>
          )}
        </div>
        
        <div className="text-center md:text-left space-y-3 flex-1">
          <div>
            <h1 className="text-3xl font-heading font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">Student</Badge>
            {user.isVerified ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-transparent">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified ID
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                Unverified
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
               <Users className="h-3 w-3 mr-1" /> {user.following.length} Following
            </Badge>
          </div>

          {!user.isVerified && user.verificationStatus !== "pending" && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">Verify your Student Status</h4>
              <p className="text-amber-700 text-xs mb-3">Upload your student ID to unlock all marketplace features.</p>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100" onClick={handleVerify}>
                <Upload className="h-4 w-4 mr-2" /> Upload ID
              </Button>
            </div>
          )}

          {user.verificationStatus === "pending" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
               <p className="text-blue-700 text-sm flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" /> Verification Pending Approval
               </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => logout()}>
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
