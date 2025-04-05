import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaApple, FaGooglePlay } from "react-icons/fa";

const AppPromotion = () => {
  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="bg-gradient-to-r from-[#38B2AC] to-[#6B46C1] rounded-2xl overflow-hidden shadow-lg">
        <div className="md:flex items-center">
          <div className="py-8 px-6 md:px-10 md:w-1/2">
            <motion.h2 
              className="text-white text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Get the Campus Marketplace App
            </motion.h2>
            <motion.p 
              className="text-white/90 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Browse, chat, and sell on the go. Get instant notifications for your listings and messages!
            </motion.p>
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                className="bg-black text-white rounded-xl px-4 py-7 flex items-center hover:bg-black/90 transition-all h-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaApple className="text-2xl mr-2" />
                <div className="flex flex-col items-start">
                  <span className="text-xs">Download on the</span>
                  <span className="font-semibold">App Store</span>
                </div>
              </Button>
              <Button
                className="bg-black text-white rounded-xl px-4 py-7 flex items-center hover:bg-black/90 transition-all h-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGooglePlay className="text-2xl mr-2" />
                <div className="flex flex-col items-start">
                  <span className="text-xs">Get it on</span>
                  <span className="font-semibold">Google Play</span>
                </div>
              </Button>
            </motion.div>
          </div>
          <motion.div 
            className="md:w-1/2 p-6 md:p-0 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
              alt="Students using the app"
              className="h-64 object-cover rounded-xl md:rounded-none md:h-auto"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AppPromotion;
