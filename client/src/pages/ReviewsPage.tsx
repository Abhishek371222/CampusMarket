import { Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MOCK_REVIEWS } from "@/lib/mockData";

export default function ReviewsPage() {
  const reviews = MOCK_REVIEWS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">My Reviews</h1>
          <p className="text-muted-foreground">Feedback from your purchases on Campus Market</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 text-center border-primary/20 bg-white/50">
            <div className="text-2xl font-bold text-primary">4.8</div>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </Card>
          <Card className="p-4 text-center border-primary/20 bg-white/50">
            <div className="text-2xl font-bold text-accent">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </Card>
          <Card className="p-4 text-center border-primary/20 bg-white/50">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">Positive</p>
          </Card>
        </motion.div>

        {/* Reviews */}
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{review.title}</p>
                  <p className="text-sm text-muted-foreground">by {review.author}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-accent text-accent" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{review.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>

        {reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 backdrop-blur border border-white/20 rounded-3xl"
          >
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Complete purchases to receive reviews</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
