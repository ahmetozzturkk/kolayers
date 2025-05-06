"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { rewards, badges, currentUser, modules, tasks } from '../../lib/mockData';

// Define types for type safety
interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  badgeRequired: string;
  claimed: boolean;
  type?: 'badge' | 'point'; // Optional for backward compatibility
  pointCost?: number;
}

// Enhanced reward with additional properties
interface EnhancedReward extends Reward {
  requiredBadge: any;
  canClaim: boolean;
  type: 'badge' | 'point'; // No longer optional after enhancement
}

export default function RewardsPage() {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<'badge' | 'point'>('badge');
  
  // State to store loaded rewards
  const [loadedRewards, setLoadedRewards] = useState<Reward[]>(rewards as Reward[]);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load custom rewards if they exist
        const customRewards = localStorage.getItem('customRewards');
        if (customRewards) {
          const parsedCustomRewards = JSON.parse(customRewards);
          console.log('Loaded custom rewards in rewards page:', parsedCustomRewards);
          
          // Update rewards with custom rewards
          setLoadedRewards(parsedCustomRewards);
        }
        
        // Load custom badges if they exist
        const customBadges = localStorage.getItem('customBadges');
        if (customBadges) {
          const parsedCustomBadges = JSON.parse(customBadges);
          console.log('Loaded custom badges in rewards page:', parsedCustomBadges);
          
          // Update the badges array with custom badges
          badges.length = 0;
          badges.push(...parsedCustomBadges);
        }
        
        // Also load modules and tasks to ensure relationships work properly
        const customModules = localStorage.getItem('customModules');
        if (customModules) {
          const parsedCustomModules = JSON.parse(customModules);
          console.log('Loaded custom modules in rewards page:', parsedCustomModules);
          
          // Update the modules array
          modules.length = 0;
          modules.push(...parsedCustomModules);
        }
        
        const customTasks = localStorage.getItem('customTasks');
        if (customTasks) {
          const parsedCustomTasks = JSON.parse(customTasks);
          console.log('Loaded custom tasks in rewards page:', parsedCustomTasks);
          
          // Update the tasks array
          tasks.length = 0;
          tasks.push(...parsedCustomTasks);
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
      }
    }
  }, []);

  // Get the user's earned badge IDs
  const earnedBadgeIds = (() => {
    // First check if there are any earned badges in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedEarnedBadges = localStorage.getItem('earnedBadges');
        if (savedEarnedBadges) {
          const parsedEarnedBadges = JSON.parse(savedEarnedBadges);
          console.log('Found earned badges in localStorage for rewards:', parsedEarnedBadges);
          
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
  
  console.log('Using earned badge IDs for rewards:', earnedBadgeIds);
    
  // Calculate user's total points
  const totalPoints = badges
    .filter(badge => badge.earned || earnedBadgeIds.includes(badge.id))
    .reduce((sum, badge) => sum + (badge.points || 0), 0);
    
  console.log('Calculated total points:', totalPoints);
    
  // Get spent points from localStorage
  const [spentPoints, setSpentPoints] = useState(0);
  
  // Load spent points from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSpentPoints = localStorage.getItem('spentPoints');
        if (savedSpentPoints) {
          setSpentPoints(parseInt(savedSpentPoints, 10));
          console.log('Loaded spent points from localStorage:', parseInt(savedSpentPoints, 10));
        }
      } catch (e) {
        console.error('Error loading spent points from localStorage:', e);
      }
    }
  }, []);
  
  // Available points is total points minus spent points
  const availablePoints = totalPoints - spentPoints;

  // Enhance rewards with badge details and assign default type if missing
  const rewardsWithDetails: EnhancedReward[] = loadedRewards.map(reward => {
    const requiredBadge = badges.find(badge => badge.id === reward.badgeRequired);
    const isBadgeEarned = earnedBadgeIds.includes(reward.badgeRequired);
    
    // Check if this reward has already been claimed in localStorage
    let isClaimed = reward.claimed;
    if (typeof window !== 'undefined') {
      try {
        const claimedRewards = localStorage.getItem('claimedRewards');
        if (claimedRewards) {
          const parsedClaimedRewards = JSON.parse(claimedRewards);
          if (parsedClaimedRewards.includes(reward.id)) {
            isClaimed = true;
          }
        }
      } catch (e) {
        console.error('Error checking claimed reward status:', e);
      }
    }
    
    return {
      ...reward,
      requiredBadge,
      // For badge rewards, check badge requirement
      // For point rewards, check if user has enough points
      canClaim: reward.type === 'point' 
        ? !isClaimed && (reward.pointCost <= availablePoints)
        : isBadgeEarned && !isClaimed,
      // If type is missing, default to 'badge' for backward compatibility
      type: reward.type || 'badge',
      claimed: isClaimed
    };
  });

  // Filter rewards based on active tab
  const filteredRewards = activeTab === 'badge' 
    ? rewardsWithDetails.filter(reward => reward.type === 'badge')
    : rewardsWithDetails.filter(reward => reward.type === 'point');

  // Function to handle claiming a reward
  const handleClaimReward = (rewardId: string) => {
    // Find the reward
    const reward = rewardsWithDetails.find(r => r.id === rewardId);
    if (!reward || !reward.canClaim) return;
    
    // Mark as claimed
    reward.claimed = true;
    
    // Save claimed status to localStorage
    if (typeof window !== 'undefined') {
      try {
        // Get existing claimed rewards
        let claimedRewards = [];
        const savedClaimedRewards = localStorage.getItem('claimedRewards');
        if (savedClaimedRewards) {
          claimedRewards = JSON.parse(savedClaimedRewards);
        }
        
        // Add this reward if not already in the list
        if (!claimedRewards.includes(rewardId)) {
          claimedRewards.push(rewardId);
          localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
          console.log(`Reward ${rewardId} saved to localStorage as claimed`);
          
          // If this is a point-based reward, deduct points
          if (reward.type === 'point' && reward.pointCost) {
            const newSpentPoints = spentPoints + reward.pointCost;
            setSpentPoints(newSpentPoints);
            localStorage.setItem('spentPoints', newSpentPoints.toString());
            console.log(`Deducted ${reward.pointCost} points. New spent points total: ${newSpentPoints}`);
          }
          
          // Force UI refresh
          setLoadedRewards([...loadedRewards]);
          
          // Show success alert
          alert(`Successfully claimed: ${reward.title}`);
        }
      } catch (e) {
        console.error('Error saving claimed reward to localStorage:', e);
      }
    }
  };

  // Add an effect to refresh data when the component is focused
  useEffect(() => {
    const handleFocus = () => {
      // Reload data when the window regains focus
      if (typeof window !== 'undefined') {
        try {
          // Load custom rewards
          const customRewards = localStorage.getItem('customRewards');
          if (customRewards) {
            const parsedCustomRewards = JSON.parse(customRewards);
            console.log('Reloaded custom rewards in rewards page on focus:', parsedCustomRewards);
            
            // Update rewards
            setLoadedRewards(parsedCustomRewards);
          }
          
          // Load custom badges
          const customBadges = localStorage.getItem('customBadges');
          if (customBadges) {
            const parsedCustomBadges = JSON.parse(customBadges);
            
            // Update badges
            badges.length = 0;
            badges.push(...parsedCustomBadges);
          }
          
          // Load custom modules and tasks
          const customModules = localStorage.getItem('customModules');
          if (customModules) {
            const parsedCustomModules = JSON.parse(customModules);
            
            // Update modules
            modules.length = 0;
            modules.push(...parsedCustomModules);
          }
          
          const customTasks = localStorage.getItem('customTasks');
          if (customTasks) {
            const parsedCustomTasks = JSON.parse(customTasks);
            
            // Update tasks
            tasks.length = 0;
            tasks.push(...parsedCustomTasks);
          }
          
          // Also reload spent points to keep them in sync
          const savedSpentPoints = localStorage.getItem('spentPoints');
          if (savedSpentPoints) {
            setSpentPoints(parseInt(savedSpentPoints, 10));
            console.log('Reloaded spent points on focus:', parseInt(savedSpentPoints, 10));
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
      
      {/* Top Right: Rewards Info */}
      <div className="bg-white px-6 flex items-center justify-between border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Rewards</div>
          <div className="text-sm text-gray-600">Earn badges to unlock and claim special rewards</div>
        </div>
        
        {/* Points Display */}
        <div className="flex items-center">
          <div className="bg-yellow-100 px-4 py-2 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-yellow-700 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
            <div>
              <div className="text-xs text-yellow-800 font-medium">Available Points</div>
              <div className="text-lg font-bold text-yellow-900">{availablePoints}</div>
            </div>
          </div>
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
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
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
        {/* Settings Tabs similar to profile page */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'badge' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('badge')}
            >
              Badge Rewards
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'point' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('point')}
            >
              Point Rewards
            </button>
          </div>
        </div>

        {filteredRewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p className="text-xl font-medium">No {activeTab} rewards available</p>
            <p className="mt-2">Rewards created in the admin page will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map(reward => (
              <div 
                key={reward.id} 
                className={`rounded-lg shadow-md p-6 ${
                  reward.claimed 
                    ? 'bg-amber-50 border border-amber-200' 
                    : reward.canClaim 
                      ? 'bg-white border-2 border-amber-300' 
                      : 'bg-white border border-gray-200'
                }`}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{reward.title}</h2>
                  <p className="text-gray-600 mt-2">{reward.description}</p>
                </div>
                
                {reward.type === 'badge' ? (
                  // Badge requirement section for badge rewards
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Requires Badge:</h3>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${earnedBadgeIds.includes(reward.badgeRequired) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {earnedBadgeIds.includes(reward.badgeRequired) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{reward.requiredBadge?.title || 'Unknown Badge'}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {earnedBadgeIds.includes(reward.badgeRequired) ? 'Earned' : 'Not yet earned'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Point cost section for point rewards
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Point Cost:</h3>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${availablePoints >= (reward.pointCost || 0) ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium">{reward.pointCost || 0} points</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {availablePoints >= (reward.pointCost || 0) ? 'You have enough points' : `Need ${(reward.pointCost || 0) - availablePoints} more points`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  {reward.claimed ? (
                    <button 
                      className="w-full py-2 text-sm font-medium rounded-lg bg-amber-100 text-amber-700 cursor-default"
                      disabled
                    >
                      Already Claimed
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleClaimReward(reward.id)}
                      className={`w-full py-2 text-sm font-medium rounded-lg ${
                        reward.canClaim 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!reward.canClaim}
                    >
                      {reward.canClaim ? 'Claim Reward' : reward.type === 'badge' ? 'Earn Required Badge' : 'Earn More Points'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 