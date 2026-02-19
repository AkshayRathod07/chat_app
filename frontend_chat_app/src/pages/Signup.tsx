import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/api";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const data = await register(email, password);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/chat");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Create an account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <Input
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <Input
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              type="password"
              placeholder="••••••"
            />
          </div>

          <div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      </Card>
    </div>
  );
}
