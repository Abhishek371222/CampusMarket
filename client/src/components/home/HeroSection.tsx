import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="mb-8">
      <motion.div 
        className="bg-gradient-to-r from-[#6B46C1] to-[#38B2AC] rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="md:flex">
          <div className="py-8 px-6 md:px-10 md:w-1/2 flex flex-col justify-center">
            <motion.h1 
              className="text-white text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Buy, Sell, and Connect on Campus
            </motion.h1>
            <motion.p 
              className="text-white/90 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Your trusted marketplace for college essentials. Find what you need or sell what you don't at the best prices!
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Button
                asChild
                className="bg-white text-[#6B46C1] hover:bg-white/90 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">Browse Items</Link>
              </Button>
              <Button
                asChild
                className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={user ? "/create-listing" : "/"}><Plus className="mr-1 h-4 w-4" /> Sell Something</Link>
              </Button>
            </motion.div>
          </div>
          <div className="md:w-1/2 relative hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="h-full"
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80"
                alt="College students with laptops"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#6B46C1]/50"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
