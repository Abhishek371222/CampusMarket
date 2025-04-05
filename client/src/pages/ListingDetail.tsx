import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { pageTransition, staggerContainer, listItemVariants } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock, MapPin, Share, MessageSquare, FileText } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import SellerRating from "@/components/ui/SellerRating";
import UrgentBadge from "@/components/ui/UrgentBadge";
import ListingCard from "@/components/listings/ListingCard";

const ListingDetail = () => {
  const { id } = useParams();
  const listingId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  const { data: listing, isLoading, error } = useQuery({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !isNaN(listingId),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to favorite listings");
      }

      if (listing.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${listingId}`);
      } else {
        await apiRequest("POST", `/api/favorites/${listingId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: listing.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: listing.isFavorite 
          ? "This listing has been removed from your favorites" 
          : "This listing has been added to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to send messages");
      }

      await apiRequest("POST", "/api/messages", {
        receiverId: listing.seller.id,
        listingId: listing.id,
        content: messageContent,
      });
    },
    onSuccess: () => {
      setContactDialogOpen(false);
      setMessageContent("");
      
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${listing.seller.displayName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to submit a review");
      }

      await apiRequest("POST", "/api/reviews", {
        sellerId: listing.seller.id,
        listingId: listing.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
    },
    onSuccess: () => {
      setReviewDialogOpen(false);
      setReviewData({ rating: 5, comment: "" });
      
      toast({
        title: "Review submitted",
        description: `Your review for ${listing.seller.displayName} has been submitted`,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleContactSeller = (e) => {
    e.preventDefault();
    sendMessageMutation.mutate();
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    submitReviewMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this listing: ${listing.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Failed to share', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "Share this link with your friends",
        });
      });
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <Skeleton className="w-full h-[400px] rounded-xl" />
          </div>
          <div className="md:w-1/3 space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-1/3 h-10" />
            <Skeleton className="w-full h-40" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Unable to load listing
        </h2>
        <p className="text-gray-600 mb-6">
          The listing you're looking for might have been removed or is temporarily unavailable.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="pb-12"
    >
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Images & Details */}
          <div className="md:w-2/3">
            {/* Images Carousel */}
            <Carousel className="mb-6 rounded-xl overflow-hidden shadow-lg">
              <CarouselContent>
                {listing.images && listing.images.length > 0 ? (
                  listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[16/9] relative">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && listing.isUrgent && (
                          <div className="absolute top-4 left-4">
                            <UrgentBadge />
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-[16/9] flex items-center justify-center bg-gray-100 text-gray-400">
                      No images available
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {listing.images && listing.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>

            {/* Listing Details */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748]">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className="capitalize"
                      variant={listing.condition === "new" ? "default" : "secondary"}
                    >
                      {listing.condition}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {listing.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    Listed on {formatDate(listing.createdAt)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#6B46C1] mb-4">
                  ${listing.price.toFixed(2)}
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{listing.description}</p>
                </div>
              </div>

              {/* Attachments (if any) */}
              {listing.attachments && listing.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {listing.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                      >
                        <FileText className="h-5 w-5 mr-2 text-[#6B46C1]" />
                        <span className="text-[#2D3748] font-medium">
                          {attachment.split('/').pop()}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons for mobile */}
              <div className="flex flex-wrap gap-3 md:hidden">
                {user && user.id !== listing.seller.id && (
                  <>
                    <Button className="flex-1" onClick={() => setContactDialogOpen(true)}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                    </Button>
                    <Button
                      variant={listing.isFavorite ? "secondary" : "outline"}
                      className={listing.isFavorite ? "bg-pink-50 text-pink-600" : ""}
                      onClick={() => toggleFavoriteMutation.mutate()}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${listing.isFavorite ? "fill-current" : ""}`}
                      />
                      {listing.isFavorite ? "Saved" : "Save"}
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>

            {/* Related Listings */}
            {listing.relatedListings && listing.relatedListings.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#2D3748] mb-4">Similar Items</h2>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {listing.relatedListings.slice(0, 2).map((relatedListing) => (
                    <motion.div key={relatedListing.id} variants={listItemVariants}>
                      <ListingCard listing={relatedListing} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </div>

          {/* Right Column - Seller Info & Contact */}
          <div className="md:w-1/3">
            {/* Seller Information */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={listing.seller.avatar} alt={listing.seller.displayName} />
                    <AvatarFallback className="bg-[#6B46C1] text-white">
                      {listing.seller.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">{listing.seller.displayName}</p>
                    <div className="flex items-center">
                      <SellerRating rating={listing.sellerRating} showCount />
                      <span className="text-sm text-gray-500 ml-1">
                        ({listing.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Member since {formatDate(listing.seller.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Desktop) */}
            <div className="hidden md:block space-y-3 mb-4">
              {user && user.id !== listing.seller.id && (
                <>
                  <Button className="w-full" onClick={() => setContactDialogOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                  </Button>
                  <Button
                    variant={listing.isFavorite ? "secondary" : "outline"}
                    className={`w-full ${listing.isFavorite ? "bg-pink-50 text-pink-600" : ""}`}
                    onClick={() => toggleFavoriteMutation.mutate()}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${listing.isFavorite ? "fill-current" : ""}`}
                    />
                    {listing.isFavorite ? "Saved" : "Save to Favorites"}
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" /> Share Listing
              </Button>
              {user && user.id !== listing.seller.id && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setReviewDialogOpen(true)}
                >
                  Leave a Review
                </Button>
              )}
            </div>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-1 mr-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span>Meet in public, well-lit places on campus</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-1 mr-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span>Inspect the item before paying</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-1 mr-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span>Use campus payment apps when possible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-1 mr-2 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span>Tell a friend where you're meeting</span>
                  </li>
                </ul>
                <Button variant="link" className="text-[#6B46C1] p-0 mt-2 h-auto">
                  View all safety tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>
              Send a message to {listing.seller.displayName} about this listing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSeller}>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={listing.seller.avatar} alt={listing.seller.displayName} />
                  <AvatarFallback className="bg-[#6B46C1] text-white">
                    {listing.seller.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{listing.seller.displayName}</div>
                </div>
              </div>
              <div>
                <Textarea
                  placeholder="Write your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                  required
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageContent.trim()}
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Seller</DialogTitle>
            <DialogDescription>
              Share your experience with {listing.seller.displayName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit}>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={listing.seller.avatar} alt={listing.seller.displayName} />
                  <AvatarFallback className="bg-[#6B46C1] text-white">
                    {listing.seller.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{listing.seller.displayName}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= reviewData.rating ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-gray-300">★</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this seller..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ListingDetail;
