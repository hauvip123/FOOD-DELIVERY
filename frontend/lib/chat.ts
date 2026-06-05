import { apiRequest, jsonBody } from "@/lib/api";
import type { RestaurantResponse } from "@/lib/restaurant";

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ChatUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
};

export type ChatConversation = {
  id: number;
  userId: number;
  restaurantId: number;
  restaurant: RestaurantResponse;
  user: ChatUser;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: string;
  sender?: ChatUser;
  content: string;
  createdAt: string;
};

export async function getChatConversations() {
  const response = await apiRequest<ApiResponse<ChatConversation[]>>("/chats");
  return response.data;
}

export async function startRestaurantConversation(restaurantId: number) {
  const response = await apiRequest<ApiResponse<ChatConversation>>(`/chats/restaurants/${restaurantId}`, {
    method: "POST",
  });
  return response.data;
}

export async function getChatMessages(conversationId: number) {
  const response = await apiRequest<ApiResponse<ChatMessage[]>>(`/chats/${conversationId}/messages`);
  return response.data;
}

export async function sendChatMessage(conversationId: number, content: string) {
  const response = await apiRequest<ApiResponse<ChatMessage>>(`/chats/${conversationId}/messages`, {
    method: "POST",
    body: jsonBody({ content }),
  });
  return response.data;
}
