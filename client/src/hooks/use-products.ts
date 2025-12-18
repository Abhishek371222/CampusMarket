import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { MOCK_PRODUCTS, delay } from "@/lib/mockData";

// Emulate the structure of what would be real API hooks
// But use MOCK_PRODUCTS instead of fetching

export function useProducts(category?: string) {
  return useQuery({
    queryKey: [api.products.list.path, category],
    queryFn: async () => {
      await delay(600); // Simulate network latency
      
      let products = [...MOCK_PRODUCTS];
      
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }
      
      // Validate with Zod for correctness even with mock data
      return api.products.list.responses[200].parse(products);
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      await delay(400);
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (!product) throw new Error("Product not found");
      return api.products.get.responses[200].parse(product);
    },
    enabled: !!id,
  });
}
