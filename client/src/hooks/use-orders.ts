import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { MOCK_ORDERS, delay } from "@/lib/mockData";
import { InsertOrder } from "@shared/schema";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      await delay(800);
      return api.orders.list.responses[200].parse(MOCK_ORDERS);
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      await delay(1500); // Simulate processing payment
      
      // In a real app, backend would generate ID and timestamps
      const newOrder = {
        ...data,
        id: Math.floor(Math.random() * 10000),
        createdAt: new Date(),
        status: "Processing"
      };
      
      // We can't actually push to MOCK_ORDERS reliably across reloads in this static demo
      // but we return success to the UI
      return newOrder;
    },
    onSuccess: () => {
      // Invalidate query to trigger refetch (which would get new data in real app)
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    }
  });
}
