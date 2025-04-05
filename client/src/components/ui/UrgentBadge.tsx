import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const UrgentBadge = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white text-xs font-bold px-2 py-1 rounded-full">
        URGENT
      </Badge>
    </motion.div>
  );
};

export default UrgentBadge;
