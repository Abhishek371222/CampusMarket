import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/mockData";
import { Search, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useLocation } from "wouter";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts(selectedCategory);

  const filteredProducts = products?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with 3D Background */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background pt-16 pb-24 overflow-hidden perspective">
        {/* 3D Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float-slow opacity-60" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed opacity-50" />
          <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float opacity-40" />
          
          {/* 3D Rotating Cube Background */}
          <div className="absolute top-1/3 right-1/4 w-32 h-32 animate-spin-slow opacity-10">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-lg transform rotate-12" />
            <div className="absolute inset-4 border-2 border-accent/30 rounded-lg transform -rotate-12" />
          </div>
          
          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-headline-lg text-foreground"
            >
              Buy & Sell on <span className="text-gradient animate-text-shine">Campus</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              The trusted marketplace for students. Find textbooks, electronics, and dorm essentials from people you know.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for textbooks, furniture..." 
                  className="pl-10 h-12 text-base rounded-xl bg-white shadow-elevation-2 border-border focus-ring transition-smooth"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
              </div>
              <Button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                size="lg" 
                className="h-12 rounded-xl px-8 font-semibold shadow-lg shadow-primary/25"
              >
                Search
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract shapes background */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="glass-heavy p-4 rounded-2xl flex flex-wrap justify-center gap-4">
          {CATEGORIES.map((category) => {
            // Dynamically get icon component
            // @ts-ignore - Dynamic access to Lucide icons
            const Icon = Icons[category.icon];
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 transform scale-105" 
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">
            {selectedCategory === 'all' ? 'Featured Listings' : `Showing ${selectedCategory}`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredProducts?.length || 0} items found
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No items found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Try adjusting your search or category filter to find what you're looking for.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
