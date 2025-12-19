import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/mockData";
import { Search, Loader2, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useLocation, Link } from "wouter";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts(selectedCategory === "all" ? undefined : selectedCategory);

  const filteredProducts = products?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* AI Chatbot Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 sticky top-0 z-30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3 text-center flex-wrap">
            <span className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
              NEW
            </span>
            <p className="text-sm md:text-base font-medium text-foreground">
              🤖 <strong>AI Chatbot Available!</strong> Click the floating button in the bottom-right corner for instant help!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Premium Background */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary/20 to-background pt-24 pb-40 overflow-hidden">
        {/* Professional Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float-slow opacity-60" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed opacity-50" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-40" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">The #1 Campus Marketplace</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl sm:text-7xl font-display font-black text-white leading-tight tracking-tight"
            >
              Buy & Sell on <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Campus</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              The secure student marketplace. Trade textbooks, electronics, furniture & more with your campus community.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-8"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search textbooks, electronics, furniture..." 
                  className="pl-12 h-14 text-base rounded-2xl bg-white shadow-2xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 placeholder:text-muted-foreground"
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
                className="h-14 rounded-2xl px-10 font-semibold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 text-white"
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {filteredProducts?.length || 0} items found
            </span>
            <Link href="/products">
              <Button variant="outline" size="sm" className="rounded-lg">
                View All →
              </Button>
            </Link>
          </div>
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

      {/* Trending Products Section */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">🔥 Trending Now</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900">
              Hot <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Deals</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check out the most popular items on Campus Market right now
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/3] bg-slate-200 rounded-3xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts?.slice(0, 4).map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
