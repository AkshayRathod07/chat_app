import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(email, password);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/chat");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              type="password"
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            Sign in
          </Button>
          {error && (
            <div className="text-sm text-red-600 text-center mt-2">{error}</div>
          )}
        </form>
      </Card>
    </div>
  );
}
