import { useEffect, useRef, useCallback, useState } from "react";
import { getWsUrl, getAccessToken, type ChatMessage } from "@/services/chatService";

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

export function useChatWebSocket({
  conversationId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      onError?.("No access token available");
      return;
    }

    const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const message: ChatSocketMessage = JSON.parse(event.data);
        if (message.conversationId === conversationId || conversationId === undefined) {
          onMessage?.(message);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = () => {
      onError?.("WebSocket connection error");
    };

    ws.onclose = () => {
      setIsConnected(false);
      onDisconnect?.();

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, [conversationId, onMessage, onConnect, onDisconnect, onError]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

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
    reconnectAttemptsRef.current = maxReconnectAttempts;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
