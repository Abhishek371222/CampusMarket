import { Star, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface SellerRatingProps {
  sellerName?: string;
  rating?: number | string;
  reviewCount?: number;
  responseTime?: string;
  compact?: boolean;
}

export function SellerRating({
  sellerName = "Campus Seller",
  rating = 4.8,
  reviewCount = 42,
  responseTime = "< 2 hours",
  compact = false,
}: SellerRatingProps) {
  const ratingNum = typeof rating === "string" ? parseFloat(rating) : rating;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-sm">{ratingNum}</span>
          <span className="text-muted-foreground text-xs">({reviewCount})</span>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{sellerName}</h3>
            <p className="text-sm text-muted-foreground">Campus Market Seller</p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Rating */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-slate-900">{ratingNum}</span>
            </div>
            <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
          </motion.div>

          {/* Response Time */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-1">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto" />
            </div>
            <p className="font-semibold text-sm text-slate-900">{responseTime}</p>
            <p className="text-xs text-muted-foreground">response time</p>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
            <p className="text-xs text-muted-foreground">satisfied buyers</p>
          </motion.div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            ⭐ Top Seller
          </Badge>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            📦 Fast Shipping
          </Badge>
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
            💬 Responsive
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
