import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/mockData";
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import clsx from "clsx";
import * as Icons from "lucide-react";

export default function SearchPage() {
  const [, params] = useLocation();
  const searchParam = new URLSearchParams(window.location.search).get('q') || '';
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [condition, setCondition] = useState<string | null>(null);

  const { data: products, isLoading } = useProducts(selectedCategory === "all" ? undefined : selectedCategory);

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = parseFloat(p.price) >= priceRange.min && parseFloat(p.price) <= priceRange.max;
    const matchesCondition = !condition || p.condition === condition;
    return matchesSearch && matchesPrice && matchesCondition;
  });

  const conditions = ["New", "Used - Like New", "Used - Good", "Used - Fair"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Search Header */}
      <section className="sticky top-20 z-40 bg-background/80 backdrop-blur-lg border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search items, sellers..."
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
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6 sticky top-40">
              {/* Category Filter */}
              <div className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4">
                <h3 className="font-bold mb-3">Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={clsx(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-all",
                        selectedCategory === cat.id
                          ? "bg-primary text-white"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4">
                <h3 className="font-bold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Condition Filter */}
              <div className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-4">
                <h3 className="font-bold mb-3">Condition</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCondition(null)}
                    className={clsx(
                      "w-full text-left text-sm px-3 py-2 rounded-lg transition-all",
                      condition === null ? "bg-primary text-white" : "hover:bg-muted"
                    )}
                  >
                    All Conditions
                  </button>
                  {conditions.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={clsx(
                        "w-full text-left text-sm px-3 py-2 rounded-lg transition-all",
                        condition === cond ? "bg-primary text-white" : "hover:bg-muted"
                      )}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {searchQuery ? `Search results for "${searchQuery}"` : "All Items"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Found {filteredProducts?.length || 0} items
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/50 backdrop-blur border border-white/20 rounded-3xl"
              >
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try different keywords or adjust filters.`
                    : "Adjust your filters to find items."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
