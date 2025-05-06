'use client';

import React, { useState } from 'react';

interface ReferralFormProps {
  taskId: string;
  description?: string;
  onFormSubmit: () => void;
}

export default function ReferralForm({ taskId, description, onFormSubmit }: ReferralFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success message
    setIsSubmitted(true);
    
    // Call the parent callback to enable Mark as Complete
    onFormSubmit();
    
    // Manually trigger task completion after delay
    setTimeout(() => {
      if (typeof window.markTaskAsComplete === 'function') {
        window.markTaskAsComplete(taskId);
      }
    }, 1500);
  };
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 my-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Recommend a Colleague</h2>
        <p className="text-gray-600 mt-2">{description || 'Help your colleagues improve their skills'}</p>
      </div>
      
      {!isSubmitted ? (
        <form id={`referral-form-${taskId}`} className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">First name <span className="text-red-500">*</span></label>
              <input type="text" id="first-name" required className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
            </div>
            <div className="relative">
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Last name <span className="text-red-500">*</span></label>
              <input type="text" id="last-name" required className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work email <span className="text-red-500">*</span></label>
            <input type="email" id="email" required className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
          </div>
          
          <div className="relative">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select id="department" required className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm appearance-none pr-8 text-sm">
              <option value="">Select department</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Personal message (optional)</label>
            <textarea id="message" rows={2} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm"></textarea>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Send Invitation
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Invite colleagues to earn rewards</p>
          </div>
        </form>
      ) : (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Invitation sent successfully!</h3>
              <div className="mt-1 text-xs text-green-700">
                <p>Your colleague will receive an email invitation shortly. Thank you for helping to improve our team's skills!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Add this to global.d.ts
declare global {
  interface Window {
    markTaskAsComplete: (taskId: string) => void;
  }
} 