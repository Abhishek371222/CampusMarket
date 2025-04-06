import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Plus, Tag, ShoppingBag, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const images = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentImage, images.length]);

  const features = [
    { icon: <Tag className="h-6 w-6" />, title: "Best Prices", description: "Get the best deals on campus" },
    { icon: <ShoppingBag className="h-6 w-6" />, title: "Secure Deals", description: "Safe transactions with your peers" },
    { icon: <TrendingUp className="h-6 w-6" />, title: "Trending Items", description: "Find what's popular now" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="mb-12 -mt-6 overflow-hidden">
      <div className="relative w-full h-[70vh] min-h-[550px] rounded-2xl overflow-hidden">
        {/* Background with animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#092B4B]/90 via-[#092B4B]/75 to-transparent z-10"></div>
        
        {/* Stars/particles effect */}
        <motion.div className="absolute inset-0 z-10 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.8, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </motion.div>
        
        {/* Sliding background images */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5 }}
            >
              <img
                src={images[currentImage]}
                alt="Campus life"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl">
            <motion.div
              className="mb-2 inline-block bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              #1 Campus Marketplace
            </motion.div>
            
            <motion.h1 
              className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="text-blue-400">Campus</span>Market
              <div>Your Student Trading Hub</div>
            </motion.h1>
            
            <motion.p 
              className="text-blue-100 text-lg mb-8 max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Find what you need at the best prices directly from your classmates. From textbooks to furniture, buy and sell anything on campus!
            </motion.p>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              className="relative mb-8 max-w-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <input
                type="text"
                placeholder="I'm looking for..."
                className="w-full py-3 px-5 pr-12 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-blue-100/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-400 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </motion.form>
            
            <motion.div 
              className="flex flex-wrap sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-5 rounded-full text-base"
                >
                  <Link href="/">Browse All Items <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.div>
              
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-5 rounded-full text-base"
                  >
                    <Link href="/create-listing"><Plus className="mr-2 h-4 w-4" /> Sell Something</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
            
            {/* Features */}
            <motion.div 
              className="flex flex-wrap gap-6 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <div className="bg-blue-400/20 text-blue-300 p-2 rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium">{feature.title}</div>
                    <div className="text-blue-100/80 text-sm">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
