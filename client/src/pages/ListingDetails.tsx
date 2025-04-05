import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Listing, User } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fadeIn, fadeInUp, useUserContext } from "@/components/ui/animations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, MessageSquare, File, FileText, Star, ExternalLink, AlertTriangle, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch listing details
  const { data: listing, isLoading: isListingLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${id}`],
  });

  // Fetch seller information
  const { data: seller, isLoading: isSellerLoading } = useQuery<User>({
    queryKey: [`/api/users/${listing?.userId}`],
    enabled: !!listing?.userId,
  });

  // Fetch seller reviews
  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: [`/api/users/${listing?.userId}/reviews`],
    enabled: !!listing?.userId,
  });

  // Check if listing is saved
  const { data: savedStatus, isLoading: isSavedStatusLoading } = useQuery({
    queryKey: [`/api/saved-listings/check/${id}`],
    enabled: !!user,
  });

  // Save listing mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved-listings", { 
        userId: user?.id,
        listingId: parseInt(id)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/saved-listings/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-listings'] });
      toast({
        title: "Listing saved",
        description: "This listing has been added to your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unsave listing mutation
  const unsaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/saved-listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/saved-listings/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-listings'] });
      toast({
        title: "Listing removed",
        description: "This listing has been removed from your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle save/unsave toggle
  const handleSaveToggle = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save listings.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (savedStatus?.isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  // Start conversation with seller
  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact the seller.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.id === listing?.userId) {
      toast({
        title: "Cannot message yourself",
        description: "This is your own listing.",
      });
      return;
    }

    navigate(`/messages/${listing?.userId}/${id}`);
  };

  const getSellerRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  if (isListingLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 w-full rounded-lg mb-4" />
            <div className="flex gap-2 mb-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-60 w-full rounded-lg mb-4" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
        <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      className="container mx-auto px-4 py-6"
    >
      {/* Back button */}
      <motion.div variants={fadeInUp} custom={0}>
        <Link href="/">
          <Button variant="ghost" className="mb-4 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div variants={fadeInUp} custom={1}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-500">{formatDate(listing.createdAt)}</span>
              {listing.isUrgent && (
                <Badge variant="destructive">URGENT</Badge>
              )}
              <Badge>{listing.category}</Badge>
            </div>

            {/* Image carousel */}
            <Carousel className="mb-6 w-full">
              <CarouselContent>
                {listing.images.map((image, i) => (
                  <CarouselItem key={i}>
                    <div className="aspect-video bg-muted">
                      <img 
                        src={image} 
                        alt={`${listing.title} - Image ${i+1}`} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Tabs for details and seller reviews */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Seller Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                        <p className="text-gray-900 capitalize">{listing.condition}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="text-gray-900">{listing.location}</p>
                      </div>
                    </div>
                    
                    {listing.pdfUrl && (
                      <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-medium">Additional document</h3>
                            <a 
                              href={listing.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                              View document <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Seller Reviews</h2>
                    
                    {isReviewsLoading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No reviews yet for this seller.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <div>
          <motion.div variants={fadeInUp} custom={2}>
            {/* Price and action buttons */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-primary mb-2">{formatPrice(listing.price)}</h2>
                  {listing.isSold ? (
                    <Badge variant="secondary" className="text-sm">SOLD</Badge>
                  ) : (
                    <p className="text-gray-500 text-sm">Available for purchase</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleContactSeller}
                    className="w-full"
                    disabled={listing.isSold || (user?.id === listing.userId)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSaveToggle}
                    disabled={isSavedStatusLoading || saveMutation.isPending || unsaveMutation.isPending}
                  >
                    {savedStatus?.isSaved ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Save Listing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
                
                {isSellerLoading ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ) : seller ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.profileImage} alt={seller.username} />
                        <AvatarFallback>{seller.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{seller.fullName}</h3>
                        <p className="text-sm text-gray-500">@{seller.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${i < getSellerRating() ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{reviews ? `(${reviews.length})` : ''}</span>
                    </div>
                    
                    {seller.bio && (
                      <p className="text-sm text-gray-700 mb-4">{seller.bio}</p>
                    )}
                    
                    <Link href={`/profile/${seller.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">Seller information not available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetails;
