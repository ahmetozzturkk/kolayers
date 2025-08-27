'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { tasks, badges, certificates, rewards } from '../../lib/mockData';
import { getCurrentUser } from '../../lib/api';

// Simple throttle function to prevent too many calls
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);
  const [earnedCertificateIds, setEarnedCertificateIds] = useState<string[]>([]);
  const [spentPoints, setSpentPoints] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        console.log('🔍 Dashboard: Loading user...');
        const userData = await getCurrentUser();
        console.log('👤 Dashboard: User data received:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Dashboard: Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    
    // Load data from localStorage
    if (typeof window !== 'undefined') {
      try {
        // Load earned badges
        const savedEarnedBadges = localStorage.getItem('earnedBadges');
        if (savedEarnedBadges) {
          const parsedEarnedBadges = JSON.parse(savedEarnedBadges);
          setEarnedBadgeIds(parsedEarnedBadges);
          console.log('Loaded earned badges:', parsedEarnedBadges);
          
          // Update badges' earned status
          badges.forEach(badge => {
            badge.earned = parsedEarnedBadges.includes(badge.id);
          });
        }
        
        // Load claimed rewards
        const savedClaimedRewards = localStorage.getItem('claimedRewards');
        if (savedClaimedRewards) {
          const parsedClaimedRewards = JSON.parse(savedClaimedRewards);
          setClaimedRewardIds(parsedClaimedRewards);
          console.log('Loaded claimed rewards:', parsedClaimedRewards);
          
          // Update rewards' claimed status
          rewards.forEach(reward => {
            reward.claimed = parsedClaimedRewards.includes(reward.id);
          });
        }
        
        // Load earned certificates
        const savedEarnedCertificates = localStorage.getItem('earnedCertificates');
        if (savedEarnedCertificates) {
          const parsedEarnedCertificates = JSON.parse(savedEarnedCertificates);
          setEarnedCertificateIds(parsedEarnedCertificates);
          console.log('Loaded earned certificates:', parsedEarnedCertificates);
          
          // Update certificates' earned status
          certificates.forEach(certificate => {
            certificate.earned = parsedEarnedCertificates.includes(certificate.id);
          });
        }
        
        // Load spent points
        const savedSpentPoints = localStorage.getItem('spentPoints');
        if (savedSpentPoints) {
          setSpentPoints(parseInt(savedSpentPoints, 10));
          console.log('Loaded spent points:', parseInt(savedSpentPoints, 10));
        }
        
        // Load completed tasks
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        if (savedCompletedTasks) {
          const parsedCompletedTasks = JSON.parse(savedCompletedTasks);
          setCompletedTaskIds(parsedCompletedTasks);
          console.log('Loaded completed tasks:', parsedCompletedTasks);
          
          // Update tasks' completed status
          tasks.forEach(task => {
            task.completed = parsedCompletedTasks.includes(task.id);
          });
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
      }
    }
    
    // Set up an interval to refresh user data periodically
    const refreshInterval = setInterval(loadUser, 120000); // Reduced from 30sec to 120sec (2 mins)
    
    // Function to refresh task data
    const refreshTaskData = () => {
      if (typeof window !== 'undefined') {
        try {
          // Get latest completed tasks
          const savedCompletedTasks = localStorage.getItem('completedTasks');
          if (savedCompletedTasks) {
            const parsedCompletedTasks = JSON.parse(savedCompletedTasks);
            setCompletedTaskIds(parsedCompletedTasks);
            
            // Update tasks' completed status
            tasks.forEach(task => {
              task.completed = parsedCompletedTasks.includes(task.id);
            });
          }
        } catch (e) {
          console.error('Error refreshing task data:', e);
        }
      }
    };
    
    // Set up interval to refresh task data
    const taskRefreshInterval = setInterval(refreshTaskData, 20000); // Reduced from 5sec to 20sec
    
    return () => {
      clearInterval(refreshInterval); // Clean up interval on component unmount
      clearInterval(taskRefreshInterval); // Clean up task refresh interval
    };
  }, []);

  // Add an effect to refresh data when the component is focused
  useEffect(() => {
    // Throttled version of handleFocus to improve performance
    const handleFocus = throttle(() => {
      // Only reload data if the page has been inactive for at least 30 seconds
      const lastActive = parseInt(localStorage.getItem('lastActive') || '0', 10);
      const now = new Date().getTime();
      if (now - lastActive < 30000) {
        return; // Don't refresh if it's been less than 30 seconds
      }
      
      // Set the last active timestamp
      localStorage.setItem('lastActive', now.toString());
      
      // Reload data when the window regains focus
      if (typeof window !== 'undefined') {
        try {
          // Actually reload the user data
          getCurrentUser().then(userData => {
            if (userData) {
              setUser(userData);
            }
          }).catch(error => {
            console.error('Error fetching user data on focus:', error);
          });
          
          // Load custom tasks first to ensure we have the latest tasks
          const customTasks = localStorage.getItem('customTasks');
          if (customTasks) {
            const parsedCustomTasks = JSON.parse(customTasks);
            
            // Update the tasks array with custom tasks
            if (Array.isArray(parsedCustomTasks)) {
              // Clone to avoid mutation issues
              const updatedTasks = [...parsedCustomTasks];
              
              // Update global tasks reference (this will trigger re-renders)
              tasks.length = 0;
              tasks.push(...updatedTasks);
              console.log('Updated tasks from localStorage on focus:', updatedTasks.length);
            }
          }
          
          // Load earned badges
          const savedEarnedBadges = localStorage.getItem('earnedBadges');
          if (savedEarnedBadges) {
            const parsedEarnedBadges = JSON.parse(savedEarnedBadges);
            setEarnedBadgeIds(parsedEarnedBadges);
            
            // Update badges' earned status
            badges.forEach(badge => {
              badge.earned = parsedEarnedBadges.includes(badge.id);
            });
          }
          
          // Load claimed rewards
          const savedClaimedRewards = localStorage.getItem('claimedRewards');
          if (savedClaimedRewards) {
            const parsedClaimedRewards = JSON.parse(savedClaimedRewards);
            setClaimedRewardIds(parsedClaimedRewards);
            
            // Update rewards' claimed status
            rewards.forEach(reward => {
              reward.claimed = parsedClaimedRewards.includes(reward.id);
            });
          }
          
          // Load earned certificates
          const savedEarnedCertificates = localStorage.getItem('earnedCertificates');
          if (savedEarnedCertificates) {
            const parsedEarnedCertificates = JSON.parse(savedEarnedCertificates);
            setEarnedCertificateIds(parsedEarnedCertificates);
            
            // Update certificates' earned status
            certificates.forEach(certificate => {
              certificate.earned = parsedEarnedCertificates.includes(certificate.id);
            });
          }
          
          // Load spent points
          const savedSpentPoints = localStorage.getItem('spentPoints');
          if (savedSpentPoints) {
            setSpentPoints(parseInt(savedSpentPoints, 10));
          }
          
          // Load completed tasks
          const savedCompletedTasks = localStorage.getItem('completedTasks');
          if (savedCompletedTasks) {
            const parsedCompletedTasks = JSON.parse(savedCompletedTasks);
            setCompletedTaskIds(parsedCompletedTasks);
            
            // Update tasks' completed status
            tasks.forEach(task => {
              task.completed = parsedCompletedTasks.includes(task.id);
            });
          }
        } catch (e) {
          console.error('Error loading data from localStorage on focus:', e);
        }
      }
    }, 500); // Throttle to one call per 500ms

    // Add event listener for window focus
    window.addEventListener('focus', handleFocus);
    
    // Set initial lastActive timestamp
    localStorage.setItem('lastActive', new Date().getTime().toString());
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Calculate total active tasks
  const activeTasks = useMemo(() => {
    // Load tasks including custom ones if they exist
    let allTasks = [...tasks]; // Start with default tasks
    
    if (typeof window !== 'undefined') {
      try {
        // Check for custom tasks
        const customTasks = localStorage.getItem('customTasks');
        if (customTasks) {
          const parsedCustomTasks = JSON.parse(customTasks);
          if (Array.isArray(parsedCustomTasks) && parsedCustomTasks.length > 0) {
            // Replace with custom tasks if they exist
            allTasks = parsedCustomTasks;
          }
        }
      } catch (e) {
        console.error('Error loading custom tasks for activity count:', e);
      }
    }
    
    // Ensure we're always using the most up-to-date completion status
    if (completedTaskIds.length > 0) {
      // Calculate active tasks based on completedTaskIds from localStorage
      return allTasks.filter(task => !completedTaskIds.includes(task.id)).length;
    }
    
    // Fallback to task.completed property
    return allTasks.filter(task => !task.completed).length;
  }, [completedTaskIds, tasks]);

  // Get earned badges count - with default 0 for new users
  const earnedBadgesCount = useMemo(() => {
    if (earnedBadgeIds.length > 0) {
      return earnedBadgeIds.length;
    }
    // Check badges with earned property
    const earnedBadgesCount = badges.filter(badge => badge.earned).length;
    // Return 0 for new users if nothing is found
    return earnedBadgesCount;
  }, [earnedBadgeIds]);

  // Get claimed certificates count - with default 0 for new users
  const claimedCertificatesCount = useMemo(() => {
    if (earnedCertificateIds.length > 0) {
      return earnedCertificateIds.length;
    }
    // Check certificates with earned property
    const claimedCertificatesCount = certificates.filter(certificate => certificate.earned).length;
    // Return 0 for new users if nothing is found
    return claimedCertificatesCount;
  }, [earnedCertificateIds]);

  // Get claimed rewards count - with default 0 for new users
  const claimedRewardsCount = useMemo(() => {
    if (claimedRewardIds.length > 0) {
      return claimedRewardIds.length;
    }
    // Check rewards with claimed property
    const claimedRewardsCount = rewards.filter(reward => reward.claimed).length;
    // Return 0 for new users if nothing is found
    return claimedRewardsCount;
  }, [claimedRewardIds]);

  // Calculate total earned points - with default 0 for new users
  const totalPoints = useMemo(() => {
    // Calculate points from earned badges
    const badgePoints = badges
      .filter(badge => earnedBadgeIds.length > 0 ? earnedBadgeIds.includes(badge.id) : badge.earned)
      .reduce((acc, badge) => acc + (badge.points || 0), 0);
    
    return badgePoints;
  }, [earnedBadgeIds]);
  
  // Available points (total points minus spent points)
  const availablePoints = useMemo(() => {
    return totalPoints - spentPoints;
  }, [totalPoints, spentPoints]);

  // Avatar options - same as in profile page
  const avatars = [
    { id: 1, type: 'geometric', design: 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white', icon: 'star' },
    { id: 2, type: 'geometric', design: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white', icon: 'bolt' },
    { id: 3, type: 'geometric', design: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white', icon: 'sun' },
    { id: 4, type: 'geometric', design: 'bg-gradient-to-br from-rose-400 to-rose-600 text-white', icon: 'heart' },
    { id: 5, type: 'geometric', design: 'bg-gradient-to-br from-sky-400 to-sky-600 text-white', icon: 'cloud' },
    { id: 6, type: 'geometric', design: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white', icon: 'moon' },
    { id: 7, type: 'pattern', design: 'bg-indigo-600 bg-opacity-90 text-white', icon: 'code' },
    { id: 8, type: 'pattern', design: 'bg-emerald-600 bg-opacity-90 text-white', icon: 'check' },
    { id: 9, type: 'pattern', design: 'bg-amber-600 bg-opacity-90 text-white', icon: 'fire' }
  ];

  // Selected avatar (using image from user data)
  const selectedAvatar = useMemo(() => {
    // Get avatar ID from user.image if available
    let avatarId = 1; // Default avatar ID
    
    if (user && user.image) {
      const parsedId = parseInt(user.image);
      if (!isNaN(parsedId) && parsedId > 0) {
        avatarId = parsedId;
      }
    }
    
    // Find the avatar that matches the ID
    const foundAvatar = avatars.find(avatar => avatar.id === avatarId);
    
    // Return found avatar or default to first avatar
    return foundAvatar || avatars[0];
  }, [user]);

  // Get avatar display component
  const getAvatarDisplay = (avatar, size = 'md') => {
    const sizeClasses = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-16 h-16 text-xl',
      lg: 'w-20 h-20 text-2xl'
    };
    
    // Icon mappings for different avatar types
    const icons = {
      star: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      bolt: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      sun: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      heart: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      cloud: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      moon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      code: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      check: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      fire: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-md ${avatar.design}`}>
        {icons[avatar.icon] || icons.star}
        {avatar.type === 'pattern' && (
          <div className="absolute inset-0 rounded-full opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_40%,_transparent_100%)]"></div>
        )}
      </div>
    );
  };

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
      
      {/* Top Right: Dashboard Info */}
      <div className="bg-white px-6 flex items-center justify-start border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Dashboard</div>
          <div className="text-sm text-gray-600">Complete modules to earn badges and unlock achievements</div>
        </div>
      </div>
      
      {/* Left: Navigation Menu */}
      <div className="bg-white border-r border-gray-200 py-6 flex flex-col z-10">
        <nav className="flex-1 relative z-20">
          <ul className="space-y-1 px-3">
            <li>
              <Link 
                href="/dashboard" 
                prefetch={true}
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
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
                prefetch={true}
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
                prefetch={true}
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
                prefetch={true}
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
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
                prefetch={true}
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
                prefetch={true}
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
      <div className="bg-gray-50 overflow-auto p-6 relative z-0">
        {/* Welcome Section with Soft Square */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-800">
              {loading ? 'Loading...' : `Welcome, ${user?.name || 'User'}! 👋`}
            </h1>
            <p className="mt-2 text-gray-600">We've been expecting you. Let's pick up where you left off.</p>
          </div>
          <div 
            className="flex items-center"
            // Add pointer-events-none to the display-only elements to ensure they don't block clicks
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
          >
            {getAvatarDisplay(selectedAvatar, 'md')}
            <div className="ml-4 text-right">
              <div className="text-sm text-gray-600 font-medium">Total Points</div>
              <div className="text-xl font-bold text-indigo-700">{availablePoints}</div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-start">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Active Tasks</div>
              <div className="text-2xl font-bold text-gray-800">{activeTasks}</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-start">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Badges</div>
              <div className="text-2xl font-bold text-gray-800">{earnedBadgesCount}</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Certificates</div>
              <div className="text-2xl font-bold text-gray-800">{claimedCertificatesCount}</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-start">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Rewards</div>
              <div className="text-2xl font-bold text-gray-800">{claimedRewardsCount}</div>
            </div>
          </div>
        </div>
        
        {/* Quick HR Tips Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick HR Tips</h2>
          
          <div className="space-y-4">
            {/* Tip 1 */}
            <div className="flex items-start p-3 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Regular 1:1 Check-ins</h3>
                <p className="text-sm text-indigo-700 mt-1">Schedule regular check-ins with team members to provide feedback and support their growth.</p>
              </div>
            </div>
            
            {/* Tip 2 */}
            <div className="flex items-start p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-900">Document Everything</h3>
                <p className="text-sm text-green-700 mt-1">Keep records of all employee interactions, feedback sessions, and performance discussions.</p>
              </div>
            </div>
            
            {/* Tip 3 */}
            <div className="flex items-start p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Recognize Achievements</h3>
                <p className="text-sm text-blue-700 mt-1">Celebrate team and individual achievements regularly to boost morale and engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 