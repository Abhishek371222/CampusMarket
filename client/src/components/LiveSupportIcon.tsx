import { useState } from "react";
import { Link } from "wouter";
import { Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LiveSupportIcon = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Link href="/support">
        <motion.div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="w-14 h-14 bg-[#ED8936] rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg"
            animate={{ 
              boxShadow: isHovered 
                ? "0 0 0 0 rgba(237, 137, 54, 0.7)" 
                : "0 0 0 8px rgba(237, 137, 54, 0)" 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              repeatType: "reverse"
            }}
          >
            <Headphones size={28} />
          </motion.div>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute bottom-16 right-0 bg-white p-2 rounded-lg shadow-md whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium text-gray-800">Need help? Chat with us!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    </div>
  );
};

export default LiveSupportIcon;