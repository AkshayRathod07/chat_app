import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(email: string, password: string) {
  const res = await api.post("/api/auth/register", { email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function me() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export async function getHistory(otherUserId: string, page = 1, limit = 50) {
  const res = await api.get("/api/chat/history", {
    params: { userId: otherUserId, page, limit },
  });
  return res.data;
}

export async function sendFallback(to: string, text: string) {
  const res = await api.post("/api/chat/send", { to, text });
  return res.data;
}

export default api;
