import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerContainer, listItemVariants } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback image mapping in case API has no images
const categoryImages = {
  "furniture": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
  "books-and-notes": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
  "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
  "clothing": "https://images.unsplash.com/photo-1560243563-062bfc001d68?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
  "vehicles": "https://images.unsplash.com/photo-1581112877498-940509c7ba69?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
  "services": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
};

const CategoryHighlights = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["/api/categories"],
  });

  if (error) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D3748]">Shop by Category</h2>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
          Failed to load categories. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-[#2D3748]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Shop by Category
        </motion.h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {categories?.map((category) => (
            <motion.div 
              key={category.id} 
              variants={listItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Link href={`/category/${category.slug}`}>
                <a className="relative overflow-hidden rounded-xl group h-32 md:h-40 transition-all block">
                  <img
                    src={categoryImages[category.slug] || categoryImages.furniture}
                    alt={`${category.name} category`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.itemCount} items</p>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default CategoryHighlights;
