'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Mock password reset request (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Section - Form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-lavender-300 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-lavender-900 text-2xl font-extrabold">k</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-lavender-900">Reset your password</h2>
            <p className="mt-2 text-gray-600">We'll send you a link to reset your password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Check your email</h3>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <span className="font-medium">{email}</span>. 
                  Please check your inbox and follow the instructions.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  The link will expire in 24 hours. If you don't see the email, check your spam folder.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 border border-lavender-300 text-lavender-700 rounded-md text-sm font-medium hover:bg-lavender-50 transition-colors"
                  >
                    Resend link
                  </button>
                  <Link href="/login" className="px-4 py-2 bg-lavender-800 text-white rounded-md text-sm font-medium hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 transition-colors text-center">
                    Return to login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-lavender-500"
                  placeholder="you@example.com"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the email address associated with your account.
                </p>
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-lavender-800 text-white font-medium rounded-lg hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Remember your password?</span>{' '}
                <Link href="/login" className="font-medium text-lavender-600 hover:text-lavender-800">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Right Section - Visual */}
      <div className="w-1/2 bg-lavender-50 flex items-center justify-center">
        <div className="relative w-4/5 h-4/5 flex items-center justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-300 rounded-full opacity-20 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-lavender-500 rounded-full opacity-10 -z-10"></div>
          <div className="text-center z-10">
            <div className="w-72 h-72 mb-8 relative">
              <div className="animate-float">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="#7C3AED" d="M42.8,-65.2C54.9,-54.3,63.5,-40.4,69.3,-25.5C75.1,-10.6,78,5.4,74.8,20.8C71.6,36.2,62.2,51,48.5,60.1C34.8,69.2,17.4,72.7,0.7,71.7C-16,70.7,-32,65.3,-46.3,55.5C-60.6,45.7,-73.1,31.6,-75.2,15.9C-77.2,0.2,-68.8,-17.2,-58.4,-29.9C-48,-42.7,-35.6,-50.8,-23.1,-61.7C-10.6,-72.5,2.1,-86.1,16.2,-85.1C30.4,-84.1,60.7,-68.4,42.8,-65.2Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl">🔑</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-lavender-900 mb-2">Password Recovery</h3>
            <p className="text-gray-600 max-w-xs mx-auto">
              We'll help you regain access to your account with a secure password reset process
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 