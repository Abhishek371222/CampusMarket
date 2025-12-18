import { useUserListings } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function MyListingsPage() {
  const { listings } = useUserListings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">Manage your active items for sale</p>
          </div>
          <Link href="/sell">
            <Button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4" />
              List Item
            </Button>
          </Link>
        </motion.div>

        {listings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {listings.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 backdrop-blur border border-white/20 rounded-3xl"
          >
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Start selling items on Campus Market today</p>
            <Link href="/sell">
              <Button className="rounded-xl">Create First Listing</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
