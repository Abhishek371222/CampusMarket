import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "../listings/ListingCard";
import ListingCardList from "../listings/ListingCardList";
import FilterBar from "../listings/FilterBar";
import ViewToggle from "../listings/ViewToggle";
import SkeletonCard from "../ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { staggerContainer, listItemVariants, fadeIn } from "@/lib/animations";

const RecentListings = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("newest");
  
  const itemsPerPage = 6;

  const { data: allListings, isLoading, error } = useQuery({
    queryKey: ["/api/listings"],
  });
  
  // Filter and sort listings
  const filteredListings = allListings
    ? allListings.filter((listing) => {
        let matchesFilters = true;
        
        if (filters.minPrice && listing.price < parseFloat(filters.minPrice)) {
          matchesFilters = false;
        }
        
        if (filters.maxPrice && listing.price > parseFloat(filters.maxPrice)) {
          matchesFilters = false;
        }
        
        if (filters.condition && listing.condition !== filters.condition) {
          matchesFilters = false;
        }
        
        if (filters.location && listing.location !== filters.location) {
          matchesFilters = false;
        }
        
        return matchesFilters;
      })
    : [];

  const sortedListings = [...(filteredListings || [])].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Paginate listings
  const totalPages = Math.ceil((sortedListings?.length || 0) / itemsPerPage);
  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById("recent-listings")?.offsetTop - 100, behavior: "smooth" });
  };

  if (error) {
    return (
      <section id="recent-listings" className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D3748]">Recent Listings</h2>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
          Failed to load listings. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section id="recent-listings" className="mb-10">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#2D3748]">Recent Listings</h2>
        <div className="flex items-center">
          <label htmlFor="sort-select" className="mr-2 text-sm text-gray-500">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="text-sm border-gray-300 rounded-md focus:border-[#6B46C1] focus:ring focus:ring-[#6B46C1]/20 focus:ring-opacity-50"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <FilterBar onApplyFilters={handleApplyFilters} />
      </motion.div>

      <motion.div 
        className="flex justify-end mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ViewToggle view={view} onViewChange={setView} />
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {Array(6).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : view === "grid" ? (
          <motion.div 
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
          >
            {paginatedListings.length > 0 ? (
              paginatedListings.map((listing) => (
                <motion.div key={listing.id} variants={listItemVariants}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-3 py-10 text-center text-gray-500"
                variants={fadeIn}
              >
                No listings match your filters. Try adjusting your search criteria.
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
          >
            {paginatedListings.length > 0 ? (
              paginatedListings.map((listing) => (
                <motion.div key={listing.id} variants={listItemVariants}>
                  <ListingCardList listing={listing} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="py-10 text-center text-gray-500"
                variants={fadeIn}
              >
                No listings match your filters. Try adjusting your search criteria.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <nav className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-gray-500 hover:bg-[#6B46C1] hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber = i + 1;
              
              // Logic for showing proper page numbers when there are many pages
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  className={pageNumber === currentPage ? "bg-[#6B46C1] text-white" : "text-gray-700 hover:bg-gray-100"}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-3 py-2 text-gray-500">...</span>
                <Button
                  variant="outline"
                  className="text-gray-700 hover:bg-gray-100"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-gray-500 hover:bg-[#6B46C1] hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </motion.div>
      )}
    </section>
  );
};

export default RecentListings;
