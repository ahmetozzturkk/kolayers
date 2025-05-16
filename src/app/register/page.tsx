'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!referralCode.trim()) {
      setError('Referral code is required');
      setIsLoading(false);
      return;
    }
    
    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      setIsLoading(false);
      return;
    }
    
    try {
      // Send registration request to API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          referralCode,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Initialize localStorage for new user with empty data
      if (typeof window !== 'undefined') {
        // Initialize empty earned badges, completed tasks, etc.
        localStorage.setItem('earnedBadges', JSON.stringify([]));
        localStorage.setItem('completedTasks', JSON.stringify([]));
        localStorage.setItem('claimedRewards', JSON.stringify([]));
        localStorage.setItem('earnedCertificates', JSON.stringify([]));
        localStorage.setItem('spentPoints', '0');
        localStorage.setItem('startedBadges', JSON.stringify({}));
        
        // Make sure all badges are marked as not earned for the new user
        const existingBadges = localStorage.getItem('customBadges');
        if (existingBadges) {
          try {
            const parsedBadges = JSON.parse(existingBadges);
            parsedBadges.forEach(badge => {
              badge.earned = false;
            });
            localStorage.setItem('customBadges', JSON.stringify(parsedBadges));
          } catch (e) {
            console.error('Error updating badges in localStorage:', e);
          }
        }
        
        console.log('Initialized localStorage for new user');
      }
      
      // Registration successful, redirect to dashboard or login
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Section - Register Form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-lavender-300 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-lavender-900 text-2xl font-extrabold">k</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-lavender-900">Create account</h2>
            <p className="mt-2 text-gray-600">Join Kolayers and start your learning journey</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-lavender-500"
                  placeholder="John Doe"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
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

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:border-lavender-500"
                  placeholder="••••••••"
                />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
            </div>

            <div className="mb-6">
              <label htmlFor="referralCode" className="block text-gray-700 text-sm font-medium mb-2">
                Referral Code
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                required
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-lavender-500"
                placeholder="Enter your referral code"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-lavender-600 hover:text-lavender-800 font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-lavender-600 hover:text-lavender-800 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <button
                type="submit"
                disabled={isLoading}
                className="py-3 px-5 bg-lavender-800 text-white font-medium rounded-lg hover:bg-lavender-700 focus:outline-none focus:ring-2 focus:ring-lavender-500 transition-colors"
              >
                {isLoading ? 'Creating...' : 'Sign up'}
              </button>
              
              <div className="text-sm">
                <span className="text-gray-600">Already have an account?</span>{' '}
                <Link href="/login" className="font-medium text-lavender-600 hover:text-lavender-800">
                  Sign in
                </Link>
              </div>
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
                  <path fill="#7C3AED" d="M49.2,-57.4C63.2,-44.9,73.8,-29.1,76.2,-12.2C78.6,4.8,72.8,22.8,61.8,35.5C50.8,48.2,34.6,55.5,17.8,61C1,66.5,-16.3,70.1,-31.3,65.2C-46.2,60.3,-58.7,46.8,-67.1,30.3C-75.5,13.8,-79.7,-5.9,-74.7,-22.4C-69.7,-38.9,-55.5,-52.2,-40.3,-64.3C-25.2,-76.4,-8.9,-87.2,5.4,-93.1C19.7,-99,39.5,-100,49.2,-57.4Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl">🚀</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-lavender-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 max-w-xs mx-auto">
              Create an account to begin your personalized learning experience with Kolayers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}