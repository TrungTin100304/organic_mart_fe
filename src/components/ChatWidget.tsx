import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useChatWebSocket, type ChatSocketMessage } from "@/hooks/useChatWebSocket";
import { useChatPolling } from "@/hooks/useChatPolling";
import { chatService, type ChatConversation, type ChatMessage } from "@/services/chatService";

const getMessageTimestamp = (msg: ChatMessage) =>
  new Date(msg.createdAt ?? 0).getTime() || 0;

export const sortMessagesChronologically = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNewMessage = useCallback((msg: ChatSocketMessage) => {
    if (msg.type === "CHAT_MESSAGE" && msg.messageId && msg.conversationId) {
      const newMsg: ChatMessage = {
        id: msg.messageId,
        conversationId: msg.conversationId,
        senderId: msg.senderId ?? null,
        senderEmail: msg.senderEmail ?? null,
        senderRole: (msg.senderRole as ChatMessage["senderRole"]) ?? "USER",
        content: msg.content ?? "",
        status: (msg.status as ChatMessage["status"]) ?? "SENT",
        clientMessageId: msg.clientMessageId ?? null,
        createdAt: msg.createdAt ?? new Date().toISOString(),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.clientMessageId === newMsg.clientMessageId && newMsg.clientMessageId)) {
          return prev.map((m) =>
            m.clientMessageId === newMsg.clientMessageId && m.id === 0 ? newMsg : m
          );
        }
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
    }
  }, []);

  const mergePolledMessages = useCallback((polled: ChatMessage[]) => {
    if (!polled.length) return;
    setMessages((prev) => {
      const knownIds = new Set(prev.map((m) => m.id));
      const knownClientIds = new Set(
        prev.map((m) => m.clientMessageId).filter((id): id is string => Boolean(id))
      );
      const additions: ChatMessage[] = [];
      for (const m of polled) {
        if (m.id && knownIds.has(m.id)) continue;
        if (m.clientMessageId && knownClientIds.has(m.clientMessageId)) continue;
        additions.push(m);
      }
      if (!additions.length) return prev;
      return [...prev, ...additions].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  const ws = useChatWebSocket({
    conversationId: conversation?.id,
    enabled: isOpen && Boolean(conversation?.id),
    onMessage: handleNewMessage,
    onError: (err) => setError(err),
  });

  const polling = useChatPolling({
    conversationId: conversation?.id,
    enabled: isOpen && Boolean(conversation?.id) && ws.isUnsupported,
    intervalMs: 4000,
    onMessage: mergePolledMessages,
    onError: (err) => setError(err),
  });

  const isConnected = ws.isConnected;
  const transportMode: "ws" | "polling" | "offline" = ws.isUnsupported
    ? polling.status === "open"
      ? "polling"
      : "offline"
    : ws.isConnected
    ? "ws"
    : "offline";

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const conv = await chatService.getOrCreateConversation();
        setConversation(conv);

        const msgs = await chatService.getMessages(conv.id, 0, 50);
        setMessages(sortMessagesChronologically(msgs.content));

        if (conv.status === "OPEN") {
          await chatService.markAsRead(conv.id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !conversation || isSending) return;

    setIsSending(true);
    setInputValue("");

    const tempId = crypto.randomUUID();
    const tempMsg: ChatMessage = {
      id: 0,
      conversationId: conversation.id,
      senderId: null,
      senderEmail: null,
      senderRole: "USER",
      content,
      status: "SENT",
      clientMessageId: tempId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const finalize = (err?: string) => {
      if (err) {
        setMessages((prev) => prev.filter((m) => m.clientMessageId !== tempId));
        setInputValue(content);
        setError(err);
      }
      setIsSending(false);
    };

    try {
      if (ws.isConnected && !ws.isUnsupported) {
        ws.sendMessage(content, tempId);
        finalize();
        return;
      }

      // Fallback to REST when WebSocket is unavailable (e.g. Cloudflare blocks upgrade)
      const saved = await chatService.sendMessage(conversation.id, content, tempId);
      setMessages((prev) =>
        prev.map((m) => (m.clientMessageId === tempId ? { ...m, ...saved } : m))
      );
      finalize();
    } catch (e) {
      finalize(e instanceof Error ? e.message : "Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hôm nay";
    if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let lastDate = "";

  messages.forEach((msg) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== lastDate) {
      groupedMessages.push({ date: msgDate, messages: [msg] });
      lastDate = msgDate;
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline/20 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">support_agent</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Hỗ trợ Organic Mart</h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      transportMode === "ws"
                        ? "bg-green-400"
                        : transportMode === "polling"
                        ? "bg-blue-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <span className="text-xs opacity-90">
                    {transportMode === "ws"
                      ? "Trực tuyến"
                      : transportMode === "polling"
                      ? "Đang đồng bộ"
                      : "Đang kết nối..."}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Status Banner */}
          {conversation?.status === "CLOSED" && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
              <p className="text-xs text-amber-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">info</span>
                Cuộc trò chuyện đã kết thúc. Vui lòng bắt đầu cuộc trò chuyện mới.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-on-surface-variant">Đang tải...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
                  <p className="text-sm text-on-surface-variant mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-primary/30 mb-3">chat</span>
                  <p className="text-sm text-on-surface-variant">
                    Chào bạn! Rau Nhà Minh có thể giúp gì cho bạn hôm nay?
                  </p>
                </div>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-surface-container text-xs text-on-surface-variant rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.messages.map((msg) => {
                    const isUser = msg.senderRole === "USER";
                    const isSystem = msg.senderRole === "SYSTEM";

                    if (isSystem) {
                      return (
                        <div key={msg.id || msg.clientMessageId} className="flex justify-center my-2">
                          <span className="px-3 py-1 bg-surface-container text-xs text-on-surface-variant rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id || msg.clientMessageId}
                        className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                            isUser
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-surface-container text-on-surface rounded-bl-md"
                          }`}
                        >
                          {!isUser && (
                            <p className="text-xs font-medium mb-0.5 text-primary">
                              {msg.senderRole === "ADMIN" ? "Nhân viên hỗ trợ" : "Khách hàng"}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isUser ? "text-white/70" : "text-on-surface-variant/70"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-outline/20 bg-surface">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={!conversation || conversation.status === "CLOSED" || isSending}
                className="flex-1 px-4 py-2.5 bg-surface-container rounded-full text-sm border border-outline/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || !conversation || conversation.status === "CLOSED" || isSending}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg">send</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
