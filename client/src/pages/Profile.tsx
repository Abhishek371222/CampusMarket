import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ui/product-card";
import { useLocation } from "wouter";
import { LogOut, ShieldCheck, CheckCircle2, Users, Loader2, Pencil, Upload, Clock, XCircle, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts, useFollowing, useVerificationStatus, useUploadVerification, useOrders } from "@/lib/api-hooks";
import { useState, useRef } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: following, isLoading: followingLoading } = useFollowing(user?.id);
  const { data: verification, isLoading: verificationLoading } = useVerificationStatus();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const uploadVerificationMutation = useUploadVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const myListings = products?.filter((p) => p.sellerId === user.id) || [];
  const followingCount = following?.length || 0;
  const myOrders = orders || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadVerification = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentType", "college_id");
    
    try {
      await uploadVerificationMutation.mutateAsync(formData);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Document uploaded", description: "Your ID is pending review" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative">
           <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
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
            <Badge variant="outline" className="text-muted-foreground" data-testid="badge-following">
               <Users className="h-3 w-3 mr-1" /> 
               {followingLoading ? "..." : followingCount} Following
            </Badge>
          </div>

          {verification?.status === "pending" && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg max-w-md">
               <p className="text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Verification Pending Approval
               </p>
            </div>
          )}
          {verification?.status === "rejected" && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg max-w-md">
               <p className="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                 <XCircle className="h-4 w-4" /> Verification Rejected
                 {verification.notes && <span className="ml-2">- {verification.notes}</span>}
               </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button onClick={() => setLocation("/profile/edit")} data-testid="button-edit-profile">
            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
          <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="w-full justify-start flex-wrap gap-1 border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="listings" 
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            data-testid="tab-listings"
          >
            My Listings ({productsLoading ? "..." : myListings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            data-testid="tab-orders"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders ({ordersLoading ? "..." : myOrders.length})
          </TabsTrigger>
          {!user.isVerified && (
            <TabsTrigger 
              value="verification" 
              className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              data-testid="tab-verification"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Get Verified
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="listings" className="mt-6">
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {myListings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground mb-4">You haven't listed any items yet.</p>
              <Button onClick={() => setLocation("/sell")} data-testid="button-start-selling">Start Selling</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex-1">
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${order.amount} - {order.status}
                      </p>
                    </div>
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation(`/orders`)}
                      data-testid={`button-view-order-${order.id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet.</p>
              <Button onClick={() => setLocation("/market")} data-testid="button-browse-market">Browse Marketplace</Button>
            </div>
          )}
        </TabsContent>

        {!user.isVerified && (
          <TabsContent value="verification" className="mt-6">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Student ID Verification
                </CardTitle>
                <CardDescription>
                  Upload your college or university ID to become a verified student. This helps build trust with other users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verification?.status === "pending" ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Your verification is pending review. We'll notify you once it's approved.
                    </p>
                  </div>
                ) : verification?.status === "rejected" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Your previous submission was rejected.
                        {verification.notes && <span className="block mt-1 text-sm">{verification.notes}</span>}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id-document">Upload a new document</Label>
                      <Input
                        id="id-document"
                        type="file"
                        accept="image/*,.pdf"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        data-testid="input-verification-document"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                      )}
                    </div>
                    <Button 
                      onClick={handleUploadVerification}
                      disabled={!selectedFile || uploadVerificationMutation.isPending}
                      data-testid="button-upload-verification"
                    >
                      {uploadVerificationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Resubmit Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="id-document">Upload your student ID</Label>
                      <Input
                        id="id-document"
                        type="file"
                        accept="image/*,.pdf"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        data-testid="input-verification-document"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your ID will be reviewed by our team. Accepted formats: JPG, PNG, PDF.
                    </p>
                    <Button 
                      onClick={handleUploadVerification}
                      disabled={!selectedFile || uploadVerificationMutation.isPending}
                      data-testid="button-upload-verification"
                    >
                      {uploadVerificationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
