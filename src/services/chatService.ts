import { ApiRequestError, apiRequest } from "./apiClient";
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

const DEFAULT_BACKEND_ORIGIN = "https://organic-mart-be-yilq.onrender.com";
const DEFAULT_LOCAL_BACKEND_ORIGIN = "http://localhost:8080";
const WS_CHAT_PATH = "/ws/chat";

interface ResolveWsUrlOptions {
  configuredUrl?: string;
  proxyTarget?: string;
  appOrigin?: string;
  isDev?: boolean;
}

const toWsChatUrl = (origin: string) => {
  const url = new URL(origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = WS_CHAT_PATH;
  url.search = "";
  url.hash = "";
  return url.toString();
};

export const resolveWsUrl = ({
  configuredUrl,
  proxyTarget,
  appOrigin,
  isDev = false,
}: ResolveWsUrlOptions = {}) => {
  const explicitUrl = configuredUrl?.trim();
  if (explicitUrl) return explicitUrl.replace(/\/+$/, "");

  const configuredProxyTarget = proxyTarget?.trim();
  if (isDev && configuredProxyTarget) {
    return toWsChatUrl(appOrigin || "http://localhost:3000");
  }

  return toWsChatUrl(
    configuredProxyTarget || (isDev ? DEFAULT_LOCAL_BACKEND_ORIGIN : DEFAULT_BACKEND_ORIGIN)
  );
};

export const getWsUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, any> }).env;
  return resolveWsUrl({
    configuredUrl: viteEnv?.VITE_WS_URL,
    proxyTarget: viteEnv?.VITE_API_PROXY_TARGET,
    appOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    isDev: Boolean(viteEnv?.DEV),
  });
};

export const getAccessToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const getCurrentConversation = async (): Promise<ChatConversation | null> => {
  try {
    return await apiRequest<ChatConversation>("/chat/conversations/me", {
      requireAuth: true,
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const chatService = {
  getOrCreateConversation: async (): Promise<ChatConversation> => {
    const existingConversation = await getCurrentConversation();
    if (existingConversation) return existingConversation;

    return apiRequest<ChatConversation>("/chat/conversations", {
      method: "POST",
      requireAuth: true,
    });
  },

  getMyConversation: getCurrentConversation,

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
