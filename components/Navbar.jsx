"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Upload, LogOut, FolderOpen } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 w-full border-b border-white/5 bg-black/80 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-amber-500 rounded-md flex items-center justify-center flex-shrink-0">
              <FolderOpen className="h-4 w-4 text-black" />
            </div>
            <span className="text-white font-bold tracking-tight">Drop&amp;Sync</span>
          </Link>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/file-upload"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <Upload className="h-4 w-4" />
                  My Files
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
