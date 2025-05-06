"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { badges, modules, tasks as initialTasks, currentUser } from '../../lib/mockData';

export default function BadgesPage() {
  const router = useRouter();
  
  // State for badge modules with their tasks
  const [badgeModules, setBadgeModules] = useState(badges.map(badge => ({
    ...badge,
    modulesList: modules.filter(module => module.badgeId === badge.id)
  })));
  
  // State for the details modal
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // State to track started badges
  const [startedBadges, setStartedBadges] = useState({});
  
  // Initialize localStorage if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('startedBadges')) {
        localStorage.setItem('startedBadges', JSON.stringify({}));
      }
    }
  }, []);
  
  // Initialize state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load custom badges first if they exist
        const customBadges = localStorage.getItem('customBadges');
        if (customBadges) {
          const parsedCustomBadges = JSON.parse(customBadges);
          console.log('Loaded custom badges in badges page:', parsedCustomBadges);
          
          // Update the badges array with custom badges
          badges.length = 0;
          badges.push(...parsedCustomBadges);
        }
        
        // Load custom modules if they exist
        const customModules = localStorage.getItem('customModules');
        if (customModules) {
          const parsedCustomModules = JSON.parse(customModules);
          console.log('Loaded custom modules in badges page:', parsedCustomModules);
          
          // Update the modules array with custom modules
          modules.length = 0;
          modules.push(...parsedCustomModules);
        }
        
        // Load custom tasks if they exist
        const customTasks = localStorage.getItem('customTasks');
        if (customTasks) {
          const parsedCustomTasks = JSON.parse(customTasks);
          console.log('Loaded custom tasks in badges page:', parsedCustomTasks);
          
          // Update the initialTasks array with custom tasks
          initialTasks.length = 0;
          initialTasks.push(...parsedCustomTasks);
        }
        
        // Load completed tasks
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        let completedTaskIds = [];
        
        if (savedCompletedTasks) {
          completedTaskIds = JSON.parse(savedCompletedTasks);
          console.log('Loaded completed tasks in badges page:', completedTaskIds);
        }
        
        // Update tasks completion status based on localStorage data
        initialTasks.forEach(task => {
          task.completed = completedTaskIds.includes(task.id);
        });
        
        // Now initialize badgeModules with updated task data
        const updatedBadgeModules = badges.map(badge => ({
          ...badge,
          modulesList: modules.filter(module => module.badgeId === badge.id).map(module => ({
            ...module,
            tasks: initialTasks.filter(task => task.moduleId === module.id)
          }))
        }));
        
        // Set state after all data is updated
        setBadgeModules(updatedBadgeModules);
        
        // Load started badges
        const savedBadges = localStorage.getItem('startedBadges');
        if (savedBadges) {
          const parsedBadges = JSON.parse(savedBadges);
          console.log('Loaded started badges:', parsedBadges);
          setStartedBadges(parsedBadges);
        }
        
        // Load earned badges
        const savedEarnedBadges = localStorage.getItem('earnedBadges');
        if (savedEarnedBadges) {
          const earnedBadgeIds = JSON.parse(savedEarnedBadges);
          console.log('Loaded earned badges:', earnedBadgeIds);
          
          // Update badges earned status
          earnedBadgeIds.forEach(badgeId => {
            const badge = badges.find(b => b.id === badgeId);
            if (badge) {
              badge.earned = true;
            }
          });
        }
      } catch (e) {
        console.error('Error loading badges from localStorage:', e);
      }
    }
  }, []);
  
  // Add an effect to refresh badge status when the component is focused
  useEffect(() => {
    const handleFocus = () => {
      // Reload data when the window regains focus (coming back from tasks page)
      if (typeof window !== 'undefined') {
        try {
          // Load custom badges first
          const customBadges = localStorage.getItem('customBadges');
          if (customBadges) {
            const parsedCustomBadges = JSON.parse(customBadges);
            console.log('Reloaded custom badges in badges page on focus:', parsedCustomBadges);
            
            // Update the badges array with custom badges
            badges.length = 0;
            badges.push(...parsedCustomBadges);
          }
          
          // Load custom modules
          const customModules = localStorage.getItem('customModules');
          if (customModules) {
            const parsedCustomModules = JSON.parse(customModules);
            console.log('Reloaded custom modules in badges page on focus:', parsedCustomModules);
            
            // Update the modules array with custom modules
            modules.length = 0;
            modules.push(...parsedCustomModules);
          }
          
          // Load custom tasks
          const customTasks = localStorage.getItem('customTasks');
          if (customTasks) {
            const parsedCustomTasks = JSON.parse(customTasks);
            console.log('Reloaded custom tasks in badges page on focus:', parsedCustomTasks);
            
            // Update the initialTasks array with custom tasks
            initialTasks.length = 0;
            initialTasks.push(...parsedCustomTasks);
          }
          
          const savedCompletedTasks = localStorage.getItem('completedTasks');
          if (savedCompletedTasks) {
            const completedTaskIds = JSON.parse(savedCompletedTasks);
            
            // Update task completion status
            initialTasks.forEach(task => {
              task.completed = completedTaskIds.includes(task.id);
            });
            
            // Rebuild badge modules with fresh task data
            const refreshedBadgeModules = badges.map(badge => ({
              ...badge,
              modulesList: modules.filter(module => module.badgeId === badge.id).map(module => ({
                ...module,
                tasks: initialTasks.filter(task => task.moduleId === module.id)
              }))
            }));
            
            setBadgeModules(refreshedBadgeModules);
            
            // Check for earned badges
            const savedEarnedBadges = localStorage.getItem('earnedBadges');
            if (savedEarnedBadges) {
              const earnedBadgeIds = JSON.parse(savedEarnedBadges);
              
              // Update earned status on all badges
              badges.forEach(badge => {
                badge.earned = earnedBadgeIds.includes(badge.id);
              });
            }
          }
        } catch (e) {
          console.error('Error refreshing badge data:', e);
        }
      }
    };
    
    // Set up focus event listener
    window.addEventListener('focus', handleFocus);
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Function to check if a badge is earned by checking all its modules' tasks
  const isBadgeEarned = (badge) => {
    // First check the stored earned status
    if (badge.earned) return true;
    
    // If not marked as earned, double check by examining all tasks
    if (!badge.modulesList || badge.modulesList.length === 0) return false;
    
    // Get all tasks for all modules in this badge
    let allTasksCompleted = true;
    
    for (const moduleItem of badge.modulesList) {
      // Check if all tasks for this module are completed
      const moduleTasks = moduleItem.tasks || [];
      if (moduleTasks.some(task => !task.completed)) {
        allTasksCompleted = false;
        break;
      }
    }
    
    // If all tasks are completed, update the badge status and save to localStorage
    if (allTasksCompleted && !badge.earned) {
      badge.earned = true;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          // Get existing earned badges
          let earnedBadges = [];
          const savedEarnedBadges = localStorage.getItem('earnedBadges');
          if (savedEarnedBadges) {
            try {
              const parsed = JSON.parse(savedEarnedBadges);
              earnedBadges = Array.isArray(parsed) ? parsed : [];
              if (!Array.isArray(parsed)) {
                console.error('Earned badges in localStorage is not an array:', parsed);
              }
            } catch (parseError) {
              console.error('Error parsing earnedBadges from localStorage:', parseError);
            }
          }
          
          // Add this badge if not already in the list
          if (!earnedBadges.includes(badge.id)) {
            earnedBadges.push(badge.id);
            localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
            console.log(`Badge ${badge.id} (${badge.title}) saved to localStorage as earned`);
          }
        } catch (e) {
          console.error('Error saving earned badge to localStorage:', e);
        }
      }
    }
    
    return allTasksCompleted;
  };
  
  // Function to handle starting a badge - navigate to tasks page with badge ID
  const handleStartBadge = (badgeId) => {
    if (typeof window !== 'undefined') {
      // Check if this badge has associated modules
      const badgeModulesCount = modules.filter(module => module.badgeId === badgeId).length;
      console.log(`Starting badge ${badgeId}, found ${badgeModulesCount} associated modules`);
      
      if (badgeModulesCount === 0) {
        alert('This badge does not have any modules or tasks yet. Please add modules and tasks in the admin page first.');
        return;
      }
      
      // Create new state object
      const updatedBadges = {
        ...startedBadges,
        [badgeId]: true
      };
      
      // Update state
      setStartedBadges(updatedBadges);
      
      // Save to localStorage
      try {
        localStorage.setItem('startedBadges', JSON.stringify(updatedBadges));
        console.log('Saved badges to localStorage:', updatedBadges);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      
      // Navigate to tasks page with the badge ID
      router.push(`/tasks?badgeId=${badgeId}`);
    }
  };
  
  // Function to open details modal
  const openDetails = (badge) => {
    setSelectedBadge(badge);
    setIsDetailsOpen(true);
  };
  
  // Function to close details modal
  const closeDetails = () => {
    setIsDetailsOpen(false);
  };
  
  // Helper function to get badge icon
  const getBadgeIcon = (title) => {
    if (title.toLowerCase().includes('onboarding')) return '🚀';
    if (title.toLowerCase().includes('performance')) return '📊';
    if (title.toLowerCase().includes('expert')) return '🏆';
    if (title.toLowerCase().includes('team')) return '👥';
    if (title.toLowerCase().includes('beginner')) return '🔰';
    if (title.toLowerCase().includes('leave')) return '📅';
    return '🎯';
  };

  // Helper function to get badge status
  const getBadgeStatus = (badge) => {
    if (isBadgeEarned(badge)) return 'Earned';
    if (startedBadges[badge.id]) return 'In Progress';
    return 'Locked';
  };

  return (
    <div className="h-screen grid grid-cols-[240px_1fr] grid-rows-[80px_1fr]">
      {/* Top Left: Logo and Brand */}
      <div className="bg-white px-6 flex items-center border-b border-r border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="font-semibold text-gray-800">Kolayers</span>
        </div>
      </div>
      
      {/* Top Right: Badges Info */}
      <div className="bg-white px-6 flex items-center justify-start border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Badges</div>
          <div className="text-sm text-gray-600">Complete modules to earn badges and unlock achievements</div>
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
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {badgeModules.map(badge => (
            <div key={badge.id} className="bg-white rounded-xl shadow-sm p-5 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md group relative">
              {/* Locked/Status Label */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  badge.earned 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : startedBadges[badge.id]
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {getBadgeStatus(badge)}
                </span>
              </div>
              
              {/* Badge Icon */}
              <div className={`w-20 h-20 ${
                badge.earned 
                  ? 'bg-mint-400' 
                  : startedBadges[badge.id] 
                    ? 'bg-amber-400' 
                    : 'bg-lavender-300'
                } rounded-full mx-auto mb-3 flex items-center justify-center`}>
                <span className="text-white text-3xl">{getBadgeIcon(badge.title)}</span>
              </div>
              
              {/* Badge Title and Description */}
              <h3 className="text-lg font-bold mb-1">{badge.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
              
              {/* Points */}
              <div className="flex justify-center mb-3">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                  {badge.points || 0} points
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 w-full bg-lavender-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    isBadgeEarned(badge) 
                      ? 'bg-mint-400' 
                      : startedBadges[badge.id] 
                        ? 'bg-amber-400' 
                        : 'bg-lavender-400'
                  } rounded-full`} 
                  style={{ 
                    width: `${badge.modulesList.length > 0 
                      ? (badge.modulesList.reduce((count, moduleItem) => {
                          // Count completed tasks in this module
                          const completedTaskCount = moduleItem.tasks 
                            ? moduleItem.tasks.filter(t => t.completed).length 
                            : 0;
                          // Count total tasks in this module
                          const totalTaskCount = moduleItem.tasks ? moduleItem.tasks.length : 0;
                          
                          // Return the completion percentage for this module
                          return count + (totalTaskCount > 0 
                            ? (completedTaskCount / totalTaskCount) 
                            : 0);
                        }, 0) / badge.modulesList.length) * 100
                      : 0}%` 
                  }}
                ></div>
              </div>
              
              {/* Overlay Buttons - only visible on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-80 rounded-xl">
                <div className="flex space-x-3">
                  {/* Only show Start button if not earned and not started */}
                  {!badge.earned && !startedBadges[badge.id] && (
                    <button 
                      className="py-2 px-5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      onClick={() => handleStartBadge(badge.id)}
                    >
                      Start
                    </button>
                  )}
                  
                  <button 
                    className="py-2 px-5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                    onClick={() => openDetails(badge)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Details Modal */}
      {isDetailsOpen && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Badge Header */}
              <div className="flex items-start mb-6">
                <div className={`w-20 h-20 ${
                  selectedBadge.earned 
                    ? 'bg-mint-400' 
                    : startedBadges[selectedBadge.id] 
                      ? 'bg-amber-400' 
                      : 'bg-lavender-300'
                } rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-white text-3xl">{getBadgeIcon(selectedBadge.title)}</span>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedBadge.title}</h2>
                  <p className="text-gray-600 mb-2">{selectedBadge.description}</p>
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full mr-2">
                      {selectedBadge.points || 0} points
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedBadge.earned 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : startedBadges[selectedBadge.id]
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getBadgeStatus(selectedBadge)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Conversation Box */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">About this badge:</h3>
                <p className="text-sm text-gray-600">
                  This badge represents your expertise in {selectedBadge.title.toLowerCase()}. 
                  Complete all required modules to earn this badge and showcase your skills.
                </p>
              </div>
              
              {/* Module List */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Required Modules</h3>
                <div className="space-y-3">
                  {selectedBadge.modulesList.map(moduleItem => (
                    <div key={moduleItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{moduleItem.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          moduleItem.tasks && moduleItem.tasks.every(t => t.completed) 
                            ? 'bg-blue-100 text-blue-800' 
                            : moduleItem.tasks && moduleItem.tasks.some(t => t.completed) 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {moduleItem.tasks && moduleItem.tasks.every(t => t.completed) 
                            ? 'Completed' 
                            : moduleItem.tasks && moduleItem.tasks.some(t => t.completed) 
                              ? 'In Progress' 
                              : 'Not Started'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{moduleItem.description}</p>
                      
                      {/* Tasks */}
                      <div className="mt-3 space-y-2">
                        <h5 className="text-xs font-medium text-gray-700">Tasks:</h5>
                        {moduleItem.tasks && moduleItem.tasks.map(task => (
                          <div key={task.id} className="flex items-center text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                              task.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {task.completed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-[8px]">•</span>
                              )}
                            </div>
                            <span className={`${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                              {task.title} - {task.description}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {moduleItem.tasks ? moduleItem.tasks.filter(t => t.completed).length : 0} of {moduleItem.tasks ? moduleItem.tasks.length : 0} tasks completed
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${moduleItem.tasks && moduleItem.tasks.length > 0 
                              ? (moduleItem.tasks.filter(t => t.completed).length / moduleItem.tasks.length) * 100 
                              : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Button Actions */}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  onClick={closeDetails}
                >
                  Close
                </button>
                {/* Only show Start button in modal if not earned and not started */}
                {!selectedBadge.earned && !startedBadges[selectedBadge.id] && (
                  <button 
                    className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      handleStartBadge(selectedBadge.id);
                      closeDetails();
                    }}
                  >
                    Start Badge
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 