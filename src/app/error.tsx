'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Runtime error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-lavender-800 mb-4">Something went wrong</h2>
        
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. Please try again or return to the home page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-lavender-700 text-white rounded-lg font-medium hover:bg-lavender-800 transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 border border-lavender-700 text-lavender-700 rounded-lg font-medium hover:bg-lavender-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 