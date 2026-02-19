import { useEffect, useState, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getHistory, sendFallback, me } from "../services/api";
import api from "../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import Input from "../components/Input";
import Button from "../components/Button";
import MessageBubble from "../components/MessageBubble";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};

type User = {
  _id: string;
  email: string;
  createdAt: string;
};

export default function Chat() {
  const [otherId, setOtherId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [online, setOnline] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  // For demo: avatar color by user id
  function avatarColor(id: string) {
    const colors = [
      "bg-indigo-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-blue-500",
    ];
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return colors[sum % colors.length];
  }

  useEffect(() => {
    async function init() {
      try {
        const meRes = await me();
        setUserId(meRes.user.id);
        // Fetch all users for sidebar
        const usersRes = await api.get("/api/chat/users");
        setUsers(usersRes.data.users || []);
        // Fetch online status
        const statusRes = await api.get("/api/chat/status");
        setOnline(statusRes.data.online || []);
        const token = localStorage.getItem("token");
        if (token) {
          const s = connectSocket(token);
          socketRef.current = s;
          s.on("connect", () => console.log("socket connected"));
          s.on("receiveMessage", (msg: Message) => {
            setMessages((m) => [...m, msg]);
          });
          s.on("typing", (payload: any) => {
            if (payload?.from === otherId) setTypingUser(payload.from);
          });
          s.on("stopTyping", (payload: any) => {
            if (payload?.from === otherId) setTypingUser(null);
          });
          s.on("userOnline", ({ userId }: any) =>
            setOnline((o) => [...new Set([...o, userId])]),
          );
          s.on("userOffline", ({ userId }: any) =>
            setOnline((o) => o.filter((id) => id !== userId)),
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
    return () => {
      disconnectSocket();
    };
  }, [otherId]);

  async function loadHistory() {
    if (!otherId) return;
    try {
      const data = await getHistory(otherId);
      setMessages(data.messages || []);
      setTypingUser(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend() {
    if (!text || !otherId) return;
    const s = getSocket();
    if (s && s.connected) {
      s.emit("sendMessage", { to: otherId, text }, (ack: any) => {
        if (ack && ack.ok && ack.message) {
          setMessages((m) => [...m, ack.message]);
          setText("");
        }
      });
      s.emit("stopTyping", { to: otherId });
    } else {
      // fallback to REST
      try {
        const res = await sendFallback(otherId, text);
        if (res && res.message) {
          setMessages((m) => [...m, res.message]);
          setText("");
        }
        // REST fallback for stopTyping
        await api.post("/api/chat/stopTyping", { to: otherId });
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Typing indicator logic
  let typingTimeout: NodeJS.Timeout | null = null;
  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (!otherId) return;
    const s = getSocket();
    if (s && s.connected) {
      s.emit("typing", { to: otherId });
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        s.emit("stopTyping", { to: otherId });
      }, 2000);
    } else {
      // REST fallback
      api.post("/api/chat/typing", { to: otherId });
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        api.post("/api/chat/stopTyping", { to: otherId });
      }, 2000);
    }
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-root flex min-h-[60vh] rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col gap-6 p-6 bg-gray-50 border-r border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${userId ? avatarColor(userId) : "bg-gray-300"}`}
          >
            {userId ? userId[0]?.toUpperCase() : "?"}
          </div>
          <div>
            <div className="text-xs text-gray-500">Your ID</div>
            <div className="text-xs font-mono text-gray-700 break-all max-w-[10rem]">
              {userId || "—"}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Chat with</label>
          <div className="flex flex-col gap-2 max-h-48 overflow-auto">
            {users.map((u) => (
              <button
                key={u._id}
                className={`sidebar-user w-full text-left transition ${otherId === u._id ? "sidebar-user--selected" : ""}`}
                onClick={() => {
                  setOtherId(u._id);
                  loadHistory();
                }}
              >
                <div className="w-full flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(u._id)}`}
                    >
                      {u._id[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div className="sidebar-user__meta ml-3 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="sidebar-user__title">{u.email}</div>
                      <div className="text-xs text-gray-400">
                        {online.includes(u._id) ? "Online" : ""}
                      </div>
                    </div>
                    <div className="sidebar-user__snippet">
                      <span className="inline-block align-top">
                        {online.includes(u._id) ? "Available" : "Tap to chat"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-400 text-center">
          Simple Chat Demo
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 p-6 overflow-auto space-y-4 bg-white"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-3 ${m.senderId === userId ? "justify-end" : "justify-start"}`}
            >
              {m.senderId !== userId && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(m.senderId)}`}
                >
                  {m.senderId[0]?.toUpperCase()}
                </div>
              )}

              {/* content wrapper controls bubble width responsively */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] md:max-w-[72%] lg:max-w-[60%]`}
              >
                <MessageBubble text={m.text} mine={m.senderId === userId} />
                <div className="text-[10px] text-gray-400 mt-1 text-right pr-1">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {m.senderId === userId && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(m.senderId)}`}
                >
                  {m.senderId[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {typingUser && (
            <div className="text-xs text-gray-500 italic mt-2">
              {users.find((u) => u._id === typingUser)?.email || "Someone"} is
              typing…
            </div>
          )}
        </div>

        <form
          className="p-4 bg-white border-t flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={text}
            onChange={handleTyping}
            placeholder="Type a message"
            className="flex-1"
            disabled={!otherId}
          />
          <Button type="submit" className="px-6" disabled={!otherId || !text}>
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}
