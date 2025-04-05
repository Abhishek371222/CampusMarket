import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "../listings/ListingCard";
import SkeletonCard from "../ui/SkeletonCard";
import { staggerContainer, listItemVariants } from "@/lib/animations";

const FeaturedListings = () => {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["/api/listings", { limit: 4 }],
  });

  if (error) {
    return (
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D3748]">Featured Items</h2>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
          Failed to load featured listings. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-[#2D3748]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Items
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/" className="text-[#6B46C1] hover:underline font-medium">
            View All
          </Link>
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <motion.div key={i} variants={listItemVariants}>
                  <SkeletonCard />
                </motion.div>
              ))
          : listings?.map((listing) => (
              <motion.div key={listing.id} variants={listItemVariants}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
      </motion.div>
    </section>
  );
};

export default FeaturedListings;
