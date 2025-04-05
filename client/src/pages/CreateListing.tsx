import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { pageTransition } from "@/lib/animations";
import ListingForm from "@/components/listings/ListingForm";

const CreateListing = () => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Get edit ID from query parameters if available
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  
  // Fetch listing data if in edit mode
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: [`/api/listings/${editId}`],
    enabled: !!editId,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#2D3748] mb-6">
          {editId ? "Edit Listing" : "Create New Listing"}
        </h1>
        
        <ListingForm isEditing={!!editId} listing={listing} isLoading={listingLoading} />
      </div>
    </motion.div>
  );
};

export default CreateListing;
