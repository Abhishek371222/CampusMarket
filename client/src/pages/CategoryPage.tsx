import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { pageTransition, staggerContainer, listItemVariants } from "@/lib/animations";
import ListingCard from "@/components/listings/ListingCard";
import ListingCardList from "@/components/listings/ListingCardList";
import FilterBar from "@/components/listings/FilterBar";
import ViewToggle from "@/components/listings/ViewToggle";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: "",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("newest");
  
  const itemsPerPage = 9;

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: [`/api/categories/${slug}`],
  });

  const { data: allListings, isLoading: listingsLoading, error } = useQuery({
    queryKey: ["/api/listings", { category: slug }],
  });
  
  const isLoading = categoryLoading || listingsLoading;
  
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
  }, [filters, sort, slug]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Category not found</h2>
        <p className="text-gray-600 mb-6">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <a href="/">Back to Home</a>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2D3748]">
          {categoryLoading ? (
            <div className="h-10 w-36 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            category?.name || "All Items"
          )}
        </h1>
        <p className="text-gray-600 mt-2">
          {categoryLoading ? (
            <div className="h-5 w-64 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            `Browse ${category?.itemCount || 0} items in this category`
          )}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any listings matching your criteria. Try adjusting your filters or check back later.
          </p>
          <Button
            onClick={() => setFilters({ minPrice: "", maxPrice: "", condition: "", location: "" })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
