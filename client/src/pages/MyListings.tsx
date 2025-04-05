import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { pageTransition, staggerContainer, listItemVariants } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UrgentBadge from "@/components/ui/UrgentBadge";

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [listingToDelete, setListingToDelete] = useState(null);

  // Redirect if not logged in
  if (!user) {
    navigate("/");
    return null;
  }

  const { data: myListings, isLoading, error } = useQuery({
    queryKey: ["/api/listings", { sellerId: user.id }],
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully.",
      });
      setListingToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = () => {
    if (listingToDelete) {
      deleteMutation.mutate(listingToDelete);
    }
  };

  // Filter listings based on active tab
  const filteredListings = myListings
    ? myListings.filter((listing) => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return true; // In a real app, there would be a status field
        if (activeTab === "sold") return false; // In a real app, there would be a status field
        return true;
      })
    : [];

  if (isLoading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">My Listings</h1>
          <Button asChild>
            <Link href="/create-listing">
              <Plus className="mr-2 h-4 w-4" /> Create Listing
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-lg"></div>
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to load listings</h2>
        <p className="text-gray-600 mb-6">
          There was an error loading your listings. Please try again later.
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/listings"] })}>
          Try Again
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
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2D3748]">My Listings</h1>
        <Button asChild>
          <Link href="/create-listing">
            <Plus className="mr-2 h-4 w-4" /> Create Listing
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({myListings?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({myListings?.length || 0})</TabsTrigger>
          <TabsTrigger value="sold">Sold (0)</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredListings.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredListings.map((listing) => (
            <motion.div key={listing.id} variants={listItemVariants}>
              <Card className="overflow-hidden">
                <div className="relative">
                  <Link href={`/listing/${listing.id}`}>
                    <div className="h-40 bg-gray-100">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  {listing.isUrgent && (
                    <div className="absolute top-2 left-2">
                      <UrgentBadge />
                    </div>
                  )}
                  {listing.condition === "new" && (
                    <Badge className="absolute top-2 right-2 bg-[#38B2AC]">
                      NEW
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Link href={`/listing/${listing.id}`} className="block">
                      <CardTitle className="text-lg leading-tight hover:text-[#6B46C1] transition-colors">
                        {listing.title}
                      </CardTitle>
                    </Link>
                    <span className="font-bold text-lg text-[#6B46C1]">
                      ${listing.price.toFixed(2)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-1">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
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
                    <div className="flex items-center">
                      <Badge variant="outline" className="border-gray-200 text-gray-500 font-normal">
                        {listing.condition}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/create-listing?edit=${listing.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setListingToDelete(listing.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          listing and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setListingToDelete(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteListing}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any listings yet. Start selling your items now!
          </p>
          <Button asChild>
            <Link href="/create-listing">
              <Plus className="mr-2 h-4 w-4" /> Create Your First Listing
            </Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyListings;
