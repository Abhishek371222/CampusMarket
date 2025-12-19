import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { Search, FilterX, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import clsx from "clsx";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AllProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [condition, setCondition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "rating">("newest");
  const [showFilters, setShowFilters] = useState(true);

  const { data: products, isLoading } = useProducts(selectedCategory === "all" ? undefined : selectedCategory);

  let filteredProducts = products?.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = parseFloat(p.price) >= priceRange.min && parseFloat(p.price) <= priceRange.max;
    const matchesCondition = !condition || p.condition === condition;
    return matchesSearch && matchesPrice && matchesCondition;
  }) || [];

  // Sort products
  if (sortBy === "price-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === "price-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortBy === "rating") {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const ratingA = typeof a.sellerRating === 'string' ? parseFloat(a.sellerRating) : 0;
      const ratingB = typeof b.sellerRating === 'string' ? parseFloat(b.sellerRating) : 0;
      return ratingB - ratingA;
    });
  }

  const conditions = ["New", "Used - Like New", "Used - Good", "Used - Fair"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-slate-900 via-primary/20 to-background py-16 border-b border-slate-200"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Explore Our Marketplace</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-display font-black text-white mb-3 leading-tight">
                Discover <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Everything</span>
              </h1>
              <p className="text-xl text-white/80 font-medium">
                Browse {filteredProducts.length} items on Campus Market
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-primary/20 focus:border-primary"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl"
                >
                  <FilterX className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
              "lg:col-span-1",
              !showFilters && "hidden lg:block"
            )}
          >
            <div className="space-y-6 sticky top-40">
              {/* Toggle Filters on Mobile */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Sliders className="w-4 h-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showFilters && (
                <>
                  {/* Category Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-elevation-2"
                  >
                    <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-foreground">Category</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={clsx(
                          "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200",
                          selectedCategory === "all"
                            ? "bg-primary text-white font-semibold shadow-lg shadow-primary/30 scale-105"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        All Items
                      </button>
                      {CATEGORIES.map((cat) => {
                        // @ts-ignore - Dynamic access to Lucide icons
                        const Icon = Icons[cat.icon];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={clsx(
                              "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2",
                              selectedCategory === cat.id
                                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/30 scale-105"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Price Range Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-elevation-2"
                  >
                    <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-foreground">Price Range</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Min: ${priceRange.min}</label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: Math.min(parseInt(e.target.value), prev.max),
                            }))
                          }
                          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max: ${priceRange.max}</label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: Math.max(parseInt(e.target.value), prev.min),
                            }))
                          }
                          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Condition Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-elevation-2"
                  >
                    <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-foreground">Condition</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setCondition(null)}
                        className={clsx(
                          "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200",
                          !condition
                            ? "bg-accent text-white font-semibold shadow-lg shadow-accent/30 scale-105"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        All Conditions
                      </button>
                      {conditions.map((cond) => (
                        <button
                          key={cond}
                          onClick={() => setCondition(cond)}
                          className={clsx(
                            "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200",
                            condition === cond
                              ? "bg-accent text-white font-semibold shadow-lg shadow-accent/30 scale-105"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Sort By */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-elevation-2"
                  >
                    <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-foreground">Sort By</h3>
                    <div className="space-y-2">
                      {[
                        { value: "newest", label: "Newest" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "rating", label: "Top Rated" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as any)}
                          className={clsx(
                            "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200",
                            sortBy === option.value
                              ? "bg-primary text-white font-semibold shadow-lg shadow-primary/30 scale-105"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div className="lg:col-span-4">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6 flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-4 py-2 text-base">
                  {filteredProducts.length} Results
                </Badge>
                {(searchQuery || selectedCategory !== "all" || condition) && (
                  <Badge variant="outline" className="px-3 py-1 text-xs">
                    Filtered
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-80 bg-muted rounded-2xl"
                  />
                ))}
              </motion.div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="perspective"
                    style={{
                      perspective: "1000px",
                    }}
                  >
                    <motion.div
                      whileHover={{
                        rotateY: 5,
                        rotateX: -5,
                        z: 50,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white/50 backdrop-blur border border-white/20 rounded-3xl"
              >
                <Icons.SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setCondition(null);
                    setPriceRange({ min: 0, max: 1000 });
                  }}
                  className="rounded-xl"
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}

            {/* Stats Footer */}
            {filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center text-sm text-muted-foreground"
              >
                <p>
                  Showing {filteredProducts.length} of {MOCK_PRODUCTS.length} products
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
