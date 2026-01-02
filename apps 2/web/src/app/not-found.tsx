import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
        <div className="text-gray-400 mb-4">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">404</h1>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition font-semibold text-sm sm:text-base"
          >
            Go home
          </Link>
          <Link
            href="/projects"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition font-semibold text-sm sm:text-base"
          >
            View Projects
          </Link>
        </div>
      </div>
    </main>
  );
}

