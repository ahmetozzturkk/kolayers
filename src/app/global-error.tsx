'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-lavender-800 mb-4">Something went wrong</h2>
            
            <p className="text-gray-600 mb-8">
              We apologize for the critical error. Please try to refresh the page.
            </p>
            
            <button
              onClick={reset}
              className="px-6 py-3 bg-lavender-700 text-white rounded-lg font-medium hover:bg-lavender-800 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 