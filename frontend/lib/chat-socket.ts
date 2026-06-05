import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/chat";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export type ChatServerToClientEvents = {
  "chat:message": (message: ChatMessage) => void;
};

export type ChatClientToServerEvents = {
  "chat:join": (
    payload: { conversationId: number },
    callback?: (response: { ok: boolean; message?: string }) => void,
  ) => void;
  "chat:leave": (
    payload: { conversationId: number },
    callback?: (response: { ok: boolean }) => void,
  ) => void;
  "chat:send": (
    payload: { conversationId: number; content: string },
    callback?: (response: { ok: boolean; message?: string; data?: ChatMessage }) => void,
  ) => void;
};

export type ChatSocket = Socket<ChatServerToClientEvents, ChatClientToServerEvents>;

export function createChatSocket(token: string): ChatSocket {
  return io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  });
}
