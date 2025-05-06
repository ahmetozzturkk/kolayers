import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-lavender-800 mb-4">404</h2>
        <h1 className="text-2xl font-semibold mb-6">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link
          href="/"
          className="px-6 py-3 bg-lavender-700 text-white rounded-lg font-medium hover:bg-lavender-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 