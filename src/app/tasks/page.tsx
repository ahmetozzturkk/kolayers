"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { modules, tasks as initialTasks, badges, currentUser } from '../../lib/mockData';
import ReferralForm from '../../components/ReferralForm';

// At the top of the file, add a TypeScript declaration for the global window property
declare global {
  interface Window {
    markTaskAsComplete: (taskId: string) => void;
    markVideoAsComplete: () => void;
    clickKolayButton: () => void;
    handleReferralSubmit: () => void; // Add this new function
    YT: any; // YouTube API
    onYouTubeIframeAPIReady: () => void; // YouTube API callback
  }
}

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const badgeId = searchParams.get('badgeId');
  const activeTaskId = searchParams.get('taskId');
  
  // State for timer and task completion
  const [readingTimeRemaining, setReadingTimeRemaining] = useState(0);
  const [markCompleteDisabled, setMarkCompleteDisabled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [tooltipTaskId, setTooltipTaskId] = useState<string | null>(null);
  
  // Add state for quiz answers and tracking
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [showAnswers, setShowAnswers] = useState<{[key: number]: boolean}>({});
  
  // Existing Task filter state but renamed
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  // State to track form submission for referral tasks
  const [referralFormSubmitted, setReferralFormSubmitted] = useState<{[taskId: string]: boolean}>({});
  
  // Add state to track which URLs have been clicked
  const [urlClicked, setUrlClicked] = useState<{[taskId: string]: boolean}>({});
  
  // Store tasks in state to ensure UI updates when completed
  const [tasksState, setTasksState] = useState(() => {
    // Make a deep copy to avoid modifying the original
    return initialTasks.map(task => {
      // Ensure Start Leave Management task starts as uncompleted
      if (task.id === 'task1') {
        return { ...task, completed: false };
      }
      return { ...task };
    });
  });
  
  // Initialize and load completed tasks from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load custom badges if they exist
        const customBadges = localStorage.getItem('customBadges');
        if (customBadges) {
          const parsedCustomBadges = JSON.parse(customBadges);
          console.log('Loaded custom badges in tasks page:', parsedCustomBadges);
          
          // Update the badges array with custom badges
          badges.length = 0;
          badges.push(...parsedCustomBadges);
        }
        
        // Load custom modules if they exist
        const customModules = localStorage.getItem('customModules');
        if (customModules) {
          const parsedCustomModules = JSON.parse(customModules);
          console.log('Loaded custom modules in tasks page:', parsedCustomModules);
          
          // Update the modules array with custom modules
          modules.length = 0;
          modules.push(...parsedCustomModules);
        }
        
        // Load custom tasks if they exist
        const customTasks = localStorage.getItem('customTasks');
        if (customTasks) {
          const parsedCustomTasks = JSON.parse(customTasks);
          console.log('Loaded custom tasks in tasks page:', parsedCustomTasks);
          
          // Update initialTasks and tasksState
          initialTasks.length = 0;
          initialTasks.push(...parsedCustomTasks);
          setTasksState(parsedCustomTasks);
        }
        
        // Load completed tasks
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        if (savedCompletedTasks) {
          const completedTaskIds = JSON.parse(savedCompletedTasks);
          console.log('Loaded completed tasks:', completedTaskIds);
          
          // Mark tasks as completed based on localStorage data
          setTasksState(prevTasks => {
            return prevTasks.map(task => ({
              ...task,
              completed: completedTaskIds.includes(task.id)
            }));
          });
        }
        
        // Load earned badges
        const savedEarnedBadges = localStorage.getItem('earnedBadges');
        if (savedEarnedBadges) {
          const earnedBadgeIds = JSON.parse(savedEarnedBadges);
          console.log('Loaded earned badges:', earnedBadgeIds);
          
          // Ensure earnedBadgeIds is an array before using forEach
          if (Array.isArray(earnedBadgeIds)) {
            // Update badges earned status
            earnedBadgeIds.forEach(badgeId => {
              const badge = badges.find(b => b.id === badgeId);
              if (badge) {
                badge.earned = true;
              }
            });
          } else {
            console.error('earnedBadgeIds is not an array:', earnedBadgeIds);
          }
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
      }
    }
  }, []);
  
  // Store timerInterval in a ref to persist across renders
  const timerIntervalRef = useRef(null);
  
  // State to track which badges have been started
  const [startedBadges, setStartedBadges] = useState<{[badgeId: string]: boolean}>({});
  
  // Initialize localStorage if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!localStorage.getItem('startedBadges')) {
          localStorage.setItem('startedBadges', JSON.stringify({}));
        }
      } catch (e) {
        console.error('Error initializing startedBadges in localStorage:', e);
      }
    }
  }, []);
  
  // Load started badges from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('startedBadges');
        if (saved) {
          const parsedBadges = JSON.parse(saved);
          console.log('Tasks page loaded badges:', parsedBadges);
          setStartedBadges(parsedBadges);
        }
      } catch (e) {
        console.error('Error loading started badges from localStorage:', e);
      }
    }
  }, []);
  
  // If a badgeId is provided in the URL and it's not already started, mark it as started
  useEffect(() => {
    if (typeof window !== 'undefined' && badgeId && !startedBadges[badgeId]) {
      const updatedBadges = {
        ...startedBadges,
        [badgeId]: true
      };
      
      setStartedBadges(updatedBadges);
      
      // Save to localStorage
      try {
        localStorage.setItem('startedBadges', JSON.stringify(updatedBadges));
        console.log('Updated badges from URL param:', updatedBadges);
      } catch (e) {
        console.error('Error saving badge state to localStorage:', e);
      }
    }
  }, [badgeId, startedBadges]);
  
  // Copy the modules and include their tasks using the updated tasksState
  const moduleData = useMemo(() => {
    return modules.map(module => {
      const relatedBadge = badges.find(badge => badge.id === module.badgeId);
      return {
        ...module,
        tasks: tasksState.filter(task => task.moduleId === module.id),
        badgeName: relatedBadge?.title || 'Unknown Badge'
      };
    });
  }, [tasksState]);
  
  // Filter modules by badge ID if present and by started badges
  const filteredModules = useMemo(() => {
    // Initial set of modules
    let filtered = moduleData;
    
    // If a specific badge is selected, filter to only show that badge's modules
    if (badgeId) {
      filtered = filtered.filter(module => module.badgeId === badgeId);
      
      // Ensure this badge is marked as started
      if (typeof window !== 'undefined' && !startedBadges[badgeId]) {
        const updatedBadges = {
          ...startedBadges,
          [badgeId]: true
        };
        
        // Update local state
        setStartedBadges(updatedBadges);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('startedBadges', JSON.stringify(updatedBadges));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
      }
    } 
    // Otherwise, show modules for all started badges
    else {
      filtered = filtered.filter(module => {
        const badge = badges.find(b => b.id === module.badgeId);
        return badge && (startedBadges[badge.id] || badge.earned);
      });
    }
    
    return filtered;
  }, [badgeId, moduleData, startedBadges]);

  // Track which accordions are expanded (default to first one being open)
  const [expandedModules, setExpandedModules] = useState<{[moduleId: string]: boolean}>({});
  
  // Set the first module as expanded when filteredModules changes
  useEffect(() => {
    if (filteredModules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [filteredModules[0].id]: true });
    }
  }, [filteredModules, expandedModules]);
  
  // Auto-expand module containing the active task
  useEffect(() => {
    if (activeTaskId) {
      const task = tasksState.find(t => t.id === activeTaskId);
      if (task) {
        setExpandedModules(prev => ({
          ...prev,
          [task.moduleId]: true
        }));
      }
    }
  }, [activeTaskId, tasksState]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Add this function to check and update badge status
  const checkBadgeCompletion = useCallback((taskId: string, completed: boolean) => {
    // Don't run during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Find the task
    const task = tasksState.find(t => t.id === taskId);
    if (!task || !completed) return;
    
    // Find the module for this task
    const moduleItem = modules.find(m => m.id === task.moduleId);
    if (!moduleItem) return;
    
    // Find the badge for this module
    const badge = badges.find(b => b.id === moduleItem.badgeId);
    if (!badge) return;
    
    // Check if all tasks for modules in this badge are completed
    const badgeModules = modules.filter(m => m.badgeId === badge.id);
    const allTasksForBadge = tasksState.filter(t => 
      badgeModules.some(m => m.id === t.moduleId)
    );
    
    // Check if all tasks are completed
    const allCompleted = allTasksForBadge.every(t => t.completed);
    
    if (allCompleted) {
      console.log(`All tasks completed for badge ${badge.id} (${badge.title}). Marking as earned!`);
      
      // Update the badge to earned
      badge.earned = true;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          // Get existing earned badges from localStorage
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
  }, [tasksState, modules, badges]);

  // Now, modify the handleToggleTask function to call checkBadgeCompletion after updating tasks
  const handleToggleTask = useCallback((taskId: string, completed: boolean, fromArticle: boolean = false) => {
    // In a real app, this would update the task status in the backend
    console.log(`Toggle task ${taskId} to ${completed}, fromArticle: ${fromArticle}`);
    
    // Get task to check its current state
    const task = tasksState.find(t => t.id === taskId);
    
    // For task1 (Start Leave Management), only allow completion via URL click
    if (taskId === 'task1' && completed && !fromArticle) {
      console.log('Start Leave Management can only be completed by clicking the Kolay URL');
      setTooltipTaskId(taskId);
      setTimeout(() => {
        setTooltipTaskId(null);
      }, 3000);
      return;
    }
    
    // If trying to mark as not completed but it's already completed, prevent it
    if (!completed && task?.completed) {
      console.log(`Task ${taskId} is already completed and cannot be marked as incomplete`);
      
      // Show tooltip for this task
      setTooltipTaskId(taskId);
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setTooltipTaskId(null);
      }, 3000);
      
      return; // Don't allow marking as incomplete
    }
    
    // Get article content to check if this task has reading content
    const taskArticle = getArticleContent(taskId);
    
    // For task6, check if form has been submitted
    if (taskId === 'task6' && completed && !fromArticle && !referralFormSubmitted['task6']) {
      console.log('Leave Calendar Integration can only be completed after submitting the form');
      setTooltipTaskId(taskId);
      setTimeout(() => {
        setTooltipTaskId(null);
      }, 3000);
      return;
    }
    
    // Prevent manually marking tasks with reading time as complete without reading them
    if (completed && !fromArticle && taskArticle.readingTime > 0 && !taskArticle.isVideo) {
      console.log(`Task ${taskId} can only be completed by reading the article`);
      
      // Show tooltip for this task
      setTooltipTaskId(taskId);
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setTooltipTaskId(null);
      }, 3000);
      
      return; // Don't allow manual completion
    }
    
    // Prevent marking quiz task as complete manually if not all questions are answered
    if (completed && !fromArticle && taskArticle.isQuiz) {
      if (!areAllQuestionsAnswered(taskArticle)) {
        console.log(`Quiz task ${taskId} can only be completed by answering all questions`);
        
        // Show tooltip for this task
        setTooltipTaskId(taskId);
        
        // Hide tooltip after 3 seconds
        setTimeout(() => {
          setTooltipTaskId(null);
        }, 3000);
        
        return; // Don't allow manual completion
      }
    }
    
    // Update tasks state to trigger re-render
    setTasksState(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      // Save completed tasks to localStorage
      if (typeof window !== 'undefined') {
        try {
          const completedTaskIds = newTasks
            .filter(task => task.completed)
            .map(task => task.id);
          
          localStorage.setItem('completedTasks', JSON.stringify(completedTaskIds));
          console.log('Saved completed tasks to localStorage:', completedTaskIds);
        } catch (e) {
          console.error('Error saving completed tasks to localStorage:', e);
        }
      }
      
      // Check module completion status after task update
      if (task) {
        const moduleId = task.moduleId;
        const moduleTaskIds = initialTasks.filter(t => t.moduleId === moduleId).map(t => t.id);
        const allTasksCompleted = moduleTaskIds.every(id => {
          // For the current task we use the new status, for others we check current state
          if (id === taskId) return completed;
          const otherTask = newTasks.find(t => t.id === id);
          return otherTask?.completed;
        });
        
        // Update the module's completion status based on all tasks
        const moduleIndex = modules.findIndex(m => m.id === moduleId);
        if (moduleIndex !== -1) {
          // Only update if the status is changing to avoid unnecessary renders
          if (modules[moduleIndex].completed !== allTasksCompleted) {
            modules[moduleIndex].completed = allTasksCompleted;
            console.log(`Module ${moduleId} completion status: ${allTasksCompleted}`);
            
            // If module is completed, check if the badge should be earned
            if (allTasksCompleted) {
              // Run badge completion check if this might have completed a badge
              setTimeout(() => checkBadgeCompletion(taskId, completed), 0);
            }
          }
        }
      }
      
      return newTasks;
    });
  }, [tasksState, quizAnswers, referralFormSubmitted, checkBadgeCompletion]);
  
  const openTaskDialog = (taskId: string) => {
    router.push(`/tasks?taskId=${taskId}`);
  };
  
  // Keep this function for other article tasks, but we won't use it for "Start Leave Management"
  const openArticlePage = (taskId: string) => {
    router.push(`/tasks/article?taskId=${taskId}`);
  };
  
  const closeTaskDialog = () => {
    // If there's an active task, clear its timer from localStorage
    if (activeTask) {
      try {
        // Clear any localStorage timer data
        const storageKey = `article_timer_${activeTask.id}`;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
        
        // Reset timer state
        setReadingTimeRemaining(0);
        setMarkCompleteDisabled(false);
      } catch (err) {
        console.error("Error clearing timer:", err);
      }
    }
    
    // Navigate back to the tasks page
    router.push('/tasks');
  };
  
  // Function to get badge icon
  const getBadgeIcon = (badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    const title = badge?.title || '';
    
    if (title.toLowerCase().includes('onboarding')) return '🚀';
    if (title.toLowerCase().includes('performance')) return '📊'; 
    if (title.toLowerCase().includes('expert')) return '🏆';
    if (title.toLowerCase().includes('team')) return '👥';
    if (title.toLowerCase().includes('beginner')) return '🔰';
    if (title.toLowerCase().includes('leave')) return '📅';
    return '🎯';
  };
  
  // Check if we're showing task dialog - use tasksState instead of tasks
  const activeTask = useMemo(() => {
    return activeTaskId ? tasksState.find(t => t.id === activeTaskId) : null;
  }, [activeTaskId, tasksState]);
  
  // Get article content based on active task
  const getArticleContent = (taskId: string) => {
    console.log(`Getting content for task ID: ${taskId}`);
    
    // Special case handling for known tasks
    if (taskId === 'task1') {
      // Start Leave Management content...
      return {
        title: "Access Kolay Leave Management System",
        readingTime: 0,
        isApplication: true,
        taskType: 'application',
        externalUrl: 'https://kolayik.com',
        handleKolayButtonClick: () => {
          window.open('https://kolayik.com', '_blank');
          if (window.markTaskAsComplete) {
            console.log('Marking task1 as complete from Kolay button click');
            window.markTaskAsComplete('task1');
          }
          if (window.clickKolayButton) {
            window.clickKolayButton();
          }
        },
        sections: [
          {
            heading: "",
            content: `
              <div class="kolay-portal">
                <div class="flex flex-col items-center my-10">
                  <div class="w-full max-w-md p-8 mx-auto bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg">
                    <div class="flex items-center mb-6">
                      <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-gray-800">Kolay Leave Portal</h3>
                        <p class="text-sm text-gray-600">Manage your time off requests</p>
                      </div>
                    </div>
                    <div class="p-4 bg-white rounded-xl mb-6 shadow-sm">
                      <ul class="space-y-2">
                        <li class="flex items-center text-sm text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Submit leave requests
                        </li>
                        <li class="flex items-center text-sm text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Check your leave balance
                        </li>
                        <li class="flex items-center text-sm text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          View approval status
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            `
          }
        ]
      };
    }
    
    // Get the task for the given ID
    const task = tasksState.find(t => t.id === taskId);
    console.log(`Task for ID ${taskId}:`, task);
    
    // Special handling for Annual Leave Policies (task2)
    if (taskId === 'task2') {
      try {
        // First try to load from localStorage
        const savedContent = localStorage.getItem('annual_leave_policies_content');
        if (savedContent) {
          console.log('Found Annual Leave Policies content in localStorage');
          return JSON.parse(savedContent);
        }
      } catch (e) {
        console.error('Error loading Annual Leave Policies from localStorage:', e);
      }
    }
    
    // Check if this task is defined as a referral task
    if (task && task.taskType === 'referral') {
      console.log(`Task ${taskId} is a referral task based on taskType property`);
      return {
        title: task.title || "Recommend Team Members",
        readingTime: 0,
        isReferral: true,
        taskType: 'referral',
        sections: [
          {
            heading: "Recommend Team Members",
            content: `
              <p class="mb-4">Share this training resource with your colleagues to help improve the team's overall HR management skills.</p>
              <p class="mb-4">Complete the form below to send an invitation to your team members. This will help build a stronger, more knowledgeable team.</p>
            `
          }
        ]
      };
    }
    
    // For all tasks, try to load from sessionStorage first
    try {
      const storedContent = sessionStorage.getItem(`task_content_${taskId}`);
      if (storedContent) {
        console.log(`Found content for task ${taskId} in sessionStorage`);
        const content = JSON.parse(storedContent);
        
        // For each task type, ensure they have the right properties
        if (content.taskType === 'quiz' || content.isQuiz) {
          content.isQuiz = true;
          content.readingTime = 0; // No reading time for quizzes
        }
        
        if (content.taskType === 'video' || content.isVideo) {
          content.isVideo = true;
          if (!content.readingTime) content.readingTime = 30;
        }
        
        if (content.taskType === 'application' || content.isApplication) {
          content.isApplication = true;
          content.readingTime = 0; // No reading time for application tasks
        }
        
        if (content.taskType === 'referral' || content.isReferral) {
          content.isReferral = true;
          content.taskType = 'referral';
          content.readingTime = 0; // No reading time for referral tasks
          console.log(`Task ${taskId} is a referral task based on stored content`);
        }
        
        return content;
      }
    } catch (e) {
      console.error(`Error loading content for task ${taskId} from sessionStorage:`, e);
    }
    
    // If no stored content is found, get from task object
    if (task && task.content) {
      console.log(`Using content from task object for ${taskId}:`, task.content);
      
      // Make sure referral properties are set correctly
      if (task.taskType === 'referral' && task.content) {
        task.content.isReferral = true;
        task.content.taskType = 'referral';
      }
      
      return task.content;
    }
    
    console.log(`No content found for task ${taskId}, using fallback content`);
    
    // Fallback content for various task types
    if (taskId === 'task2') {
      // Annual Leave Policies content...
      return {
        title: "Annual Leave Policies",
        readingTime: 40,
        isReading: true,
        sections: [
          {
            heading: "Leave Entitlement",
            content: "Full-time employees are entitled to annual leave based on their length of service:\n\n• 0-2 years: 20 days per year (1.67 days accrued monthly)\n• 3-5 years: 22 days per year (1.83 days accrued monthly)\n• 6+ years: 25 days per year (2.08 days accrued monthly)\n\nPart-time employees receive leave on a pro-rata basis according to their working hours. The leave year runs from January to December, with unused leave expiring at the end of the period unless special approval is obtained."
          },
          {
            heading: "Requesting Annual Leave",
            content: "To request annual leave, employees must follow these steps:\n\n1. Submit requests through the Kolay Leave Management System\n2. Provide at least 2 weeks' notice for leave of 3 days or more\n3. Obtain manager approval before confirming any travel arrangements\n4. For team leaders, ensure adequate coverage for your team during absence\n\nLeave requests are typically processed within 48 hours. Requests that conflict with critical business periods or other team members' approved leave may require adjustment."
          },
          {
            heading: "Leave Approval Process",
            content: "The leave approval process involves several considerations:\n\n• Managers review requests based on business needs and team coverage\n• Department heads may need to approve extended leave (>1 week)\n• HR maintains oversight of leave balances and policy compliance\n• Automatic email notifications inform all parties of request status\n\nEmployees can check their request status at any time through the Kolay portal. If a request is declined, a reason must be provided, and managers should work with employees to find alternative dates."
          },
          {
            heading: "Special Circumstances",
            content: "In certain situations, special leave arrangements may apply:\n\n## Carrying Over Leave\nUp to 5 days of unused leave may be carried over to the next year with manager approval, but must be used within the first quarter.\n\n## Buying/Selling Leave\nEmployees may buy up to 5 additional days or sell up to 5 days of their entitlement once per year during the benefits enrollment period.\n\n## Emergency Leave Requests\nUrgent leave requests may be submitted with less than the standard notice period, though approval remains subject to business needs and is at management discretion."
          }
        ]
      };
    } else if (taskId === 'task3') {
      // Sick Leave Procedures Quiz content...
      return {
        title: "Sick Leave Procedures Quiz",
        readingTime: 0,
        isQuiz: true,
        questions: [
          {
            question: "How soon should an employee notify their manager when taking sick leave?",
            options: [
              "Within one hour of their scheduled start time",
              "At least 24 hours in advance",
              "Within three days",
              "Only if they will be absent for more than one day"
            ],
            correctAnswer: 0,
            explanation: "Our policy requires notification within one hour of your scheduled start time at the latest."
          },
          {
            question: "When is a medical certificate required?",
            options: [
              "For any sick leave",
              "For sick leave lasting more than three consecutive workdays",
              "Only for sick leave longer than a week",
              "Only when requested by a manager"
            ],
            correctAnswer: 1,
            explanation: "A medical certificate is required for sick leave lasting more than three consecutive workdays."
          },
          {
            question: "How much sick leave do full-time employees accrue per month?",
            options: [
              "Half a day",
              "One day",
              "Two days",
              "Three days"
            ],
            correctAnswer: 1,
            explanation: "Full-time employees accrue sick leave at a rate of 1 day per month."
          }
        ],
        sections: [
          {
            heading: "Sick Leave Procedures",
            content: "Complete the quiz to test your knowledge of sick leave procedures."
          }
        ]
      };
    } else if (taskId === 'task5' || taskId.includes('video')) {
      // Video content...
      return {
        title: "Leave Approval Workflows",
        readingTime: 30,
        isVideo: true,
        videoUrl: "https://www.youtube.com/embed/HX9oQ3eozFo?si=uwysTtqo6OX9zxTJ&enablejsapi=1",
        sections: [
          {
            heading: "Video Tutorial",
            content: `
            <div class="aspect-video w-full max-w-2xl mx-auto my-4">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/HX9oQ3eozFo?si=uwysTtqo6OX9zxTJ&enablejsapi=1" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                id="workflow-video"
                allowfullscreen>
              </iframe>
            </div>
            <p class="text-center text-gray-500 text-sm mt-2">Watch the complete video to mark this task as complete</p>
            `
          }
        ]
      };
    } else if (taskId === 'task6' || (task && task.taskType === 'referral')) {
      console.log(`Generating fallback referral content for task ${taskId}`);
      return {
        title: task?.title || "Recommend Team Members",
        readingTime: 0,
        isReferral: true,
        taskType: 'referral',
        sections: [
          {
            heading: "Recommend Team Members",
            content: `
              <p class="mb-4">Share this training resource with your colleagues to help improve the team's overall HR management skills.</p>
              <p class="mb-4">Complete the form below to send an invitation to your team members. This will help build a stronger, more knowledgeable team.</p>
            `
          }
        ]
      };
    } else {
      // Default fallback content...
      return {
        title: "Task Information",
        readingTime: 0,
        sections: [
          {
            heading: "Task Details",
            content: "Please select a specific task to view the relevant information and instructions for completing it."
          }
        ]
      };
    }
  };
  
  // Define article after getArticleContent is defined
  const article = useMemo(() => {
    return activeTask ? getArticleContent(activeTask.id) : null;
  }, [activeTask]);
  
  // Add a function to check if all quiz questions have been answered
  const areAllQuestionsAnswered = (article) => {
    if (!article || !article.isQuiz) return false;
    return article.questions.every((_, index) => quizAnswers[index] !== undefined);
  };
  
  // Timer logic with timestamp approach and error handling
  useEffect(() => {
    try {
      if (!article || !activeTask) return;
      
      // If it's a quiz, only enable completion when all questions are answered
      if (hasContentType(article, 'quiz')) {
        setReadingTimeRemaining(0);
        setMarkCompleteDisabled(!areAllQuestionsAnswered(article));
        return;
      }
      
      // Handle application tasks - start with button disabled
      if (hasContentType(article, 'application')) {
        setReadingTimeRemaining(0);
        // Disable mark complete button until URL is clicked
        setMarkCompleteDisabled(!urlClicked[activeTask.id]);
        return;
      }
      
      // Handle referral form
      if (hasContentType(article, 'referral')) {
        setReadingTimeRemaining(0);
        // For referral tasks, start with button disabled until form is submitted
        setMarkCompleteDisabled(!referralFormSubmitted[activeTask.id]);
        
        // Enable global function to handle form submission for all referral tasks
        window.handleReferralSubmit = () => {
          console.log(`Referral form submitted successfully for task ${activeTask.id}`);
          // Mark this specific task's form as submitted
          setReferralFormSubmitted(prev => ({
            ...prev,
            [activeTask.id]: true
          }));
          setMarkCompleteDisabled(false);
        };
        
        // Function to auto-complete task from the form
        window.markTaskAsComplete = (taskId) => {
          console.log(`markTaskAsComplete called with taskId: ${taskId}`);
          if (taskId === activeTask.id && !activeTask.completed) {
            handleToggleTask(taskId, true, true);
          }
        };
        
        return;
      }
      
      // Check if task is already completed
      if (activeTask.completed) {
        setMarkCompleteDisabled(false);
        setReadingTimeRemaining(0);
        return;
      }
      
      // Handle video tasks
      if (hasContentType(article, 'video')) {
        console.log('Setting up video task:', activeTask.id);
        setReadingTimeRemaining(0);
        setMarkCompleteDisabled(true);
        
        // Add event listener to YouTube iframe API after component mounts
        const setupYouTubeAPI = () => {
          console.log('Setting up YouTube API for task:', activeTask.id);
          
          // Check if the YouTube iframe exists
          const videoIframe = document.getElementById('workflow-video');
          
          if (!videoIframe) {
            console.error("YouTube iframe not found");
            // Fallback - enable button after the reading time
            setTimeout(() => {
              console.log('Video iframe not found, enabling completion button after timeout');
              setMarkCompleteDisabled(false);
            }, article.readingTime * 1000 || 30000); // Default to 30 seconds if no reading time
            return;
          }
          
          // Create a global function that can be called directly from the iframe
          window.markVideoAsComplete = () => {
            console.log('markVideoAsComplete called from window');
            setMarkCompleteDisabled(false);
            
            // Auto-complete the task
            if (activeTask && !activeTask.completed) {
              console.log('Auto-completing video task from direct call:', activeTask.id);
              handleToggleTask(activeTask.id, true, true);
            }
          };
          
          // If we have a source string, try to update it to add our event
          try {
            const iframe = videoIframe as HTMLIFrameElement;
            if (iframe.src) {
              // Add an event parameter to trigger our callback
              const updatedSrc = iframe.src.includes('?') 
                ? iframe.src + '&enablejsapi=1&origin=' + window.location.origin
                : iframe.src + '?enablejsapi=1&origin=' + window.location.origin;
              
              if (iframe.src !== updatedSrc) {
                iframe.src = updatedSrc;
                console.log('Updated iframe src to enable API:', updatedSrc);
              }
            }
          } catch (e) {
            console.error('Error updating iframe src:', e);
          }
          
          // Add additional script to listen for post messages from the iframe
          const handleYouTubeMessage = (event: MessageEvent) => {
            try {
              if (typeof event.data === 'string') {
                const data = JSON.parse(event.data);
                if (data.event === 'onStateChange' && data.info === 0) {
                  console.log('Video ended (via postMessage), enabling completion button');
                  window.markVideoAsComplete();
                }
              }
            } catch (e) {
              // Not a YouTube API message, ignore
            }
          };
          
          window.addEventListener('message', handleYouTubeMessage);
          
          // Load the YouTube API if it's not already available
          if (!window.YT) {
            console.log('YouTube API not found, loading it now');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Set up the callback for when the API is ready
            window.onYouTubeIframeAPIReady = () => {
              console.log('YouTube API ready, initializing player');
              initializeYouTubePlayer(videoIframe);
            };
          } else {
            // If the API is already available, initialize the player
            console.log('YouTube API already available, initializing player');
            initializeYouTubePlayer(videoIframe);
          }
          
          // Add a fallback timer to enable the button after the video duration
          const videoDuration = article.readingTime || 30; // Default 30 seconds if not specified
          setTimeout(() => {
            console.log(`Fallback timer (${videoDuration}s) completed, enabling completion button`);
            setMarkCompleteDisabled(false);
          }, videoDuration * 1000);
          
          return () => {
            window.removeEventListener('message', handleYouTubeMessage);
            delete window.markVideoAsComplete;
          };
        };
        
        // Function to initialize the YouTube player
        const initializeYouTubePlayer = (iframe) => {
          try {
            console.log('Initializing YouTube player with iframe:', iframe);
            new window.YT.Player(iframe, {
              events: {
                'onReady': (event) => {
                  console.log('YouTube player ready, video can now play');
                },
                'onStateChange': (event) => {
                  console.log('YouTube player state changed:', event.data);
                  // Video ended (state = 0)
                  if (event.data === 0) {
                    console.log('Video ended, enabling completion button');
                    window.markVideoAsComplete();
                  }
                }
              }
            });
          } catch (err) {
            console.error('Error initializing YouTube player:', err);
            // Fallback - enable button after timeout
            setTimeout(() => {
              console.log('Error initializing player, enabling completion button after timeout');
              setMarkCompleteDisabled(false);
            }, article.readingTime * 1000 || 30000);
          }
        };
        
        // Delay setup slightly to ensure iframe is in the DOM
        setTimeout(setupYouTubeAPI, 1000);
        return;
      }
      
      // For regular article tasks with reading time, continue with existing logic...
      // Check localStorage for existing timer
      const storageKey = `article_timer_${activeTask.id}`;
      let storedTimerData;
      
      try {
        if (typeof window !== 'undefined') {
          storedTimerData = localStorage.getItem(storageKey);
        }
      } catch (err) {
        console.error("Error accessing localStorage:", err);
        // Continue without localStorage
      }
      
      let startTime: number;
      
      if (storedTimerData) {
        // Resume existing timer
        startTime = parseInt(storedTimerData, 10);
      } else if (article.readingTime > 0) {
        // Start new timer
        startTime = Date.now();
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, startTime.toString());
          }
        } catch (err) {
          console.error("Error saving to localStorage:", err);
          // Continue without localStorage
        }
        setMarkCompleteDisabled(true);
      } else {
        // No reading time required
        setMarkCompleteDisabled(false);
        return;
      }
      
      // Calculate time elapsed and remaining
      const totalDuration = article.readingTime * 1000; // convert to ms
      const updateTimer = () => {
        try {
          const now = Date.now();
          const elapsed = now - startTime;
          const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
          
          setReadingTimeRemaining(remaining);
          
          // If timer complete
          if (elapsed >= totalDuration) {
            setMarkCompleteDisabled(false);
            
            // Auto-complete any task when reading is finished
            if (!activeTask.completed && article.readingTime > 0) {
              handleToggleTask(activeTask.id, true, true);
            }
            
            // Clear localStorage timer
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(storageKey);
              }
            } catch (err) {
              console.error("Error removing from localStorage:", err);
            }
            return true; // timer complete
          }
          return false; // timer not complete
        } catch (error) {
          console.error("Error updating timer:", error);
          return true; // Stop the timer on error
        }
      };
      
      // Do initial update
      const isComplete = updateTimer();
      if (isComplete) return;
      
      // Set up interval for updates
      const intervalId = setInterval(() => {
        try {
          const isComplete = updateTimer();
          if (isComplete) {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error in timer interval:", error);
          clearInterval(intervalId);
        }
      }, 500);
      
      return () => {
        clearInterval(intervalId);
      };
    } catch (error) {
      console.error("Error in timer effect:", error);
      setHasError(true);
    }
  }, [article, activeTask, handleToggleTask, quizAnswers, urlClicked, referralFormSubmitted]);
  
  // Reset error state when article changes
  useEffect(() => {
    setHasError(false);
  }, [activeTaskId]);
  
  // Function to handle errors gracefully
  const handleErrorReturn = () => {
    router.push('/');
  };
  
  const handleTryAgain = () => {
    setHasError(false);
    router.push(`/tasks?taskId=${activeTaskId}`);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No need to clean up interval as it's handled in the timer effect
    };
  }, []);

  // Add state to track if Kolay link has been clicked
  const [kolayLinkClicked, setKolayLinkClicked] = useState<{[taskId: string]: boolean}>({});

  // Update the useEffect that handles the Kolay link click
  useEffect(() => {
    console.log('Setting up markTaskAsComplete function in global window object');
    
    // Make the toggle function available globally for the Kolay link
    window.markTaskAsComplete = (taskId) => {
      console.log(`markTaskAsComplete called with taskId: ${taskId}`);
      handleToggleTask(taskId, true, true);
      // Set that the link has been clicked
      setKolayLinkClicked(prev => {
        console.log(`Setting kolayLinkClicked for ${taskId} to true`);
        return {...prev, [taskId]: true};
      });
      
      // Mark referral form as submitted if taskId is task6
      if (taskId === 'task6') {
        setReferralFormSubmitted(prev => ({...prev, [taskId]: true}));
      }
    };
    
    // Add a debug helper function that can be called from console
    window.clickKolayButton = () => {
      console.log('Debug: Simulating Kolay button click from console');
      window.markTaskAsComplete('task1');
    };
    
    // Enable referral form submission function
    window.handleReferralSubmit = () => {
      console.log('Referral form submitted successfully');
      setMarkCompleteDisabled(false);
      // Mark the form as submitted
      setReferralFormSubmitted(prev => ({...prev, 'task6': true}));
    };
    
    // Verify the function is set up
    console.log('window.markTaskAsComplete is now:', typeof window.markTaskAsComplete);
    console.log('window.clickKolayButton is now:', typeof window.clickKolayButton);

    // Clean up on unmount
    return () => {
      console.log('Removing global functions from window object');
      delete window.markTaskAsComplete;
      delete window.clickKolayButton;
      delete window.handleReferralSubmit;
    };
  }, [handleToggleTask]);

  // Use effect to update module expanded state when badgeId changes
  useEffect(() => {
    if (badgeId) {
      setExpandedModules(prev => ({
        ...prev,
        [filteredModules.find(m => m.badgeId === badgeId).id]: true
      }));
    }
  }, [badgeId, filteredModules]);

  // Add this setup in the useEffect for form handling
  useEffect(() => {
    if (article?.isReferral) {
      // Create a function that can be called from the HTML
      window.handleReferralSubmit = () => {
        console.log('Referral form submitted successfully');
        setMarkCompleteDisabled(false);
      };
      
      return () => {
        // Clean up on unmount
        delete window.handleReferralSubmit;
      };
    }
  }, [article]);

  // Add a helper function to determine task type
  const getTaskType = (task) => {
    // First check taskType property
    if (task.taskType) {
      return task.taskType;
    }
    
    // Then check content.taskType
    if (task.content?.taskType) {
      return task.content.taskType;
    }
    
    // Fall back to checking specific task IDs for backward compatibility
    if (task.id === 'task3') return 'quiz';
    if (task.id === 'task1') return 'application';
    if (task.id === 'task5') return 'video';
    if (task.id === 'task6') return 'referral';
    if (task.id === 'task2' || task.id === 'task4' || task.id === 'task8') return 'reading';
    
    // Get content from sessionStorage if available
    try {
      if (typeof window !== 'undefined') {
        const storedContent = sessionStorage.getItem(`task_content_${task.id}`);
        if (storedContent) {
          const content = JSON.parse(storedContent);
          if (content.taskType) return content.taskType;
          if (content.isQuiz) return 'quiz';
          if (content.isApplication) return 'application';
          if (content.isVideo) return 'video';
          if (content.isReferral) return 'referral';
          if (content.readingTime > 0 || content.isReading) return 'reading';
        }
      }
    } catch (e) {
      console.error('Error determining task type:', e);
    }
    
    // Default to 'regular' content
    return 'regular';
  };

  // Helper function to determine if article has specific content type
  const hasContentType = (article, type) => {
    if (!article) return false;
    
    if (type === 'referral') {
      console.log('Checking if article is referral type:', {
        isReferral: article.isReferral,
        taskType: article.taskType,
        article
      });
    }
    
    switch (type) {
      case 'quiz':
        return article.isQuiz || (article.taskType === 'quiz');
      case 'application':
        return article.isApplication || (article.taskType === 'application');
      case 'video':
        return article.isVideo || (article.taskType === 'video');
      case 'referral':
        return article.isReferral || (article.taskType === 'referral');
      case 'reading':
        return article.isReading || article.readingTime > 0 || (article.taskType === 'reading');
      default:
        return false;
    }
  };

  // Function to render video content
  const renderVideoContent = (article) => {
    // Get video URL from the article content
    const videoUrl = article.videoUrl || 'https://www.youtube.com/embed/HX9oQ3eozFo?si=uwysTtqo6OX9zxTJ&enablejsapi=1';
    
    return (
      <div>
        {article.sections && article.sections.map((section, index) => (
          <div key={index} className="mb-6">
            {section.heading && (
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.heading}</h2>
            )}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: section.content.includes('<iframe') 
                  ? section.content 
                  : `
                    <div class="aspect-video w-full max-w-2xl mx-auto my-4">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src="${videoUrl}" 
                        title="Video content" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin" 
                        id="workflow-video"
                        allowfullscreen>
                      </iframe>
                    </div>
                    <p class="text-center text-gray-500 text-sm mt-2">Watch the complete video to mark this task as complete</p>
                  `
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Function to handle quiz answers
  const handleQuizAnswer = (questionIndex, optionIndex) => {
    console.log(`Question ${questionIndex} answered with option ${optionIndex}`);
    
    setQuizAnswers(prev => {
      const updatedAnswers = {
        ...prev,
        [questionIndex]: optionIndex
      };
      console.log('Updated quiz answers:', updatedAnswers);
      
      // Check if all questions are answered and enable completion if they are
      if (article && article.questions && 
          Object.keys(updatedAnswers).length === article.questions.length) {
        console.log('All questions answered, enabling completion');
        setMarkCompleteDisabled(false);
      }
      
      return updatedAnswers;
    });
  };

  // Utility function to save task content to sessionStorage
  const saveTaskContent = useCallback((taskId: string, content: any) => {
    if (typeof window !== 'undefined' && taskId && content) {
      try {
        console.log(`Saving content for task ${taskId} to sessionStorage:`, content);
        sessionStorage.setItem(`task_content_${taskId}`, JSON.stringify(content));
        return true;
      } catch (e) {
        console.error(`Error saving content for task ${taskId}:`, e);
        return false;
      }
    }
    return false;
  }, []);

  // Ensure referral tasks have the correct content saved
  useEffect(() => {
    tasksState.forEach(task => {
      if (task.taskType === 'referral') {
        // Check if content exists in sessionStorage
        try {
          const existingContent = sessionStorage.getItem(`task_content_${task.id}`);
          if (!existingContent) {
            // Create default referral content
            const referralContent = {
              title: task.title || "Recommend Team Members",
              readingTime: 0,
              isReferral: true,
              taskType: 'referral',
              sections: [
                {
                  heading: "Recommend Team Members",
                  content: `
                    <p class="mb-4">Share this training resource with your colleagues to help improve the team's overall HR management skills.</p>
                    <p class="mb-4">Complete the form below to send an invitation to your team members. This will help build a stronger, more knowledgeable team.</p>
                  `
                }
              ]
            };
            saveTaskContent(task.id, referralContent);
            console.log(`Created and saved referral content for task ${task.id}`);
          }
        } catch (e) {
          console.error(`Error checking/saving referral content for task ${task.id}:`, e);
        }
      }
    });
  }, [tasksState, saveTaskContent]);

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
      
      {/* Top Right: Task Header and Filters */}
      <div className="bg-white px-6 flex items-center justify-between border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Tasks</div>
          <div className="text-sm text-gray-600">Complete your tasks to earn badges and certificates</div>
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
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
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
        {/* Task Tabs - Similar to rewards page */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active Tasks
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Tasks
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredModules.map(module => {
            // Filter tasks based on the selected tab
            const filteredTasks = module.tasks.filter(task => {
              if (activeTab === 'active') return !task.completed;
              if (activeTab === 'completed') return task.completed;
              return true; // Default fallback
            });
            
            // Only show modules that have tasks matching the filter
            if (filteredTasks.length === 0) return null;
            
            return (
              <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Accordion Header - Clickable */}
                <button 
                  className="w-full p-5 flex items-center justify-between transition-colors hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleModule(module.id)}
                  aria-expanded={expandedModules[module.id]}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${
                      module.completed ? 'bg-green-100' : 'bg-indigo-100'
                    }`}>
                      <svg className={`w-5 h-5 ${module.completed ? 'text-green-600' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
                        <div className="flex items-center bg-indigo-50 px-2 py-0.5 rounded-md">
                          <span className="text-indigo-600 mr-1.5">{getBadgeIcon(module.badgeId)}</span>
                          <span className="text-xs font-medium text-indigo-700">{module.badgeName}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium mr-3 ${
                          module.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {module.completed ? 'Completed' : 'In Progress'}
                        </div>
                        <span className="text-xs text-gray-500">
                          {module.tasks.filter(t => t.completed).length} of {module.tasks.length} tasks completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress and Expand/Collapse Icon */}
                  <div className="flex items-center">
                    {/* Modern Progress Circle */}
                    <div className="mr-4 relative w-12 h-12 flex items-center justify-center">
                      <div className={`absolute w-full h-full rounded-full shadow-inner ${
                        module.completed ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-indigo-50 to-indigo-100'
                      }`}></div>
                      <svg className="absolute w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15" 
                          fill="none" 
                          className="opacity-25" 
                          stroke={module.completed ? "#10b981" : "#6366f1"} 
                          strokeWidth="3"
                        ></circle>
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15" 
                          fill="none" 
                          stroke={module.completed ? "#10b981" : "#6366f1"}
                          strokeWidth="3" 
                          strokeDasharray={100} 
                          strokeDashoffset={100 - ((module.tasks.filter(t => t.completed).length / module.tasks.length) * 100)}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-in-out"
                          filter="url(#glow)"
                        ></circle>
                      </svg>
                      <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                        module.completed ? 'text-green-700' : 'text-indigo-700'
                      }`}>
                        {Math.round((module.tasks.filter(t => t.completed).length / module.tasks.length) * 100)}%
                      </div>
                      
                      {/* SVG filter for glow effect */}
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feFlood floodColor={module.completed ? "#10b981" : "#6366f1"} floodOpacity="0.3" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                              <feMergeNode in="glow" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Chevron */}
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        expandedModules[module.id] ? 'transform rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
                
                {/* Accordion Content - Tasks */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedModules[module.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-gray-100">
                    {/* Tasks List */}
                    <div className="divide-y divide-gray-50">
                      {filteredTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out ${
                            task.completed ? 'bg-gray-50/50' : ''
                          } ${activeTaskId === task.id ? 'bg-indigo-50/70' : ''} ${
                            task.id === 'task1' ? 'relative' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border border-gray-300 flex items-center justify-center
                                ${task.completed 
                                  ? 'bg-indigo-500 border-indigo-500 text-white hover:bg-indigo-600' 
                                  : task.id === 'task1'
                                    ? 'border-blue-400 hover:bg-blue-50'
                                    : 'hover:border-indigo-400 hover:bg-indigo-50'
                                } transition-all duration-200 relative`}
                              onClick={() => handleToggleTask(task.id, !task.completed)}
                              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              {task.completed && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              
                              {/* Tooltip for tasks that require article reading */}
                              {tooltipTaskId === task.id && (
                                <div className="absolute left-7 top-0 z-10 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
                                  {task.completed 
                                    ? "Once completed, a task cannot be marked as incomplete" 
                                    : (() => {
                                        const taskContent = getArticleContent(task.id);
                                        return taskContent.isQuiz
                                          ? "Answer all quiz questions to complete this task"
                                          : taskContent.isApplication
                                            ? "Click the 'Access Kolay System' button to complete this task"
                                            : taskContent.isVideo
                                              ? "Watch the video to complete this task"
                                              : taskContent.isReferral
                                                ? "Submit a referral to complete this task"
                                                : taskContent.readingTime > 0
                                                  ? "Read the article to complete this task" 
                                                  : "Please complete this task";
                                    })()
                                  }
                                </div>
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : task.id === 'task1' ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                
                                {task.id === 'task1' && (
                                  <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-600/20">
                                    Start
                                  </span>
                                )}
                                
                                {/* When displaying content tags in the task list */}
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                  getTaskType(task) === 'quiz'
                                    ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                                    : getTaskType(task) === 'application'
                                      ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/20'
                                    : getTaskType(task) === 'video'
                                      ? 'bg-pink-50 text-pink-700 ring-pink-600/20'
                                      : getTaskType(task) === 'referral'
                                        ? 'bg-orange-50 text-orange-700 ring-orange-600/20'
                                        : getTaskType(task) === 'reading'
                                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                          : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                }`}>
                                  {getTaskType(task) === 'quiz'
                                    ? 'Quiz' 
                                    : getTaskType(task) === 'application'
                                      ? 'Application' 
                                      : getTaskType(task) === 'video'
                                        ? 'Video'
                                        : getTaskType(task) === 'referral'
                                          ? 'Referral'
                                          : getTaskType(task) === 'reading'
                                            ? 'Reading'
                                            : 'Content'
                                  }
                                </span>
                              </div>
                              
                              <p className={`text-xs mt-1 ${
                                task.completed 
                                  ? 'text-gray-400' 
                                  : task.id === 'task1' 
                                    ? 'text-blue-600 font-medium' 
                                    : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                              
                              {/* Show dialog option for both Leave Fundamentals and Advanced Leave Management tasks */}
                              {(module.id === 'module1' || module.id === 'module2') && (
                                <button 
                                  onClick={() => openTaskDialog(task.id)}
                                  className={`mt-2 text-xs flex items-center font-medium ${
                                    activeTaskId === task.id 
                                      ? 'text-indigo-600' 
                                      : task.id === 'task1' && !task.completed
                                        ? 'text-cyan-600 hover:text-cyan-700'
                                        : 'text-indigo-500 hover:text-indigo-600'
                                  }`}
                                >
                                  {getTaskType(task) === 'quiz' ? (
                                    <>
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                      </svg>
                                      {activeTaskId === task.id ? 'Quiz open' : 'Solve a Quiz'}
                                    </>
                                  ) : getTaskType(task) === 'application' ? (
                                    <>
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                      </svg>
                                      {activeTaskId === task.id ? 'Application open' : 'Go to Kolay'}
                                    </>
                                  ) : getTaskType(task) === 'video' ? (
                                    <>
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {activeTaskId === task.id ? 'Video open' : 'Watch the video'}
                                    </>
                                  ) : getTaskType(task) === 'referral' ? (
                                    <>
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                      <span className="group relative">
                                        {activeTaskId === task.id ? 'Referral open' : 'Be a reference'}
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-40 text-center z-10">
                                          Refer colleagues to earn rewards together
                                          <svg className="absolute text-gray-800 h-2 w-2 left-1/2 -translate-x-1/2 top-full" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon></svg>
                                        </span>
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                      </svg>
                                      {activeTaskId === task.id ? 'Article open' : 'Read article'}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Task Dialog Modal */}
      {activeTask && article && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={closeTaskDialog}
          ></div>
          
          {/* Modal panel */}
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div 
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 sm:px-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <span className="text-indigo-600 text-sm">
                        {activeTask.id === 'task1' ? '🚀' : '📝'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-gray-900">{activeTask.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{activeTask.description}</p>
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-500"
                    onClick={closeTaskDialog}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTask.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeTask.completed ? 'Completed' : 'In Progress'}
                  </span>
                  
                  {/* Add reading time indicator */}
                  {hasContentType(article, 'reading') && !hasError && !hasContentType(article, 'quiz') && !hasContentType(article, 'video') && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reading time: {readingTimeRemaining > 0 ? `${readingTimeRemaining}s remaining` : 'Complete'}
                    </span>
                  )}
                  
                  {/* Add video indicator */}
                  {hasContentType(article, 'video') && !hasError && (
                    <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Video
                    </span>
                  )}

                  {/* Add a quiz indicator */}
                  {hasContentType(article, 'quiz') && !hasError && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Quiz
                    </span>
                  )}
                  
                  {/* Add an application indicator */}
                  {hasContentType(article, 'application') && !hasError && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Application
                    </span>
                  )}

                  {/* Add referral indicator */}
                  {hasContentType(article, 'referral') && !hasError && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Referral
                    </span>
                  )}
                </div>
              </div>
              
              {/* Article Content or Error UI */}
              <div className="px-6 py-5 sm:px-6 max-h-[60vh] overflow-y-auto">
                {hasError ? (
                  <div className="px-6 py-20 flex flex-col items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                      <p className="text-gray-600 mb-6">We apologize for the inconvenience. Please try again or return to the home page.</p>
                      <div className="flex justify-center space-x-4">
                        <button 
                          onClick={handleTryAgain}
                          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                          Try again
                        </button>
                        <button 
                          onClick={handleErrorReturn}
                          className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Return Home
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>
                    
                    {/* Display quiz for Sick Leave Procedures */}
                    {hasContentType(article, 'quiz') ? (
                      <div className="space-y-10">
                        {article.questions && article.questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h3>
                            <div className="space-y-3">
                              {question.options.map((option, oIndex) => (
                                <label key={oIndex} className={`flex items-start p-3 rounded-lg border-2 ${quizAnswers[qIndex] === oIndex ? (oIndex === question.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'border-gray-100 hover:border-gray-200'} cursor-pointer transition-all`}>
                                  <input 
                                    type="radio" 
                                    name={`question-${qIndex}`}
                                    disabled={quizAnswers[qIndex] !== undefined}
                                    checked={quizAnswers[qIndex] === oIndex}
                                    onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                    className="mr-3 mt-1" 
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                            
                            {/* Show explanation when answered */}
                            {quizAnswers[qIndex] !== undefined && (
                              <div className={`mt-4 p-4 rounded-lg ${quizAnswers[qIndex] === question.correctAnswer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <div className="flex items-center font-medium mb-2">
                                  {quizAnswers[qIndex] === question.correctAnswer ? (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Correct!
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      Incorrect!
                                    </>
                                  )}
                                </div>
                                <p>{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : hasContentType(article, 'application') ? (
                      <div>
                        {article.sections && article.sections.map((section, index) => (
                          <div key={index} className="mb-6">
                            {section.heading && (
                              <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.heading}</h2>
                            )}
                            <div 
                              className="text-gray-700"
                              dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                            {/* Show button for all application tasks, not just task1 */}
                          </div>
                        ))}
                        
                        {/* External URL button for all application tasks */}
                        <div className="kolay-portal-button-container mt-4 flex justify-center">
                          <button
                            onClick={() => {
                              // Mark this URL as clicked
                              setUrlClicked(prev => ({
                                ...prev,
                                [activeTask.id]: true
                              }));
                              
                              // Proceed with the regular behavior
                              if (article.handleKolayButtonClick) {
                                article.handleKolayButtonClick();
                              } else {
                                // Fallback for tasks other than task1
                                const externalUrl = article.externalUrl || 'https://kolayik.com';
                                window.open(externalUrl, '_blank');
                                
                                // Do not auto-complete the task anymore
                                // Instead, just enable the button so the user can click it
                                setMarkCompleteDisabled(false);
                              }
                            }}
                            className="block w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center rounded-lg font-medium shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300"
                          >
                            {activeTask.id === 'task1' ? 'Access Kolay System' : `Open ${article.title || 'External Resource'}`}
                            <span className="inline-block ml-2">→</span>
                          </button>
                          
                          {/* Improved URL display - inside a tooltip instead */}
                          {article.externalUrl && (
                            <div className="relative group">
                              <div className="text-xs text-center text-blue-500 hover:text-blue-600 cursor-pointer mt-2">
                                <span>View URL details</span>
                              </div>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-1 z-10">
                                <p className="text-center break-all">{article.externalUrl}</p>
                                <div className="absolute h-2 w-2 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 rotate-45 bg-gray-800"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : hasContentType(article, 'video') ? (
                      <div className="video-container">
                        {article.sections && article.sections.some(s => s.content.includes('<iframe')) ? (
                          // If a section already includes an iframe, render it as is
                          article.sections.map((section, index) => (
                            <div key={index} className="mb-6">
                              {section.heading && (
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.heading}</h2>
                              )}
                              <div dangerouslySetInnerHTML={{ __html: section.content }} />
                            </div>
                          ))
                        ) : (
                          // Otherwise, create an iframe from the videoUrl
                          <div className="aspect-video w-full max-w-2xl mx-auto my-4">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              src={article.videoUrl || "https://www.youtube.com/embed/HX9oQ3eozFo?si=uwysTtqo6OX9zxTJ&enablejsapi=1"} 
                              title="Video content" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              referrerPolicy="strict-origin-when-cross-origin" 
                              id="workflow-video"
                              allowFullScreen
                            ></iframe>
                            <p className="text-center text-gray-500 text-sm mt-2">Watch the complete video to mark this task as complete</p>
                            <button 
                              className="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-colors" 
                              onClick={() => {
                                if (window.markVideoAsComplete) {
                                  window.markVideoAsComplete();
                                }
                              }}
                            >
                              I've watched the video - Mark as complete
                            </button>
                            <script dangerouslySetInnerHTML={{ __html: `
                              // Monitor video playback to detect completion
                              var videoMonitorInterval = setInterval(function() {
                                try {
                                  const iframe = document.getElementById('workflow-video');
                                  if (iframe && iframe.contentWindow) {
                                    // Try to find the video element inside the iframe
                                    const video = iframe.contentWindow.document.querySelector('video');
                                    if (video) {
                                      // If video exists and has ended or is near the end
                                      if (video.ended || (video.currentTime > 0 && video.duration > 0 && video.currentTime / video.duration > 0.9)) {
                                        console.log('Video detected as complete via monitor');
                                        if (window.markVideoAsComplete) {
                                          window.markVideoAsComplete();
                                          clearInterval(videoMonitorInterval);
                                        }
                                      }
                                    }
                                  }
                                } catch(e) {
                                  // Cross-origin errors are expected, continue monitoring
                                }
                              }, 2000);
                            `}} />
                          </div>
                        )}
                      </div>
                    ) : (
                      // Regular article content
                      article.sections && article.sections.map((section, index) => (
                        <div key={index} className="mb-6">
                          {section.heading && (
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.heading}</h2>
                          )}
                          {hasContentType(article, 'referral') ? (
                            (() => {
                              console.log('Rendering referral form with article:', article);
                              return (
                                <>
                                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                  <ReferralForm 
                                    taskId={activeTask.id}
                                    description="Help your team members improve their skills by recommending this training"
                                    onFormSubmit={() => {
                                      console.log(`Form submitted for task ${activeTask.id}`);
                                      // Mark the form as submitted
                                      setReferralFormSubmitted(prev => ({...prev, [activeTask.id]: true}));
                                      // Enable the mark complete button
                                      setMarkCompleteDisabled(false);
                                    }}
                                  />
                                </>
                              );
                            })()
                          ) : (
                            <div className="text-gray-700 whitespace-pre-line">
                              {section.content}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Footer with only completion button and close button */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse border-t border-gray-200">
                {!hasError && !activeTask.completed && (
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${
                      markCompleteDisabled || (activeTask.id === 'task1' && !kolayLinkClicked[activeTask.id])
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : article?.isQuiz && areAllQuestionsAnswered(article)
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                    onClick={() => handleToggleTask(activeTask.id, true, true)}
                    disabled={markCompleteDisabled || (activeTask.id === 'task1' && !kolayLinkClicked[activeTask.id])}
                  >
                    {article?.isQuiz && areAllQuestionsAnswered(article) ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Quiz Completed
                      </span>
                    ) : activeTask.id === 'task1' && !kolayLinkClicked[activeTask.id] ? (
                      'Click "Access Kolay System" first'
                    ) : activeTask.id === 'task6' && markCompleteDisabled ? (
                      'Send invitation first'
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={closeTaskDialog}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 