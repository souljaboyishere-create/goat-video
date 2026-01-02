"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../components/Card";
import Button from "../../components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? { email, password, name }
            : { email, password }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto p-2 sm:p-4 flex items-center justify-center relative pt-16 md:pt-20">
      <div className="max-w-md w-full my-4 animate-fade-in">
        <Card grain className="shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-cream mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-text-secondary">
              {isRegister
                ? "Sign up to start creating AI videos"
                : "Sign in to continue"}
            </p>
          </div>

          {error && (
            <div className="bg-amber/20 border border-amber/50 text-amber p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <Button
            variant="secondary"
            className="w-full mb-4 flex items-center justify-center gap-3"
            onClick={(e) => {
              e.preventDefault();
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
              window.location.href = `${apiUrl}/api/auth/google`;
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-charcoal text-text-muted">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-cream font-medium mb-2 text-sm">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-charcoal-light border border-cream/10 text-cream rounded-lg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-cream font-medium mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-charcoal-light border border-cream/10 text-cream rounded-lg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-cream font-medium mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-charcoal-light border border-cream/10 text-cream rounded-lg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
                placeholder="••••••••"
              />
              {isRegister && (
                <p className="text-text-muted text-xs mt-1">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-amber hover:text-amber-dark transition text-sm"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-text-muted hover:text-cream transition text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

