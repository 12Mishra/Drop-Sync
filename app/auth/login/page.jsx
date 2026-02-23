"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { FolderOpen, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const information = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log(information);

    if (!information.error) {
      toast.success("Successfully logged in");
      router.push("/file-upload");
    } else {
      toast.error("Could not log in — check your credentials");
      setLoading(false);
    }
  };

  if (session) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-16">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
            <FolderOpen className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your Drop&amp;Sync account</p>
        </div>

        <div className="bg-zinc-950/60 border border-white/8 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-white/60">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/25" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-white/60">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-white/25" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-amber-500/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-5">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
