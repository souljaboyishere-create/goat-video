"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
        <div className="text-red-400 mb-4">
          <svg
            className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Something went wrong!
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition font-semibold text-sm sm:text-base"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition font-semibold text-sm sm:text-base"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

