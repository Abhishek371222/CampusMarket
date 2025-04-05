import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import CategoryNav from "@/components/listing/CategoryNav";
import FilterSection from "@/components/listing/FilterSection";
import ListingCard from "@/components/listing/ListingCard";
import ListingCardSkeleton from "@/components/listing/ListingCardSkeleton";
import { Listing } from "@/lib/types";
import { fadeIn, staggerContainer, fadeInUp } from "@/components/ui/animations";
import { Link } from "wouter";

type HomeProps = {};

const Home: React.FC<HomeProps> = () => {
  const [filters, setFilters] = useState({
    category: "",
    searchQuery: "",
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    condition: "",
    location: ""
  });

  // Fetch featured listings
  const { data: featuredListings, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['/api/listings/featured'],
  });

  // Fetch recent listings
  const { data: recentListings, isLoading: isRecentLoading } = useQuery({
    queryKey: ['/api/listings/recent'],
  });

  // Fetch filtered listings
  const { data: filteredListings, isLoading: isFilteredLoading, refetch: refetchFiltered } = useQuery({
    queryKey: ['/api/listings', filters],
    enabled: false, // Don't fetch automatically, we'll trigger manually
  });

  // Apply filters
  const handleFilterApply = () => {
    // Construct query string from filters
    let queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.searchQuery) queryParams.append('searchQuery', filters.searchQuery);
    if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
    if (filters.condition) queryParams.append('condition', filters.condition);
    if (filters.location) queryParams.append('location', filters.location);
    
    // Refetch with new filters
    refetchFiltered();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      category: "",
      searchQuery: "",
      priceMin: undefined,
      priceMax: undefined,
      condition: "",
      location: ""
    });
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      className="min-h-screen bg-background"
    >
      <CategoryNav 
        selectedCategory={filters.category}
        onCategorySelect={(category) => setFilters({...filters, category})}
      />
      
      <div className="container mx-auto px-4 py-4">
        <FilterSection 
          filters={filters}
          onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})}
          onApplyFilters={handleFilterApply}
          onClearFilters={handleClearFilters}
        />
        
        {/* Show filtered results if filters have been applied */}
        {filteredListings && (
          <motion.div 
            className="mb-8"
            variants={staggerContainer}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-textColor">Search Results</h2>
              <span className="text-sm text-gray-500">{filteredListings.length} items found</span>
            </div>
            
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing: Listing, index: number) => (
                  <motion.div key={listing.id} variants={fadeInUp} custom={index}>
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Featured Listings */}
        <motion.div 
          className="mb-8"
          variants={staggerContainer}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textColor">Featured Listings</h2>
            <Link href="/listings?featured=true" className="text-primary font-medium text-sm">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isFeaturedLoading ? (
              Array(4).fill(0).map((_, index) => (
                <ListingCardSkeleton key={`featured-skeleton-${index}`} />
              ))
            ) : (
              featuredListings?.map((listing: Listing, index: number) => (
                <motion.div key={listing.id} variants={fadeInUp} custom={index}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
        
        {/* Promo Section */}
        <motion.div 
          className="mb-8 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-md overflow-hidden"
          variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-10 text-white md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Got something to sell?</h2>
              <p className="mb-6 opacity-90">Post your first listing in less than 2 minutes and reach thousands of students on campus.</p>
              <Link href="/create-listing">
                <motion.button 
                  whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ y: 0 }}
                  className="bg-white text-primary font-semibold px-6 py-3 rounded-lg shadow hover:shadow-lg transition duration-200"
                >
                  Post Your Item Now
                </motion.button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Students with laptops" 
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Recent Listings */}
        <motion.div 
          className="mb-8"
          variants={staggerContainer}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textColor">Recent Listings</h2>
            <Link href="/listings?sort=recent" className="text-primary font-medium text-sm">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isRecentLoading ? (
              Array(4).fill(0).map((_, index) => (
                <ListingCardSkeleton key={`recent-skeleton-${index}`} />
              ))
            ) : (
              recentListings?.map((listing: Listing, index: number) => (
                <motion.div key={listing.id} variants={fadeInUp} custom={index}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
        
        {/* Popular Searches */}
        <motion.div 
          className="mb-8"
          variants={fadeInUp}
          custom={3}
        >
          <h2 className="text-xl font-bold text-textColor mb-4">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/listings?searchQuery=textbooks">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Textbooks
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=desk">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Desk
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=iphone">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                iPhone
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=bicycle">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Bicycle
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=laptop">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Laptop
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=microwave">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Microwave
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=mini+fridge">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Mini Fridge
              </motion.span>
            </Link>
            <Link href="/listings?searchQuery=calculator">
              <motion.span 
                whileHover={{ y: -2, backgroundColor: "#f8f9fa" }}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
              >
                Calculator
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
