import { apiRequest } from "./apiClient";
import type { ApiResponse } from "./apiClient";

export type ChatConversationStatus = "OPEN" | "CLOSED";
export type ChatMessageSenderRole = "USER" | "ADMIN" | "SYSTEM";
export type ChatMessageStatus = "SENT" | "READ";

export interface ChatConversation {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  status: ChatConversationStatus;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number | null;
  senderEmail: string | null;
  senderRole: ChatMessageSenderRole;
  content: string;
  status: ChatMessageStatus;
  clientMessageId: string | null;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const getWsUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, any> }).env;
  const configuredUrl = viteEnv?.VITE_WS_URL;
  if (configuredUrl) return configuredUrl;
  if (viteEnv?.DEV) return "ws://localhost:8080/ws/chat";
  return "wss://organic-mart-be.onrender.com/ws/chat";
};

export const getAccessToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

export const chatService = {
  getOrCreateConversation: async (): Promise<ChatConversation> => {
    return apiRequest<ChatConversation>("/chat/conversations", {
      method: "POST",
      requireAuth: true,
    });
  },

  getMyConversation: async (): Promise<ChatConversation | null> => {
    try {
      return await apiRequest<ChatConversation>("/chat/conversations/me", {
        requireAuth: true,
      });
    } catch {
      return null;
    }
  },

  getMessages: async (
    conversationId: number,
    page = 0,
    size = 30
  ): Promise<PagedResponse<ChatMessage>> => {
    return apiRequest<PagedResponse<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
      { requireAuth: true }
    );
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    return apiRequest<void>(`/chat/conversations/${conversationId}/read`, {
      method: "PATCH",
      requireAuth: true,
    });
  },

  getAdminConversations: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PagedResponse<ChatConversation>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status) params.append("status", status);
    return apiRequest<PagedResponse<ChatConversation>>(
      `/admin/chat/conversations?${params}`,
      { requireAuth: true }
    );
  },

  getAdminMessages: async (
    conversationId: number,
    page = 0,
    size = 30
  ): Promise<PagedResponse<ChatMessage>> => {
    return apiRequest<PagedResponse<ChatMessage>>(
      `/admin/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
      { requireAuth: true }
    );
  },

  adminMarkAsRead: async (conversationId: number): Promise<void> => {
    return apiRequest<void>(`/admin/chat/conversations/${conversationId}/read`, {
      method: "PATCH",
      requireAuth: true,
    });
  },

  closeConversation: async (
    conversationId: number
  ): Promise<ChatConversation> => {
    return apiRequest<ChatConversation>(
      `/admin/chat/conversations/${conversationId}/close`,
      { method: "PATCH", requireAuth: true }
    );
  },

  reopenConversation: async (
    conversationId: number
  ): Promise<ChatConversation> => {
    return apiRequest<ChatConversation>(
      `/admin/chat/conversations/${conversationId}/reopen`,
      { method: "PATCH", requireAuth: true }
    );
  },
};
