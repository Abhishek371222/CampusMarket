import { useQuery, useMutation, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";
import type { 
  Product, 
  InsertProduct,
  Chat,
  Message,
  InsertMessage,
  CommunityPost,
  InsertCommunityPost,
  Offer,
  InsertOffer,
  User
} from "@shared/schema";

// Products Hooks
export function useProducts(filters?: { search?: string; category?: string; condition?: string }) {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.condition) params.append("condition", filters.condition);
  
  const queryString = params.toString();
  const url = queryString ? `/api/products?${queryString}` : "/api/products";
  
  return useQuery<Product[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    },
  });
}

export function useProduct(id: string | undefined, options?: UseQueryOptions<Product>) {
  return useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
    ...options,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (data: Omit<InsertProduct, "sellerId">) => {
      const res = await apiRequest("POST", "/api/products", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct(id: string) {
  return useMutation({
    mutationFn: async (data: Partial<InsertProduct>) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useDeleteProduct(id: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useProductView(id: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/products/${id}/view`, {});
    },
  });
}

// Chats & Messages Hooks
export function useChats() {
  return useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });
}

export function useChat(id: string | undefined) {
  return useQuery<Chat>({
    queryKey: ["/api/chats", id],
    enabled: !!id,
  });
}

export function useMessages(chatId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: ["/api/chats", chatId, "messages"],
    enabled: !!chatId,
  });
}

export function useCreateChat() {
  return useMutation({
    mutationFn: async (data: { productId: string; sellerId: string }) => {
      const res = await apiRequest("POST", "/api/chats", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
}

export function useSendMessage(chatId: string) {
  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/chats/${chatId}/messages`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", chatId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
}

export function useMarkMessageRead(messageId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
}

// Community Posts Hooks
export function useCommunityPosts() {
  return useQuery<CommunityPost[]>({
    queryKey: ["/api/community"],
  });
}

export function useCommunityPost(id: string | undefined) {
  return useQuery<CommunityPost>({
    queryKey: ["/api/community", id],
    enabled: !!id,
  });
}

export function useCreateCommunityPost() {
  return useMutation({
    mutationFn: async (data: Omit<InsertCommunityPost, "authorId">) => {
      const res = await apiRequest("POST", "/api/community", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
  });
}

export function useLikeCommunityPost(id: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/community/${id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
  });
}

export function useDeleteCommunityPost(id: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/community/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
  });
}

// Offers Hooks
export function useOffersByProduct(productId: string | undefined) {
  return useQuery<Offer[]>({
    queryKey: ["/api/offers/product", productId],
    enabled: !!productId,
  });
}

export function useMyOffers() {
  return useQuery<Offer[]>({
    queryKey: ["/api/offers/buyer"],
  });
}

export function useCreateOffer() {
  return useMutation({
    mutationFn: async (data: Omit<InsertOffer, "buyerId">) => {
      const res = await apiRequest("POST", "/api/offers", data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers/product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/offers/buyer"] });
    },
  });
}

export function useAcceptOffer(offerId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/offers/${offerId}/accept`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useRejectOffer(offerId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/offers/${offerId}/reject`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });
}

// User Profile Hooks
export function useUserProfile(userId: string | undefined) {
  return useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
}

export function useFollowers(userId: string | undefined) {
  return useQuery<User[]>({
    queryKey: ["/api/users", userId, "followers"],
    enabled: !!userId,
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery<User[]>({
    queryKey: ["/api/users", userId, "following"],
    enabled: !!userId,
  });
}

export function useFollowUser(userId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

export function useUnfollowUser(userId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

export function useUpdateVerification(userId: string) {
  return useMutation({
    mutationFn: async (data: { verificationStatus: string; isVerified: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/verify`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}
