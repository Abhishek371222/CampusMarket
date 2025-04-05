import { Star, StarHalf } from "lucide-react";

interface SellerRatingProps {
  rating: number;
  showCount?: boolean;
}

const SellerRating = ({ rating, showCount = false }: SellerRatingProps) => {
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      <div className="flex items-center text-yellow-400">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-current" />
        ))}
        
        {/* Half star */}
        {hasHalfStar && <StarHalf key="half" className="h-3.5 w-3.5 fill-current" />}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
        ))}
      </div>
      
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default SellerRating;
