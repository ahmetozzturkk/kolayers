"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { certificates, badges, currentUser, modules, tasks } from '../../lib/mockData';

export default function CertificatesPage() {
  // State to store loaded certificates
  const [loadedCertificates, setLoadedCertificates] = useState(certificates);
  
  // Initialize state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load custom certificates if they exist
        const customCertificates = localStorage.getItem('customCertificates');
        if (customCertificates) {
          const parsedCustomCertificates = JSON.parse(customCertificates);
          console.log('Loaded custom certificates in certificates page:', parsedCustomCertificates);
          
          // Update certificates with custom certificates
          setLoadedCertificates(parsedCustomCertificates);
        }
        
        // Load custom badges if they exist
        const customBadges = localStorage.getItem('customBadges');
        if (customBadges) {
          const parsedCustomBadges = JSON.parse(customBadges);
          console.log('Loaded custom badges in certificates page:', parsedCustomBadges);
          
          // Update the badges array with custom badges
          badges.length = 0;
          badges.push(...parsedCustomBadges);
        }
        
        // Also load modules and tasks to ensure relationships work properly
        const customModules = localStorage.getItem('customModules');
        if (customModules) {
          const parsedCustomModules = JSON.parse(customModules);
          console.log('Loaded custom modules in certificates page:', parsedCustomModules);
          
          // Update the modules array
          modules.length = 0;
          modules.push(...parsedCustomModules);
        }
        
        const customTasks = localStorage.getItem('customTasks');
        if (customTasks) {
          const parsedCustomTasks = JSON.parse(customTasks);
          console.log('Loaded custom tasks in certificates page:', parsedCustomTasks);
          
          // Update the tasks array
          tasks.length = 0;
          tasks.push(...parsedCustomTasks);
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
      }
    }
  }, []);

  // Add an effect to refresh certificate status when the component is focused
  useEffect(() => {
    const handleFocus = () => {
      // Reload data when the window regains focus
      if (typeof window !== 'undefined') {
        try {
          // Load custom certificates 
          const customCertificates = localStorage.getItem('customCertificates');
          if (customCertificates) {
            const parsedCustomCertificates = JSON.parse(customCertificates);
            console.log('Reloaded custom certificates in certificates page on focus:', parsedCustomCertificates);
            
            // Update certificates
            setLoadedCertificates(parsedCustomCertificates);
          }
          
          // Load custom badges
          const customBadges = localStorage.getItem('customBadges');
          if (customBadges) {
            const parsedCustomBadges = JSON.parse(customBadges);
            
            // Update badges
            badges.length = 0;
            badges.push(...parsedCustomBadges);
          }
          
          // Load custom modules
          const customModules = localStorage.getItem('customModules');
          if (customModules) {
            const parsedCustomModules = JSON.parse(customModules);
            
            // Update modules
            modules.length = 0;
            modules.push(...parsedCustomModules);
          }
          
          // Load custom tasks
          const customTasks = localStorage.getItem('customTasks');
          if (customTasks) {
            const parsedCustomTasks = JSON.parse(customTasks);
            
            // Update tasks
            tasks.length = 0;
            tasks.push(...parsedCustomTasks);
          }
        } catch (e) {
          console.error('Error loading data from localStorage on focus:', e);
        }
      }
    };

    // Add event listener for window focus
    window.addEventListener('focus', handleFocus);
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get the user's earned badge IDs
  const earnedBadgeIds = (() => {
    // First check if there are any earned badges in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedEarnedBadges = localStorage.getItem('earnedBadges');
        if (savedEarnedBadges) {
          const parsedEarnedBadges = JSON.parse(savedEarnedBadges);
          console.log('Found earned badges in localStorage:', parsedEarnedBadges);
          
          // Update badge earned status based on localStorage data
          badges.forEach(badge => {
            badge.earned = parsedEarnedBadges.includes(badge.id);
          });
          
          // Return the parsed badges from localStorage
          return parsedEarnedBadges;
        }
      } catch (e) {
        console.error('Error reading earned badges from localStorage:', e);
      }
    }
    
    // Fallback to currentUser badges if localStorage failed or had no data
    return currentUser.badges
      .filter(badge => badge.earned)
      .map(badge => badge.id);
  })();

  console.log('Using earned badge IDs:', earnedBadgeIds);

  // Enhance certificates with badge details and update their earned status
  const certificatesWithDetails = loadedCertificates.map(certificate => {
    const requiredBadges = certificate.badgesRequired.map(badgeId => 
      badges.find(badge => badge.id === badgeId)
    ).filter(badge => badge !== undefined);
    
    // Calculate how many required badges are earned
    const earnedBadgesCount = requiredBadges.filter(badge => 
      badge?.earned || earnedBadgeIds.includes(badge?.id)
    ).length;
    
    // Calculate progress percentage
    const progress = requiredBadges.length > 0 
      ? (earnedBadgesCount / requiredBadges.length) * 100 
      : 0;
    
    // Certificate is earned when all required badges are earned
    const isEarned = requiredBadges.length > 0 && earnedBadgesCount === requiredBadges.length;
    
    // Save earned status if all badges are earned
    if (isEarned && !certificate.earned && typeof window !== 'undefined') {
      try {
        // Load existing earned certificates
        let earnedCertificates = [];
        const savedEarnedCertificates = localStorage.getItem('earnedCertificates');
        if (savedEarnedCertificates) {
          earnedCertificates = JSON.parse(savedEarnedCertificates);
        }
        
        // Add this certificate if not already in the list
        if (!earnedCertificates.includes(certificate.id)) {
          earnedCertificates.push(certificate.id);
          localStorage.setItem('earnedCertificates', JSON.stringify(earnedCertificates));
          console.log(`Certificate ${certificate.id} (${certificate.title}) saved to localStorage as earned`);
        }
      } catch (e) {
        console.error('Error saving earned certificate to localStorage:', e);
      }
    }
    
    return {
      ...certificate,
      requiredBadges,
      progress,
      earned: isEarned
    };
  });

  return (
    <div className="h-screen grid grid-cols-[240px_1fr] grid-rows-[64px_1fr]">
      {/* Top Left: Logo and Brand */}
      <div className="bg-white px-6 flex items-center border-b border-r border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="font-semibold text-gray-800">Kolayers</span>
        </div>
      </div>
      
      {/* Top Right: Certificates Info */}
      <div className="bg-white px-6 flex items-center justify-start border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Certificates</div>
          <div className="text-sm text-gray-600">Earn badges to unlock prestigious certificates</div>
        </div>
      </div>
      
      {/* Left: Navigation Menu */}
      <div className="bg-white border-r border-gray-200 py-6 flex flex-col">
        <nav className="flex-1">
          <ul className="space-y-1 px-3">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/badges" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                Badges
              </Link>
            </li>
            <li>
              <Link 
                href="/tasks" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Tasks
              </Link>
            </li>
            <li>
              <Link 
                href="/certificates" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                Certificates
              </Link>
            </li>
            <li>
              <Link 
                href="/rewards" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
                Rewards
              </Link>
            </li>
            <li>
              <Link 
                href="/profile" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Right: Content Area */}
      <div className="bg-gray-50 overflow-auto p-6">
        {certificatesWithDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-xl font-medium">No certificates available</p>
            <p className="mt-2">Certificates created in the admin page will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificatesWithDetails.map(certificate => (
              <div key={certificate.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${certificate.earned ? 'bg-purple-50' : 'bg-white'}`}>
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <div className="text-purple-600 text-xl font-bold">{certificate.title.charAt(0)}</div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold">{certificate.title}</h2>
                      <p className="text-gray-600 my-2">{certificate.description}</p>
                      
                      <div className="flex items-center text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full ${certificate.earned ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {certificate.earned ? 'Earned' : 'In Progress'}
                        </span>
                        <span className="ml-2 text-gray-500">
                          {certificate.requiredBadges.filter(badge => badge?.earned).length} of {certificate.requiredBadges.length} badges earned
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{Math.round(certificate.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${certificate.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <h3 className="font-medium mb-3">Required Badges</h3>
                  <div className="space-y-3">
                    {certificate.requiredBadges.map(badge => (
                      <div key={badge?.id} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge?.earned ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {badge?.earned ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <span className="font-medium">{badge?.title}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {badge?.earned ? 'Earned' : 'Not yet earned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 