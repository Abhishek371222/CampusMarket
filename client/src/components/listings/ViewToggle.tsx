import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-1 inline-flex"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className={`px-3 py-1 rounded ${
          view === "grid" ? "bg-[#6B46C1] text-white" : "text-gray-500 hover:text-[#6B46C1]"
        }`}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        className={`px-3 py-1 rounded ${
          view === "list" ? "bg-[#6B46C1] text-white" : "text-gray-500 hover:text-[#6B46C1]"
        }`}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default ViewToggle;
