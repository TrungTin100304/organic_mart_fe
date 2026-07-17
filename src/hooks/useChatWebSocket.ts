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

interface UseChatWebSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string, clientMessageId?: string) => void;
  disconnect: () => void;
}

interface ReconnectDecision {
  enabled: boolean;
  intentionallyClosed: boolean;
  attempts: number;
  maxAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export const shouldReconnectChatSocket = ({
  enabled,
  intentionallyClosed,
  attempts,
  maxAttempts,
}: ReconnectDecision) => enabled && !intentionallyClosed && attempts < maxAttempts;

export function useChatWebSocket({
  conversationId,
  enabled = true,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
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
    if (!enabledRef.current) return;

    const token = getAccessToken();
    if (!token) {
      onErrorRef.current?.("No access token available");
      return;
    }

    clearReconnectTimer();
    const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    const socketId = socketIdRef.current + 1;
    socketIdRef.current = socketId;
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      onConnectRef.current?.();
    };

    ws.onmessage = (event) => {
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
      onErrorRef.current?.("WebSocket connection error");
    };

    ws.onclose = () => {
      const isCurrentSocket = wsRef.current === ws && socketIdRef.current === socketId;
      if (isCurrentSocket) {
        wsRef.current = null;
      }

      setIsConnected(false);
      onDisconnectRef.current?.();

      const intentionallyClosed = intentionallyClosedSocketIdsRef.current.has(socketId) || !isCurrentSocket;
      intentionallyClosedSocketIdsRef.current.delete(socketId);

      if (shouldReconnectChatSocket({
        enabled: enabledRef.current,
        intentionallyClosed,
        attempts: reconnectAttemptsRef.current,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
      })) {
        const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, [clearReconnectTimer]);

  const closeSocket = useCallback(() => {
    clearReconnectTimer();
    const ws = wsRef.current;
    if (ws) {
      intentionallyClosedSocketIdsRef.current.add(socketIdRef.current);
      wsRef.current = null;
      ws.close();
    }
    setIsConnected(false);
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
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && conversationId) {
        const message = {
          type: "CHAT_MESSAGE",
          conversationId,
          content,
          clientMessageId: clientMessageId || crypto.randomUUID(),
          sentAt: new Date().toISOString(),
        };
        wsRef.current.send(JSON.stringify(message));
      }
    },
    [conversationId]
  );

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
    closeSocket();
  }, [closeSocket]);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
