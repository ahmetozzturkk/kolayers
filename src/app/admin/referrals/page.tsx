'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  message: string;
  taskId: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load referrals from localStorage
    try {
      const storedReferrals = localStorage.getItem('referrals');
      if (storedReferrals) {
        const parsedReferrals = JSON.parse(storedReferrals);
        setReferrals(parsedReferrals);
      } else {
        setReferrals([]);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleExportCSV = () => {
    if (referrals.length === 0) return;
    
    // Create CSV header
    const headers = ['First Name', 'Last Name', 'Email', 'Department', 'Message', 'Task ID', 'Created At'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...referrals.map(referral => [
        `"${referral.firstName}"`, 
        `"${referral.lastName}"`, 
        `"${referral.email}"`,
        `"${referral.department}"`,
        `"${referral.message?.replace(/"/g, '""') || ''}"`,
        `"${referral.taskId}"`,
        `"${new Date(referral.createdAt).toLocaleString()}"`
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `referrals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleClearReferrals = () => {
    if (confirm('Are you sure you want to clear all referral data? This action cannot be undone.')) {
      localStorage.removeItem('referrals');
      setReferrals([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-gray-900">Admin Dashboard - Referrals</h1>
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Submitted Referrals</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportCSV}
                  disabled={referrals.length === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    referrals.length === 0 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Export to CSV
                </button>
                <button 
                  onClick={handleClearReferrals}
                  disabled={referrals.length === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    referrals.length === 0 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Clear All Data
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : referrals.length === 0 ? (
              <div className="bg-gray-50 py-10 text-center rounded-lg">
                <p className="text-gray-500">No referrals have been submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{referral.firstName} {referral.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{referral.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{referral.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{referral.message || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{referral.taskId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(referral.createdAt).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 