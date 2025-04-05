import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { pageTransition, staggerContainer, listItemVariants } from "@/lib/animations";
import ListingCard from "@/components/listings/ListingCard";
import ListingCardList from "@/components/listings/ListingCardList";
import FilterBar from "@/components/listings/FilterBar";
import ViewToggle from "@/components/listings/ViewToggle";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: "any",
    location: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  
  const itemsPerPage = 9;

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, []);

  const { data: allListings, isLoading, error } = useQuery({
    queryKey: ["/api/listings", { search: searchQuery }],
    enabled: !!searchQuery,
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
        
        // Check condition filter, skipping if "any" is selected
        if (filters.condition && filters.condition !== "any" && listing.condition !== filters.condition) {
          matchesFilters = false;
        }
        
        // Check location filter, skipping if "all" is selected
        if (filters.location && filters.location !== "all" && listing.location !== filters.location) {
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
  }, [filters, sort, searchQuery]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2D3748]">
          Search Results
        </h1>
        <p className="text-gray-600 mt-2">
          {isLoading
            ? "Searching..."
            : searchQuery
            ? `${sortedListings.length} results for "${searchQuery}"`
            : "Enter a search term to find items"}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <FilterBar onApplyFilters={handleApplyFilters} />
      </motion.div>

      <div className="flex justify-between items-center mb-4">
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
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {isLoading ? (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Array(6).fill(0).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !searchQuery ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <SearchIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter a search term</h3>
          <p className="text-gray-600">
            Use the search bar at the top of the page to find items
          </p>
        </div>
      ) : paginatedListings.length > 0 ? (
        <>
          {view === "grid" ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {paginatedListings.map((listing) => (
                <motion.div key={listing.id} variants={listItemVariants}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {paginatedListings.map((listing) => (
                <motion.div key={listing.id} variants={listItemVariants}>
                  <ListingCardList listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
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
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any listings matching "{searchQuery}".
            Try using different keywords or adjusting your filters.
          </p>
          <Button
            onClick={() => setFilters({ minPrice: "", maxPrice: "", condition: "any", location: "all" })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Search;
