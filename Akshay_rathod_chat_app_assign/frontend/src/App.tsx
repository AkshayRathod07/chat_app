import { Link, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import "./index.css";
import "./styles_chat.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
          <Link
            to={token ? "/chat" : "/login"}
            className="text-xl font-bold text-indigo-700 tracking-tight"
          >
            ChatApp
          </Link>
          <nav className="flex gap-4 items-center">
            {!token && (
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-700 font-medium"
              >
                Login
              </Link>
            )}
            {!token && (
              <Link
                to="/signup"
                className="text-gray-700 hover:text-indigo-700 font-medium"
              >
                Sign up
              </Link>
            )}
            {token && (
              <button
                className="text-gray-700 hover:text-red-600 font-medium px-3 py-1 rounded transition"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-4xl mx-auto py-8">
          <Routes>
            <Route
              path="/"
              element={
                token ? <Navigate to="/chat" /> : <Navigate to="/login" />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
