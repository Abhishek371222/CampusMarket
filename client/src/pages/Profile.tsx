import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { pageTransition } from "@/lib/animations";
import { Settings, LogOut, Heart, ShoppingBag, MessageSquare, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ListingCard from "@/components/listings/ListingCard";
import SellerRating from "@/components/ui/SellerRating";

const Profile = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!user) {
    navigate("/");
    return null;
  }

  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/listings", { sellerId: user.id }],
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/reviews/seller/${user.id}`],
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="bg-white shadow-sm rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="bg-[#6B46C1] text-white text-3xl">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-[#2D3748]">{user.displayName}</h1>
            <p className="text-gray-500">{user.email}</p>
            
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-3">
              <div className="flex items-center">
                <ShoppingBag className="text-[#6B46C1] w-4 h-4 mr-1" />
                <span className="text-sm">{myListings?.length || 0} Listings</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="text-[#38B2AC] w-4 h-4 mr-1" />
                <span className="text-sm">Messages</span>
              </div>
              <div className="flex items-center">
                <Heart className="text-[#ED8936] w-4 h-4 mr-1" />
                <span className="text-sm">{favorites?.length || 0} Favorites</span>
              </div>
              <div className="flex items-center">
                <Star className="text-yellow-400 w-4 h-4 mr-1" />
                <span className="text-sm">{reviews?.length || 0} Reviews</span>
              </div>
            </div>
            
            {reviews?.length > 0 && (
              <div className="mt-2">
                <SellerRating rating={averageRating} showCount />
                <span className="ml-2 text-sm text-gray-500">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myListings?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any listings yet. Start selling your items now!
                </p>
                <Button asChild>
                  <a href="/create-listing">Create a Listing</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favoritesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't added any listings to your favorites yet. Browse the marketplace and save items you like!
                </p>
                <Button asChild>
                  <a href="/">Browse Listings</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {reviews?.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={review.reviewer?.avatar} alt={review.reviewer?.displayName} />
                          <AvatarFallback className="bg-[#6B46C1] text-white">
                            {review.reviewer?.displayName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{review.reviewer?.displayName || "Anonymous"}</CardTitle>
                          <CardDescription>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <SellerRating rating={review.rating} />
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</h3>
                <p className="text-gray-600">
                  You haven't received any reviews yet. Reviews will appear here after someone leaves feedback on your listings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;
