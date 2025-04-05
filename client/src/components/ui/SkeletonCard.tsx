import { motion } from "framer-motion";
import { skeletonAnimation } from "@/lib/animations";

const SkeletonCard = () => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden"
      variants={skeletonAnimation}
      initial="initial"
      animate="animate"
    >
      <div className="relative">
        <div className="w-full h-48 bg-gray-200" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-3/5 h-5 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-4/5 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="flex items-center mt-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
          <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          <div className="ml-auto flex items-center">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkeletonCard;
