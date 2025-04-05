import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UrgentBadge from "@/components/ui/UrgentBadge";
import SellerRating from "@/components/ui/SellerRating";

const ListingCardList = ({ listing }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(listing.isFavorite || false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to favorite listings");
      }

      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${listing.id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${listing.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
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

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInDays === 0) {
      return diffInHours === 0 
        ? "Just now" 
        : `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 relative">
          <Link href={`/listing/${listing.id}`}>
            <div className="relative h-48 md:h-full">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  No image available
                </div>
              )}
              {listing.isUrgent && (
                <div className="absolute top-3 left-3">
                  <UrgentBadge />
                </div>
              )}
            </div>
          </Link>
          <button
            className={`absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:text-[#6B46C1] transition-colors ${
              isFavorite ? "text-[#6B46C1]" : ""
            }`}
            onClick={handleFavoriteToggle}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={isFavorite ? "fill-current" : ""} size={16} />
          </button>
        </div>
        <div className="p-4 md:w-3/4">
          <Link href={`/listing/${listing.id}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-xl">{listing.title}</h3>
              <span className="font-bold text-xl text-[#6B46C1] ml-2">
                ${listing.price.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {listing.description}
            </p>
            <div className="flex items-center mt-3 mb-3">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={listing.seller?.avatar} alt={listing.seller?.displayName} />
                <AvatarFallback className="bg-[#6B46C1] text-white text-xs">
                  {listing.seller?.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700">
                {listing.seller?.displayName || "Unknown seller"}
              </span>
              <div className="ml-4">
                <SellerRating rating={listing.sellerRating} />
              </div>
            </div>
          </Link>
          <div className="flex flex-wrap gap-3 items-center justify-between mt-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {listing.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDate(listing.createdAt)}
              </div>
              <Badge variant="outline" className="capitalize text-gray-700">
                {listing.condition}
              </Badge>
            </div>
            <Button asChild size="sm">
              <Link href={`/listing/${listing.id}`}>
                Contact Seller
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCardList;
