'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      // Login successful, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Section - Login Form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-lavender-300 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-lavender-900 text-2xl font-extrabold">k</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-lavender-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

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
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-lavender-600 hover:text-lavender-800">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
              <input
                id="password"
                name="password"
                  type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:border-lavender-500"
                placeholder="••••••••"
              />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-lavender-600 focus:ring-lavender-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-lavender-800 text-white font-medium rounded-lg hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{' '}
              <Link href="/register" className="font-medium text-lavender-600 hover:text-lavender-800">
                Create one now
              </Link>
            </div>
          </form>
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
                  <path fill="#7C3AED" d="M45.7,-52.1C59.1,-44.7,69.9,-30.6,71.8,-15.8C73.7,-1,66.8,14.4,57.6,27.2C48.4,40,37,50.1,23,59.3C9,68.5,-7.5,76.8,-21.3,72.3C-35.1,67.8,-46.1,50.6,-55.2,33.5C-64.3,16.4,-71.5,-0.7,-67.7,-15.1C-63.8,-29.6,-48.9,-41.4,-34.2,-48.5C-19.5,-55.5,-4.9,-57.8,9.3,-57.8C23.5,-57.8,32.3,-59.4,45.7,-52.1Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl">🏅</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-lavender-900 mb-2">Your Next Achievement Awaits</h3>
            <p className="text-gray-600 max-w-xs mx-auto">
              Login to access your personalized learning journey and track your progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 