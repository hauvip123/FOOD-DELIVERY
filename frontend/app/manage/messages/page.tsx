"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChatCircleText, PaperPlaneTilt, Storefront, UserCircle } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChatConversation, ChatMessage, getChatConversations, getChatMessages, sendChatMessage } from "@/lib/chat";
import { createChatSocket, type ChatSocket } from "@/lib/chat-socket";

function formatTime(value?: string | null) {
  if (!value) {
    return "Chưa có tin nhắn";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export default function ManageMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const socketRef = useRef<ChatSocket | null>(null);
  const selectedConversationIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
  }, [conversations, selectedConversationId]);

  function createOptimisticMessage(conversationId: number, content: string): ChatMessage {
    return {
      id: -Date.now(),
      conversationId,
      senderId: user?.id ?? 0,
      senderRole: user?.role ?? "customer",
      content,
      createdAt: new Date().toISOString(),
    };
  }

  function mergeIncomingMessage(message: ChatMessage) {
    setMessages((currentMessages) => {
      const optimisticIndex = currentMessages.findIndex((currentMessage) => (
        currentMessage.id < 0
        && currentMessage.senderId === message.senderId
        && currentMessage.content === message.content
      ));

      if (optimisticIndex >= 0) {
        const nextMessages = [...currentMessages];
        nextMessages[optimisticIndex] = message;
        return nextMessages.filter((currentMessage, index) => (
          currentMessage.id !== message.id || index === optimisticIndex
        ));
      }

      return currentMessages.some((currentMessage) => currentMessage.id === message.id)
        ? currentMessages
        : [...currentMessages, message];
    });
  }

  function updateConversationPreview(conversationId: number, content: string, createdAt: string) {
    setConversations((currentConversations) => currentConversations.map((conversation) => (
      conversation.id === conversationId
        ? { ...conversation, lastMessage: content, lastMessageAt: createdAt }
        : conversation
    )));
  }

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on("chat:message", (message) => {
      updateConversationPreview(message.conversationId, message.content, message.createdAt);

      if (message.conversationId === selectedConversationIdRef.current) {
        mergeIncomingMessage(message);
      }
    });

    socket.on("connect_error", () => {
      setErrorMessage("Kết nối realtime đang gián đoạn, hệ thống sẽ gửi bằng chế độ dự phòng.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadConversations() {
      setIsLoadingConversations(true);
      setErrorMessage("");
      try {
        const data = await getChatConversations();
        if (isCurrentRequest) {
          setConversations(data);
          setSelectedConversationId((currentId) => currentId ?? data[0]?.id ?? null);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setConversations([]);
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải tin nhắn nhà hàng.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingConversations(false);
        }
      }
    }

    loadConversations();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    let isCurrentRequest = true;
    const conversationId = selectedConversationId;

    async function loadMessages(showLoading = false) {
      if (showLoading) {
        setIsLoadingMessages(true);
      }

      try {
        const data = await getChatMessages(conversationId);
        if (isCurrentRequest) {
          setMessages(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải nội dung hội thoại.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages(true);
    socketRef.current?.emit("chat:join", { conversationId });

    return () => {
      isCurrentRequest = false;
      socketRef.current?.emit("chat:leave", { conversationId });
    };
  }, [selectedConversationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();

    if (!selectedConversationId || !content || isSending) {
      return;
    }

    const optimisticMessage = createOptimisticMessage(selectedConversationId, content);
    mergeIncomingMessage(optimisticMessage);
    updateConversationPreview(selectedConversationId, content, optimisticMessage.createdAt);

    setIsSending(true);
    setDraft("");

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("chat:send", { conversationId: selectedConversationId, content }, (response) => {
        setIsSending(false);
        if (!response?.ok) {
          setMessages((currentMessages) => currentMessages.filter((message) => message.id !== optimisticMessage.id));
          setDraft(content);
          setErrorMessage(response?.message || "Không thể gửi tin nhắn.");
        }
      });
      return;
    }

    try {
      const message = await sendChatMessage(selectedConversationId, content);
      mergeIncomingMessage(message);
      updateConversationPreview(selectedConversationId, content, message.createdAt);
    } catch (error) {
      setMessages((currentMessages) => currentMessages.filter((message) => message.id !== optimisticMessage.id));
      setDraft(content);
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể gửi tin nhắn.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Hộp thư nhà hàng</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#23140c]">Tin nhắn khách hàng</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-[#704322]/60">
            Trả lời câu hỏi về món ăn, ghi chú đơn và các yêu cầu từ khách.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
          <p className="text-3xl font-black text-[#23140c]">{conversations.length}</p>
          <p className="text-xs font-black uppercase tracking-widest text-[#704322]/50">Hội thoại</p>
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 rounded-[1.25rem] bg-red-50 px-5 py-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
          {errorMessage}
        </div>
      )}

      <section className="grid h-[min(720px,calc(100dvh-10rem))] min-h-[560px] overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_55px_-32px_rgba(35,20,12,0.45)] ring-1 ring-black/5 xl:grid-cols-[360px_1fr]">
        <aside className="no-scrollbar min-h-0 overflow-y-auto border-b border-[#23140c]/5 bg-[#fff7ed] p-4 xl:border-b-0 xl:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#23140c]">Khách đang chat</h2>
            <ChatCircleText size={24} weight="bold" className="text-[#ff6b00]" />
          </div>

          {isLoadingConversations ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[1.25rem] bg-white ring-1 ring-black/5" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 bg-white px-5 py-14 text-center">
              <UserCircle size={44} weight="bold" className="mx-auto text-orange-200" />
              <h3 className="mt-4 text-lg font-black text-[#23140c]">Chưa có khách nhắn</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#704322]/55">
                Khi khách mở chat với nhà hàng, hội thoại sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const isActive = selectedConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`flex w-full items-center gap-3 rounded-[1.25rem] p-3 text-left transition-all active:scale-[0.98] ${isActive ? "bg-[#23140c] text-white shadow-lg" : "bg-white text-[#23140c] ring-1 ring-black/5 hover:bg-orange-50"}`}
                  >
                    <div className={`grid size-12 shrink-0 place-items-center rounded-[1rem] ${isActive ? "bg-white/10 text-white" : "bg-orange-50 text-[#ff6b00]"}`}>
                      <UserCircle size={24} weight="bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{conversation.user?.username ?? "Khách hàng"}</p>
                      <p className={`mt-1 truncate text-xs font-bold ${isActive ? "text-white/55" : "text-[#704322]/50"}`}>
                        {conversation.restaurant?.name ?? "Nhà hàng"} • {conversation.lastMessage || "Chưa có tin mới"}
                      </p>
                    </div>
                    <ArrowRight size={17} weight="bold" className={isActive ? "text-white/50" : "text-[#704322]/25"} />
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="flex min-h-0 flex-col">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-[#23140c]/5 px-5 py-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-[#23140c]">{selectedConversation.user?.username ?? "Khách hàng"}</h2>
                  <p className="mt-1 flex items-center gap-2 text-xs font-bold text-[#704322]/50">
                    <Storefront size={14} weight="bold" />
                    {selectedConversation.restaurant?.name ?? "Nhà hàng"} • {formatTime(selectedConversation.lastMessageAt)}
                  </p>
                </div>
                <Link href={`/manage/restaurants/${selectedConversation.restaurantId}`} className="hidden h-11 items-center justify-center rounded-[1rem] bg-orange-50 px-4 text-xs font-black text-[#ff6b00] ring-1 ring-orange-100 transition-all hover:bg-orange-100 active:scale-95 sm:inline-flex">
                  Xem nhà hàng
                </Link>
              </div>

              <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fffcf8] p-5">
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className={`h-14 w-2/3 animate-pulse rounded-[1.25rem] bg-white ${index % 2 ? "ml-auto" : ""}`} />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[360px] items-center justify-center text-center">
                    <div className="max-w-sm">
                      <ChatCircleText size={48} weight="bold" className="mx-auto text-orange-200" />
                      <h3 className="mt-4 text-xl font-black text-[#23140c]">Chưa có nội dung</h3>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-[#704322]/55">Gửi phản hồi đầu tiên để hỗ trợ khách.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user?.id;

                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-[1.35rem] px-4 py-3 shadow-sm ${isMine ? "bg-[#23140c] text-white" : "bg-white text-[#23140c] ring-1 ring-black/5"}`}>
                          <p className="whitespace-pre-wrap break-words text-sm font-bold leading-relaxed">{message.content}</p>
                          <p className={`mt-2 text-[10px] font-black uppercase tracking-widest ${isMine ? "text-white/35" : "text-[#704322]/35"}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                              <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex gap-3 border-t border-[#23140c]/5 bg-white p-4">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Trả lời khách hàng..."
                  maxLength={1000}
                  className="h-13 min-w-0 flex-1 rounded-[1rem] bg-[#fff7ed] px-5 text-sm font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all placeholder:text-[#704322]/35 focus:bg-white focus:ring-orange-100"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="grid size-13 place-items-center rounded-[1rem] bg-[#ff6b00] text-white shadow-[0_12px_25px_-16px_rgba(255,107,0,0.9)] transition-all hover:bg-[#23140c] disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                >
                  <PaperPlaneTilt size={22} weight="bold" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <ChatCircleText size={54} weight="bold" className="mx-auto text-orange-200" />
                <h2 className="mt-4 text-2xl font-black text-[#23140c]">Chọn một khách hàng</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#704322]/55">Hội thoại nhà hàng sẽ hiển thị khi bạn chọn một khách trong danh sách.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
