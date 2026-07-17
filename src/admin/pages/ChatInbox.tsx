import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Search, LoaderCircle, Phone, X, RotateCcw, Check } from "lucide-react";
import { useChatWebSocket, type ChatSocketMessage } from "@/hooks/useChatWebSocket";
import { chatService, type ChatConversation, type ChatMessage } from "@/services/chatService";

type StatusFilter = "" | "OPEN" | "CLOSED";

export const getMessageTimestamp = (msg: ChatMessage) =>
  new Date(msg.createdAt ?? 0).getTime() || 0;

export const sortMessagesChronologically = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

export default function ChatInbox() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((msg: ChatSocketMessage) => {
    if (msg.type === "CHAT_MESSAGE" && msg.messageId && msg.conversationId) {
      const newMsg: ChatMessage = {
        id: msg.messageId,
        conversationId: msg.conversationId,
        senderId: msg.senderId ?? null,
        senderEmail: msg.senderEmail ?? null,
        senderRole: (msg.senderRole as ChatMessage["senderRole"]) ?? "ADMIN",
        content: msg.content ?? "",
        status: (msg.status as ChatMessage["status"]) ?? "SENT",
        clientMessageId: msg.clientMessageId ?? null,
        createdAt: msg.createdAt ?? new Date().toISOString(),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.clientMessageId === newMsg.clientMessageId)) {
          return prev;
        }
        return [...prev, newMsg];
      });
      setConversations((prev) => {
        return prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessageAt: newMsg.createdAt }
            : c
        ).sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
      });
    }
  }, []);

  const { isConnected, status, connectionError, wsUrl, sendMessage: wsSendMessage, reconnect } = useChatWebSocket({
    conversationId: selectedConversation?.id,
    onMessage: handleNewMessage,
  });

  const loadConversations = async (targetPage = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const result = await chatService.getAdminConversations(
        status || undefined,
        targetPage,
        20
      );
      setConversations(result.content.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      }));
      setPage(result.number);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations(0);
  }, [statusFilter]);

  const selectConversation = async (conv: ChatConversation) => {
    setSelectedConversation(conv);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const result = await chatService.getAdminMessages(conv.id, 0, 50);
      setMessages(sortMessagesChronologically(result.content));
      await chatService.adminMarkAsRead(conv.id);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !selectedConversation || isSending) return;

    setIsSending(true);
    setInputValue("");

    const tempId = crypto.randomUUID();
    const tempMsg: ChatMessage = {
      id: 0,
      conversationId: selectedConversation.id,
      senderId: null,
      senderEmail: null,
      senderRole: "ADMIN",
      content,
      status: "SENT",
      clientMessageId: tempId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      wsSendMessage(content, tempId);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== tempId));
      setInputValue(content);
      const errorMessage = e instanceof Error ? e.message : "Không thể gửi tin nhắn.";
      setSendError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClose = async (id: number) => {
    setProcessingId(id);
    try {
      const updated = await chatService.closeConversation(id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      if (selectedConversation?.id === id) {
        setSelectedConversation(updated);
      }
    } catch (err) {
      console.error("Failed to close conversation:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReopen = async (id: number) => {
    setProcessingId(id);
    try {
      const updated = await chatService.reopenConversation(id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      if (selectedConversation?.id === id) {
        setSelectedConversation(updated);
      }
    } catch (err) {
      console.error("Failed to reopen conversation:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      conv.userEmail?.toLowerCase().includes(term) ||
      conv.userFullName?.toLowerCase().includes(term)
    );
  });

  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let lastDate = "";

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (msgDate !== lastDate) {
      groupedMessages.push({ date: msgDate, messages: [msg] });
      lastDate = msgDate;
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-[1600px] mx-auto">
      {/* Conversations List */}
      <div className="w-80 border-r border-outline-variant/20 flex flex-col bg-surface-container-lowest">
        <div className="p-4 border-b border-outline-variant/20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-on-surface">Hội thoại hỗ trợ</h2>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "open"
                    ? "bg-green-500 animate-pulse"
                    : status === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : status === "error"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
                title={connectionError || undefined}
              />
              <span className="text-xs text-on-surface-variant">
                {status === "open"
                  ? "Online"
                  : status === "connecting"
                  ? "Đang kết nối..."
                  : status === "error"
                  ? "Lỗi kết nối"
                  : "Offline"}
              </span>
              {(status === "error" || status === "closed") && (
                <button
                  type="button"
                  onClick={() => reconnect()}
                  className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  title={connectionError || "Thử kết nối lại"}
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center bg-surface-container rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-on-surface-variant/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm khách hàng..."
              className="bg-transparent border-none outline-none text-sm ml-2 w-full"
            />
          </div>
          <div className="flex gap-2">
            {(["", "OPEN", "CLOSED"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {status === "" ? "Tất cả" : status === "OPEN" ? "Đang mở" : "Đã đóng"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoaderCircle className="w-6 h-6 animate-spin text-on-surface-variant" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">chat</span>
              <p className="text-sm">Không có hội thoại</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => void selectConversation(conv)}
                className={`w-full p-4 text-left border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${
                  selectedConversation?.id === conv.id ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-on-surface truncate">
                      {conv.userFullName || "Khách hàng"}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {conv.userEmail}
                    </p>
                    <p className="text-xs text-on-surface-variant/70 mt-1 truncate">
                      {conv.lastMessageAt
                        ? `Tin nhắn cuối: ${formatDate(conv.lastMessageAt)}`
                        : "Chưa có tin nhắn"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        conv.status === "OPEN"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {conv.status === "OPEN" ? "Mở" : "Đóng"}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest">
        {selectedConversation ? (
          <>
            {connectionError && status !== "open" && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-200 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                    <span className="truncate">{connectionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => reconnect()}
                    className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    Kết nối lại
                  </button>
                </div>
                {wsUrl && (
                  <div className="text-[10px] font-mono text-red-600/70 truncate">
                    Đang cố kết nối tới: <span className="select-all">{wsUrl}</span>
                  </div>
                )}
              </div>
            )}
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface">
              <div>
                <h3 className="font-bold text-on-surface">
                  {selectedConversation.userFullName || "Khách hàng"}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {selectedConversation.userEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.status === "OPEN" ? (
                  <button
                    onClick={() => void handleClose(selectedConversation.id)}
                    disabled={processingId === selectedConversation.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedConversation.id ? (
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    Đóng hội thoại
                  </button>
                ) : (
                  <button
                    onClick={() => void handleReopen(selectedConversation.id)}
                    disabled={processingId === selectedConversation.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedConversation.id ? (
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Mở lại
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <LoaderCircle className="w-6 h-6 animate-spin text-on-surface-variant" />
                </div>
              ) : groupedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">chat</span>
                  <p className="text-sm">Bắt đầu cuộc trò chuyện với khách hàng</p>
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
                      const isAdmin = msg.senderRole === "ADMIN";
                      const isSystem = msg.senderRole === "SYSTEM";

                      if (isSystem) {
                        return (
                          <div
                            key={msg.id || msg.clientMessageId}
                            className="flex justify-center my-2"
                          >
                            <span className="px-3 py-1 bg-surface-container text-xs text-on-surface-variant rounded-full">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id || msg.clientMessageId}
                          className={`flex mb-3 ${isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                              isAdmin
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-white text-on-surface rounded-bl-md shadow-sm"
                            }`}
                          >
                            {!isAdmin && (
                              <p className="text-xs font-medium mb-1 text-primary">
                                {selectedConversation.userFullName || "Khách hàng"}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 ${isAdmin ? "justify-end" : "justify-start"}`}>
                              <span
                                className={`text-[10px] ${
                                  isAdmin ? "text-white/70" : "text-on-surface-variant/70"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </span>
                              {isAdmin && msg.status === "READ" && (
                                <Check className="w-3 h-3 text-white/70" />
                              )}
                            </div>
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
            <div className="p-4 border-t border-outline-variant/20 bg-surface">
              {selectedConversation.status === "CLOSED" ? (
                <div className="text-center py-3 text-sm text-on-surface-variant">
                  Hội thoại đã kết thúc. Nhấn "Mở lại" để tiếp tục.
                </div>
              ) : (
                <div className="space-y-2">
                  {sendError && (
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-xs text-red-700">{sendError}</span>
                      <button
                        type="button"
                        onClick={() => setSendError(null)}
                        className="text-red-700 hover:text-red-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {status !== "open" && (
                    <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                      {status === "connecting"
                        ? "Đang kết nối tới máy chủ chat..."
                        : status === "error"
                        ? "Mất kết nối. Nhấn 'Kết nối lại' ở trên."
                        : "Đang đóng kết nối..."}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (sendError) setSendError(null);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        status === "open"
                          ? "Nhập tin nhắn..."
                          : status === "connecting"
                          ? "Đang kết nối..."
                          : "Chưa kết nối - không thể gửi"
                      }
                      disabled={isSending || status !== "open"}
                      className="flex-1 px-4 py-3 bg-surface-container rounded-full text-sm border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => void handleSend()}
                      disabled={!inputValue.trim() || isSending || status !== "open"}
                      className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined">send</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">support_agent</span>
            <p className="text-lg font-medium">Chọn một hội thoại để bắt đầu</p>
            <p className="text-sm mt-1">Các cuộc trò chuyện của khách hàng sẽ hiển thị ở đây</p>
          </div>
        )}
      </div>
    </div>
  );
}
