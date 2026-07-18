import { useEffect, useRef, useCallback, useState } from "react";
import { getWsUrl, getAccessToken } from "@/services/chatService";

export interface ChatSocketMessage {
  type: "CHAT_MESSAGE" | "MESSAGE_READ" | "CONVERSATION_UPDATED" | "ERROR" | "CONNECTION_ACK";
  messageId?: number;
  conversationId?: number;
  senderId?: number;
  senderEmail?: string;
  senderRole?: string;
  content?: string;
  status?: string;
  clientMessageId?: string;
  createdAt?: string;
  errorMessage?: string;
}

interface UseChatWebSocketOptions {
  conversationId?: number;
  enabled?: boolean;
  onMessage?: (message: ChatSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export type ChatConnectionStatus = "connecting" | "open" | "closed" | "error";

interface UseChatWebSocketReturn {
  isConnected: boolean;
  status: ChatConnectionStatus;
  connectionError: string | null;
  wsUrl: string | null;
  isUnsupported: boolean;
  sendMessage: (content: string, clientMessageId?: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

interface ReconnectDecision {
  enabled: boolean;
  intentionallyClosed: boolean;
  attempts: number;
  maxAttempts: number;
  handshakeEstablished: boolean;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;
const CONNECT_TIMEOUT_MS = 15000;

export const shouldReconnectChatSocket = ({
  enabled,
  intentionallyClosed,
  attempts,
  maxAttempts,
  handshakeEstablished,
}: ReconnectDecision) =>
  enabled
  && !intentionallyClosed
  && handshakeEstablished
  && attempts < maxAttempts;

export function useChatWebSocket({
  conversationId,
  enabled = true,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [status, setStatus] = useState<ChatConnectionStatus>("closed");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentWsUrl, setCurrentWsUrl] = useState<string | null>(null);
  const [isUnsupported, setIsUnsupported] = useState(false);

  const isConnected = status === "open";

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const socketIdRef = useRef(0);
  const intentionallyClosedSocketIdsRef = useRef(new Set<number>());
  const conversationIdRef = useRef(conversationId);
  const enabledRef = useRef(enabled);
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  conversationIdRef.current = conversationId;
  enabledRef.current = enabled;
  onMessageRef.current = onMessage;
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;
  onErrorRef.current = onError;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabledRef.current) {
      setStatus("closed");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setStatus("error");
      const msg = "Không tìm thấy accessToken. Vui lòng đăng nhập lại.";
      setConnectionError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    clearReconnectTimer();

    let wsUrl: string;
    try {
      wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
    } catch (err) {
      setStatus("error");
      const msg = `Không thể tạo URL WebSocket: ${err instanceof Error ? err.message : String(err)}`;
      setConnectionError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    setStatus("connecting");
    setConnectionError(null);
    setCurrentWsUrl(wsUrl.replace(/\?token=.*/, "?token=***"));

    const ws = new WebSocket(wsUrl);
    const socketId = socketIdRef.current + 1;
    socketIdRef.current = socketId;
    wsRef.current = ws;
    let handshakeEstablished = false;

    // Surface the URL to console so misconfigured VITE_WS_URL is visible during debugging.
    if (typeof window !== "undefined") {
      try {
        const sanitized = wsUrl.replace(/token=[^&]+/, "token=***");
        // eslint-disable-next-line no-console
        console.info("[useChatWebSocket] connecting to", sanitized);
      } catch {
        // noop
      }
    }

    const connectTimeoutId = window.setTimeout(() => {
      if (socketIdRef.current !== socketId || handshakeEstablished) return;
      const msg = `Không nhận được phản hồi từ máy chủ chat sau ${CONNECT_TIMEOUT_MS / 1000}s. Có thể URL backend sai hoặc service không hoạt động.`;
      setStatus("error");
      setConnectionError(msg);
      onErrorRef.current?.(msg);
      try {
        ws.close();
      } catch {
        // ignore
      }
    }, CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      if (socketIdRef.current !== socketId) return;
      window.clearTimeout(connectTimeoutId);
      handshakeEstablished = true;
      reconnectAttemptsRef.current = 0;
      setStatus("open");
      setConnectionError(null);
      onConnectRef.current?.();
    };

    ws.onmessage = (event) => {
      if (socketIdRef.current !== socketId) return;
      try {
        const message: ChatSocketMessage = JSON.parse(event.data);
        const activeConversationId = conversationIdRef.current;
        if (message.conversationId === activeConversationId || activeConversationId === undefined) {
          onMessageRef.current?.(message);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = () => {
      if (socketIdRef.current !== socketId) return;
      window.clearTimeout(connectTimeoutId);
      const message = handshakeEstablished
        ? "Mất kết nối WebSocket giữa chừng."
        : "Không thể kết nối tới máy chủ chat. Kiểm tra cấu hình backend hoặc trạng thái Render service.";
      setConnectionError(message);
      onErrorRef.current?.(message);
    };

    ws.onclose = (event) => {
      if (socketIdRef.current === socketId) {
        window.clearTimeout(connectTimeoutId);
      }
      const isCurrentSocket = wsRef.current === ws && socketIdRef.current === socketId;
      const intentionallyClosed = intentionallyClosedSocketIdsRef.current.has(socketId) || !isCurrentSocket;
      intentionallyClosedSocketIdsRef.current.delete(socketId);

      if (isCurrentSocket) {
        wsRef.current = null;
      }

      if (!isCurrentSocket) return;

      const shouldReportError = !handshakeEstablished && !intentionallyClosed;
      const shouldReconnect = shouldReconnectChatSocket({
        enabled: enabledRef.current,
        intentionallyClosed,
        attempts: reconnectAttemptsRef.current,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
        handshakeEstablished,
      });

    if (shouldReportError) {
      const message = `WebSocket đóng trước khi kết nối được thiết lập (code=${event.code}). ${
        event.code === 1006 ? "Có thể do URL backend sai (kiểm tra VITE_WS_URL), CORS, sai token, hoặc proxy/CDN (vd Cloudflare) chặn upgrade WebSocket." :
        event.code === 1002 ? "Giao thức không hợp lệ." :
        event.code === 1015 ? "TLS handshake thất bại." :
        ""
      }`;
      setStatus("error");
      setConnectionError(message);
      onErrorRef.current?.(message);
      onDisconnectRef.current?.();
      if (event.code === 1006) {
        setIsUnsupported(true);
      }
      return;
    }

    if (intentionallyClosed) {
      setStatus("closed");
      onDisconnectRef.current?.();
      return;
    }

      if (shouldReconnect) {
        setStatus("connecting");
        onDisconnectRef.current?.();
        const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
        return;
      }

      setStatus("closed");
      onDisconnectRef.current?.();
    };
  }, [clearReconnectTimer]);

  const closeSocket = useCallback(() => {
    clearReconnectTimer();
    const ws = wsRef.current;
    if (ws) {
      intentionallyClosedSocketIdsRef.current.add(socketIdRef.current);
      wsRef.current = null;
      try {
        ws.close();
      } catch {
        // Socket may already be in a closing state.
      }
    }
    setStatus("closed");
  }, [clearReconnectTimer]);

  useEffect(() => {
    if (!enabled) {
      closeSocket();
      return;
    }

    connect();

    return () => {
      closeSocket();
    };
  }, [connect, closeSocket, enabled]);

  const sendMessage = useCallback(
    (content: string, clientMessageId?: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket chưa sẵn sàng");
      }
      if (!conversationId) {
        throw new Error("Thiếu conversationId");
      }
      const message = {
        type: "CHAT_MESSAGE",
        conversationId,
        content,
        clientMessageId: clientMessageId || crypto.randomUUID(),
        sentAt: new Date().toISOString(),
      };
      ws.send(JSON.stringify(message));
    },
    [conversationId]
  );

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
    closeSocket();
  }, [closeSocket]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setIsUnsupported(false);
    closeSocket();
    if (enabledRef.current) {
      connect();
    }
  }, [closeSocket, connect]);

  return {
    isConnected,
    status,
    connectionError,
    wsUrl: currentWsUrl,
    isUnsupported,
    sendMessage,
    reconnect,
    disconnect,
  };
}