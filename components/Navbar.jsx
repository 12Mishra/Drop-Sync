"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  function handleLoginRouting() {
    router.push("/auth/login");
  }

  function handleSignupRouting() {
    router.push("/auth/signup");
  }

  function handleUploadRoute(){
    router.push('/file-upload')
  }

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white">
              Drop&Sync
            </Link>
          </div>

          <div className="flex gap-4">
            {session ? (
              <>
                <button
                  onClick={() => handleUploadRoute()}
                  className="px-4 py-2 text-white hover:text-amber-400 transition-colors"
                >
                  Uploads
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginRouting}
                  className="px-4 py-2 text-white hover:text-amber-400 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupRouting}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
