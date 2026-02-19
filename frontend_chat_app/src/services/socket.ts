import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) return socket;
  socket = io(API_BASE, {
    auth: { token },
  });
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
};
