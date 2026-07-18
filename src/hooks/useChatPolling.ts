import { useEffect, useRef, useState, useCallback } from "react";
import { chatService, type ChatMessage } from "@/services/chatService";

export type ChatTransportStatus = "connecting" | "open" | "closed" | "error";

interface UseChatPollingOptions {
  conversationId?: number;
  enabled?: boolean;
  intervalMs?: number;
  pageSize?: number;
  onMessage?: (messages: ChatMessage[]) => void;
  onError?: (error: string) => void;
}

interface UseChatPollingReturn {
  status: ChatTransportStatus;
  connectionError: string | null;
  isPolling: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Polling fallback used when the WebSocket transport is unavailable
 * (e.g. Cloudflare is blocking WebSocket upgrades). Repeatedly fetches
 * the first page of the conversation and emits any messages the caller
 * has not seen yet.
 */
export function useChatPolling({
  conversationId,
  enabled = true,
  intervalMs = 4000,
  pageSize = 50,
  onMessage,
  onError,
}: UseChatPollingOptions = {}): UseChatPollingReturn {
  const [status, setStatus] = useState<ChatTransportStatus>("closed");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(true);
  const inFlightRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    setStatus((s) => (s === "open" ? s : "closed"));
  }, []);

  const fetchOnce = useCallback(async () => {
    if (!conversationId) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const result = await chatService.getMessages(conversationId, 0, pageSize);
      const sorted = [...result.content].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      onMessageRef.current?.(sorted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Polling failed";
      setConnectionError(msg);
      onErrorRef.current?.(msg);
    } finally {
      inFlightRef.current = false;
    }
  }, [conversationId, pageSize]);

  const start = useCallback(() => {
    if (!conversationId) {
      setStatus("closed");
      return;
    }
    stoppedRef.current = false;
    setStatus("connecting");
    setConnectionError(null);

    const tick = () => {
      if (stoppedRef.current) return;
      void fetchOnce();
    };

    void fetchOnce();
    intervalRef.current = setInterval(tick, intervalMs);
    setIsPolling(true);
    setStatus("open");
  }, [conversationId, fetchOnce, intervalMs]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    start();
    return () => stop();
  }, [enabled, start, stop]);

  return { status, connectionError, isPolling, start, stop };
}
