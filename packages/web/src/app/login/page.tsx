"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to tRPC auth.login
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Нэвтрэх</h2>
          <p className="mt-2 text-sm text-gray-600">ISO 27001 Аудитын Платформ</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">И-мэйл</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input mt-1"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Нууц үг</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input mt-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base">
            Нэвтрэх
          </button>
        </form>
      </div>
    </div>
  );
}
