import { useQuery, useMutation, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";
import type { 
  Product, 
  InsertProduct,
  Chat,
  EnrichedChat,
  Message,
  InsertMessage,
  CommunityPost,
  InsertCommunityPost,
  Offer,
  InsertOffer,
  User,
  Order,
  IdVerification
} from "@shared/schema";

// Products Hooks
export function useProducts(filters?: { 
  search?: string; 
  category?: string; 
  condition?: string;
  locationId?: string;
  institutionId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.condition) params.append("condition", filters.condition);
  if (filters?.locationId) params.append("locationId", filters.locationId);
  if (filters?.institutionId) params.append("institutionId", filters.institutionId);
  
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

// Location and Institution Hooks
export function useLocations() {
  return useQuery<{id: string; country: string; state: string; city: string; pincode: string}[]>({
    queryKey: ["/api/locations"],
    queryFn: async () => {
      const res = await fetch("/api/locations", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}

export function useInstitutions(locationId?: string) {
  const url = locationId ? `/api/institutions?locationId=${locationId}` : "/api/institutions";
  return useQuery<{id: string; name: string; type: string; locationId: string | null}[]>({
    queryKey: ["/api/institutions", { locationId }],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
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
  return useQuery<EnrichedChat[]>({
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
      queryClient.invalidateQueries({ queryKey: ["/api/community", id, "like-status"] });
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

export function useLikeStatus(postId: string | undefined) {
  return useQuery<{ liked: boolean }>({
    queryKey: ["/api/community", postId, "like-status"],
    enabled: !!postId,
    queryFn: async () => {
      const res = await fetch(`/api/community/${postId}/like-status`, { credentials: "include" });
      if (!res.ok) return { liked: false };
      return res.json();
    },
  });
}

export function usePostComments(postId: string | undefined) {
  return useQuery<{ id: string; postId: string; authorId: string; content: string; createdAt: string }[]>({
    queryKey: ["/api/community", postId, "comments"],
    enabled: !!postId,
    queryFn: async () => {
      const res = await fetch(`/api/community/${postId}/comments`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useCreateComment(postId: string) {
  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/community/${postId}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community", postId, "comments"] });
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
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/users"],
  });
}

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

export function useIsFollowing(currentUserId: string | undefined, targetUserId: string | undefined) {
  const { data: following } = useFollowing(currentUserId);
  return following?.some(user => user.id === targetUserId) || false;
}

export function useFollowUser(userId: string, currentUserId?: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "following"] });
      }
    },
  });
}

export function useUnfollowUser(userId: string, currentUserId?: string) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/users/${userId}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "followers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "following"] });
      }
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

// ID Verification Hooks
export function useVerificationStatus() {
  return useQuery<IdVerification | null>({
    queryKey: ["/api/verification/status"],
    queryFn: async () => {
      const res = await fetch("/api/verification/status", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(await res.text());
      }
      return res.json();
    },
  });
}

export function useUploadVerification() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/verification", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

export type VerificationWithUser = {
  id: string;
  userId: string;
  documentPath: string;
  documentType: string;
  status: string;
  notes: string | null;
  createdAt: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
};

export function usePendingVerifications() {
  return useQuery<VerificationWithUser[]>({
    queryKey: ["/api/admin/verifications"],
  });
}

export function useReviewVerification() {
  return useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: "approved" | "rejected"; notes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/verifications/${id}`, { action, notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

// Order Hooks
export function useOrders(type?: "buying" | "selling") {
  const url = type ? `/api/orders?type=${type}` : "/api/orders";
  return useQuery<Order[]>({
    queryKey: ["/api/orders", type],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<Order>({
    queryKey: ["/api/orders", id],
    enabled: !!id,
  });
}

export function useBuyProduct() {
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: { paymentMethod?: string; meetupLocation?: string; notes?: string } }) => {
      const res = await apiRequest("POST", `/api/products/${productId}/buy`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", variables.orderId] });
    },
  });
}
