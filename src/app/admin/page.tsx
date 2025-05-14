'use client';

import React, { useState, useEffect } from 'react';
import { badges, modules, certificates, rewards, tasks, mockDataHelpers } from '../../lib/mockData';
import { Badge, Module, Certificate, Reward, Task, TaskContent } from '../../types';
import CreationWizard, { WizardItemType } from '../../components/CreationWizard';
import CreationFlowWizard from '../../components/CreationFlowWizard';
import Link from 'next/link';

// Quiz question type
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Referral form field type
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // For select fields
}

export default function AdminPage() {
  // State to control modal visibility
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showFlowWizard, setShowFlowWizard] = useState(false);

  // State to track selected items for editing
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load saved badges from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load badges
        const savedBadges = localStorage.getItem('customBadges');
        if (savedBadges) {
          const parsedBadges = JSON.parse(savedBadges);
          
          // Update the badges array with the saved data
          badges.length = 0; // Clear the array
          badges.push(...parsedBadges); // Add all saved badges
          
          console.log('Loaded custom badges from localStorage:', parsedBadges);
          
          // Initialize filtered badges with loaded badges
          setFilteredBadges(parsedBadges);
        } else {
          // If no saved badges, initialize with default badges
          setFilteredBadges(badges);
        }
        
        // Load modules
        const savedModules = localStorage.getItem('customModules');
        if (savedModules) {
          const parsedModules = JSON.parse(savedModules);
          
          modules.length = 0;
          modules.push(...parsedModules);
          
          console.log('Loaded custom modules from localStorage:', parsedModules);
        }
        
        // Load certificates
        const savedCertificates = localStorage.getItem('customCertificates');
        if (savedCertificates) {
          const parsedCertificates = JSON.parse(savedCertificates);
          
          certificates.length = 0;
          certificates.push(...parsedCertificates);
          
          console.log('Loaded custom certificates from localStorage:', parsedCertificates);
        }
        
        // Load rewards
        const savedRewards = localStorage.getItem('customRewards');
        if (savedRewards) {
          const parsedRewards = JSON.parse(savedRewards);
          
          rewards.length = 0;
          rewards.push(...parsedRewards);
          
          console.log('Loaded custom rewards from localStorage:', parsedRewards);
        }
        
        // Load tasks
        const savedTasks = localStorage.getItem('customTasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          
          tasks.length = 0;
          tasks.push(...parsedTasks);
          
          console.log('Loaded custom tasks from localStorage:', parsedTasks);
        }
      } catch (e) {
        console.error('Error loading data from localStorage:', e);
        // Initialize with default badges in case of error
        setFilteredBadges(badges);
      }
    } else {
      // Initialize with default badges if not in browser
      setFilteredBadges(badges);
    }
  }, []);

  // State for new or edited items
  const [badgeForm, setBadgeForm] = useState<Partial<Badge>>({
    title: '',
    description: '',
    imageUrl: '',
    earned: false,
    points: 0,
    requiredToComplete: [],
    backgroundColor: '#7c3aed', // Default color (indigo/lavender)
    icon: '📅' // Default icon
  });

  const [moduleForm, setModuleForm] = useState<Partial<Module>>({
    title: '',
    description: '',
    completed: false,
    badgeId: ''
  });

  const [certificateForm, setCertificateForm] = useState<Partial<Certificate>>({
    title: '',
    description: '',
    imageUrl: '',
    badgesRequired: [],
    earned: false
  });

  const [rewardForm, setRewardForm] = useState<Partial<Reward>>({
    title: '',
    description: '',
    imageUrl: '',
    badgeRequired: '',
    claimed: false,
    type: 'badge', // Default type is badge-based
    pointCost: 100 // Default point cost
  });

  const [taskForm, setTaskForm] = useState<Partial<Task> & {
    taskType: 'regular' | 'reading' | 'quiz' | 'application' | 'video' | 'referral';
    readingTime: number;
    isQuiz: boolean;
    isApplication: boolean;
    isVideo: boolean;
    isReferral: boolean;
    externalUrl?: string;
    quizQuestions: QuizQuestion[];
    formFields: FormField[];
    emailRecipient?: string;
    sections?: { heading: string; content: string }[];
    videoDescription?: string;
  }>({
    title: '',
    description: '',
    completed: false,
    moduleId: '',
    taskType: 'regular',
    readingTime: 0,
    isQuiz: false,
    isApplication: false,
    isVideo: false,
    isReferral: false,
    externalUrl: '',
    quizQuestions: [],
    formFields: [],
    emailRecipient: ''
  });

  // State for filtered items based on search queries
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('');
  const [certificateSearchQuery, setCertificateSearchQuery] = useState('');
  const [rewardSearchQuery, setRewardSearchQuery] = useState('');
  
  // State for filtered items
  const [filteredBadges, setFilteredBadges] = useState<Badge[]>([]);
  
  // Filtered modules based on search query
  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(moduleSearchQuery.toLowerCase())
  );
  
  // Filtered tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
    modules.find(m => m.id === task.moduleId)?.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
  );
  
  // Update filteredBadges when the search query or badges array changes
  useEffect(() => {
    setFilteredBadges(badges.filter(badge => 
      badge.title.toLowerCase().includes(badgeSearchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(badgeSearchQuery.toLowerCase())
    ));
  }, [badgeSearchQuery, badges]);
  
  // Filtered certificates based on search query
  const filteredCertificates = certificates.filter(certificate => 
    certificate.title.toLowerCase().includes(certificateSearchQuery.toLowerCase()) ||
    certificate.description.toLowerCase().includes(certificateSearchQuery.toLowerCase()) ||
    // Search by required badges
    certificate.badgesRequired.some(badgeId => 
      badges.find(b => b.id === badgeId)?.title.toLowerCase().includes(certificateSearchQuery.toLowerCase())
    )
  );
  
  // Filtered rewards based on search query
  const filteredRewards = rewards.filter(reward => 
    reward.title.toLowerCase().includes(rewardSearchQuery.toLowerCase()) ||
    reward.description.toLowerCase().includes(rewardSearchQuery.toLowerCase()) ||
    // Search by required badge
    (reward.type === 'badge' && badges.find(b => b.id === reward.badgeRequired)?.title.toLowerCase().includes(rewardSearchQuery.toLowerCase()))
  );

  // Function to handle opening the modal for creating new items
  const handleCreate = (type: 'badge' | 'module' | 'certificate' | 'reward' | 'task') => {
    switch (type) {
      case 'badge':
        setSelectedBadge(null);
        setBadgeForm({
          title: '',
          description: '',
          imageUrl: '',
          earned: false,
          points: 0,
          requiredToComplete: [],
          backgroundColor: '#7c3aed', // Default color (indigo/lavender)
          icon: '📅' // Default icon
        });
        setShowBadgeModal(true);
        break;
      case 'module':
        setSelectedModule(null);
        setModuleForm({
          title: '',
          description: '',
          completed: false,
          badgeId: badges.length > 0 ? badges[0].id : ''
        });
        setShowModuleModal(true);
        break;
      case 'certificate':
        setSelectedCertificate(null);
        setCertificateForm({
          title: '',
          description: '',
          imageUrl: '',
          badgesRequired: [],
          earned: false
        });
        setShowCertificateModal(true);
        break;
      case 'reward':
        setSelectedReward(null);
        setRewardForm({
          title: '',
          description: '',
          imageUrl: '',
          badgeRequired: badges.length > 0 ? badges[0].id : '',
          claimed: false,
          type: 'badge',
          pointCost: 100
        });
        setShowRewardModal(true);
        break;
      case 'task':
        setSelectedTask(null);
        setTaskForm({
          title: '',
          description: '',
          completed: false,
          moduleId: modules.length > 0 ? modules[0].id : '',
          taskType: 'regular',
          readingTime: 0,
          isQuiz: false,
          isApplication: false,
          isVideo: false,
          isReferral: false,
          externalUrl: '',
          quizQuestions: [],
          formFields: [],
          emailRecipient: ''
        });
        setShowTaskModal(true);
        break;
    }
  };

  // Function to handle opening the modal for editing existing items
  const handleEdit = (type: 'badge' | 'module' | 'certificate' | 'reward' | 'task', id: string) => {
    switch (type) {
      case 'badge':
        const badge = badges.find(b => b.id === id);
        if (badge) {
          setSelectedBadge(badge);
          setBadgeForm({ ...badge });
          setShowBadgeModal(true);
        }
        break;
      case 'module':
        const moduleItem = modules.find(m => m.id === id);
        if (moduleItem) {
          setSelectedModule(moduleItem);
          setModuleForm({ ...moduleItem });
          setShowModuleModal(true);
        }
        break;
      case 'certificate':
        const certificate = certificates.find(c => c.id === id);
        if (certificate) {
          setSelectedCertificate(certificate);
          setCertificateForm({ ...certificate });
          setShowCertificateModal(true);
        }
        break;
      case 'reward':
        const reward = rewards.find(r => r.id === id);
        if (reward) {
          setSelectedReward(reward);
          setRewardForm({ ...reward });
          setShowRewardModal(true);
        }
        break;
      case 'task':
        const task = tasks.find(t => t.id === id);
        if (task) {
          // For editing, we'll determine task type and options based on stored task data
          // Default values
          let taskType: 'regular' | 'reading' | 'quiz' | 'application' | 'video' | 'referral' = 'regular';
          let readingTime = 0;
          let isQuiz = false;
          let isApplication = false;
          let isVideo = false;
          let isReferral = false;
          let externalUrl = '';
          let quizQuestions: QuizQuestion[] = [];
          let formFields: FormField[] = [];
          let emailRecipient = '';
          
          // Try to fetch the task content data from the mock server
          try {
            // First check if the task already has a content property
            let taskContent = task.content;
            
            // If not, try to get it from sessionStorage
            if (!taskContent) {
              const storedTaskContent = sessionStorage.getItem(`task_content_${task.id}`);
              
              if (storedTaskContent) {
                try {
                  taskContent = JSON.parse(storedTaskContent);
                  console.log('Loading stored task content:', taskContent);
                } catch (e) {
                  console.error('Error parsing stored task content:', e);
                }
              }
            } else {
              console.log('Using task content property:', taskContent);
            }
            
            // If we have task content, use it to set up the form
            if (taskContent) {
              // Determine task type based on content flags
              if (taskContent.isQuiz) {
                taskType = 'quiz';
                isQuiz = true;
                quizQuestions = taskContent.questions || [];
              } else if (taskContent.isApplication) {
                taskType = 'application';
                isApplication = true;
                externalUrl = taskContent.externalUrl || '';
              } else if (taskContent.isVideo) {
                taskType = 'video';
                isVideo = true;
                externalUrl = taskContent.videoUrl || '';
                
                // Extract video description from the content if available
                if (taskContent.sections && taskContent.sections.length > 0) {
                  const videoSection = taskContent.sections[0];
                  if (videoSection.content) {
                    // Try to extract description from the HTML content
                    const descMatch = videoSection.content.match(/<p class="text-center text-gray-500 text-sm mt-2">(.*?)<\/p>/);
                    if (descMatch && descMatch[1]) {
                      setTaskForm(prev => ({
                        ...prev,
                        videoDescription: descMatch[1]
                      }));
                    }
                  }
                }
              } else if (taskContent.isReferral) {
                taskType = 'referral';
                isReferral = true;
                emailRecipient = taskContent.emailRecipient || '';
                formFields = taskContent.additionalFields || [];
              } else if (taskContent.readingTime > 0) {
                taskType = 'reading';
                readingTime = taskContent.readingTime || 0;
                // Load content sections for reading task
                const sections = taskContent.sections || [];
                setTaskForm(prev => ({
                  ...prev,
                  sections: sections.length > 0 ? sections : [{ heading: "Content", content: "" }]
                }));
              }
            } else {
              // Fallback to the old hardcoded approach for backward compatibility
              if (task.id === 'task1') {
                taskType = 'application';
                isApplication = true;
                externalUrl = 'https://kolayik.com';
              } else if (task.id === 'task2') {
                // Annual Leave Policies
                taskType = 'reading';
                readingTime = 40;
                
                // Create sections directly
                const annualLeaveSections = [
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
                ];
                
                console.log("Annual Leave Policies sections created:", annualLeaveSections);
                
                // Use the sections directly in the taskForm
                setSelectedTask(task);
                setTaskForm({
                  ...task,
                  taskType,
                  readingTime,
                  isQuiz: false,
                  isApplication: false,
                  isVideo: false,
                  isReferral: false,
                  externalUrl: '',
                  quizQuestions: [],
                  formFields: [],
                  emailRecipient: '',
                  sections: annualLeaveSections  // Include sections directly here
                });
                setShowTaskModal(true);
                
                // Log to verify task form setup
                console.log("Task2 form initialized with sections:", annualLeaveSections);
                
                // Skip the rest of the function
                return;
              } else if (task.id === 'task3') {
                taskType = 'quiz';
                isQuiz = true;
                quizQuestions = [
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
                ];
              } else if (task.id === 'task4') {
                taskType = 'reading';
                readingTime = 40;
              } else if (task.id === 'task5') {
                taskType = 'video';
                isVideo = true;
                externalUrl = 'https://www.youtube.com/embed/HX9oQ3eozFo';
              } else if (task.id === 'task6') {
                taskType = 'referral';
                isReferral = true;
                emailRecipient = 'hr@example.com';
                formFields = [
                  {
                    id: 'field_1',
                    label: 'Job Title',
                    type: 'text',
                    required: false,
                    options: []
                  },
                  {
                    id: 'field_2',
                    label: 'Team',
                    type: 'select',
                    required: true,
                    options: ['Engineering', 'Product', 'Marketing', 'Sales', 'HR']
                  }
                ];
              } else if (task.id === 'task8') {
                taskType = 'reading';
                readingTime = 50;
              }
            }
          } catch (error) {
            console.error('Error loading task content:', error);
            // If there's an error, we'll use default values
          }
          
          setSelectedTask(task);
          setTaskForm({
            ...task,
            taskType,
            readingTime,
            isQuiz,
            isApplication,
            isVideo,
            isReferral,
            externalUrl,
            quizQuestions,
            formFields,
            emailRecipient
          });
          setShowTaskModal(true);
        }
        break;
    }
  };

  // Function to handle saving a badge (creating or updating)
  const handleSaveBadge = () => {
    if (!badgeForm.title) {
      alert('Title is required');
      return;
    }

    try {
      // Use the mockDataHelpers to save the badge
      const isNew = !selectedBadge;
      const savedBadge = mockDataHelpers.saveBadge({
        ...badgeForm as Badge,
        id: selectedBadge?.id || '',
        modules: selectedBadge?.modules || []
      }, isNew);

      // Also save badges to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('customBadges', JSON.stringify(badges));
          console.log('Saved badges to localStorage:', badges);
        } catch (e) {
          console.error('Error saving badges to localStorage:', e);
        }
      }

      alert(`Badge "${savedBadge.title}" ${isNew ? 'created' : 'updated'} successfully!`);
      setShowBadgeModal(false);
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('An error occurred while saving the badge.');
    }
  };

  // Function to handle saving a module
  const handleSaveModule = () => {
    if (!moduleForm.title || !moduleForm.badgeId) {
      alert('Title and Badge are required');
      return;
    }

    try {
      // Use the mockDataHelpers to save the module
      const isNew = !selectedModule;
      const savedModule = mockDataHelpers.saveModule({
        ...moduleForm as Module,
        id: selectedModule?.id || '',
        tasks: selectedModule?.tasks || []
      }, isNew);

      // Save modules to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('customModules', JSON.stringify(modules));
          console.log('Saved modules to localStorage:', modules);
        } catch (e) {
          console.error('Error saving modules to localStorage:', e);
        }
      }

      alert(`Module "${savedModule.title}" ${isNew ? 'created' : 'updated'} successfully!`);
      setShowModuleModal(false);
    } catch (error) {
      console.error('Error saving module:', error);
      alert('An error occurred while saving the module.');
    }
  };

  // Function to handle saving a certificate
  const handleSaveCertificate = () => {
    if (!certificateForm.title) {
      alert('Title is required');
      return;
    }

    try {
      // Use the mockDataHelpers to save the certificate
      const isNew = !selectedCertificate;
      const savedCertificate = mockDataHelpers.saveCertificate({
        ...certificateForm as Certificate,
        id: selectedCertificate?.id || ''
      }, isNew);

      // Save certificates to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('customCertificates', JSON.stringify(certificates));
          console.log('Saved certificates to localStorage:', certificates);
        } catch (e) {
          console.error('Error saving certificates to localStorage:', e);
        }
      }

      alert(`Certificate "${savedCertificate.title}" ${isNew ? 'created' : 'updated'} successfully!`);
      setShowCertificateModal(false);
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('An error occurred while saving the certificate.');
    }
  };

  // Function to handle saving a reward
  const handleSaveReward = () => {
    // Validate form data based on reward type
    if (!rewardForm.title) {
      alert('Title is required');
      return;
    }
    
    if (rewardForm.type === 'badge' && !rewardForm.badgeRequired) {
      alert('Badge is required for badge-based rewards');
      return;
    }
    
    if (rewardForm.type === 'point' && (!rewardForm.pointCost || rewardForm.pointCost <= 0)) {
      alert('Point cost must be greater than 0 for point-based rewards');
      return;
    }

    try {
      // Use the mockDataHelpers to save the reward
      const isNew = !selectedReward;
      const savedReward = mockDataHelpers.saveReward({
        ...rewardForm as Reward,
        id: selectedReward?.id || ''
      }, isNew);

      // Save rewards to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('customRewards', JSON.stringify(rewards));
          console.log('Saved rewards to localStorage:', rewards);
        } catch (e) {
          console.error('Error saving rewards to localStorage:', e);
        }
      }

      alert(`Reward "${savedReward.title}" ${isNew ? 'created' : 'updated'} successfully!`);
      setShowRewardModal(false);
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('An error occurred while saving the reward.');
    }
  };

  // Function to handle saving a task
  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.moduleId) {
      alert('Title and Module are required');
      return;
    }

    try {
      console.log('Saving task with type:', taskForm.taskType);
      
      // Create a content object based on task type
      const taskContent = {
        // Common content properties
        title: taskForm.title, // Add title to satisfy the TaskContent interface
        taskType: taskForm.taskType,
        
        // Add properties based on task type
        readingTime: taskForm.taskType === 'reading' ? (taskForm.readingTime || 30) : 0,
        isQuiz: taskForm.taskType === 'quiz',
        isApplication: taskForm.taskType === 'application',
        isVideo: taskForm.taskType === 'video',
        isReferral: taskForm.taskType === 'referral',
        isReading: taskForm.taskType === 'reading',
        
        // Add type-specific content
        sections: taskForm.sections || [],
        questions: taskForm.quizQuestions || [],
        externalUrl: taskForm.externalUrl || '',
        videoUrl: taskForm.externalUrl || '', // For video tasks
        emailRecipient: taskForm.emailRecipient || '',
        additionalFields: taskForm.formFields || [],
        videoDescription: taskForm.videoDescription || ''
      };
      
      // Prepare task data for saving
      const taskToSave = {
        ...taskForm as Task,
        id: selectedTask?.id || '',
        content: taskContent, // Ensure the content object is included
        taskType: taskForm.taskType // Explicitly set taskType at the top level
      };
      
      console.log('Saving task with content:', taskContent);
      console.log('Full task data:', taskToSave);
      
      // Use the mockDataHelpers to save the task
      const isNew = !selectedTask;
      const savedTask = mockDataHelpers.saveTask(taskToSave, isNew);
      
      // IMPORTANT: Also store task content in sessionStorage
      // This ensures that task types are properly recognized throughout the app
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`task_content_${savedTask.id}`, JSON.stringify(taskContent));
          console.log(`Explicitly saved task content to sessionStorage for task ${savedTask.id}:`, taskContent);
        } catch (e) {
          console.error('Error saving task content to sessionStorage:', e);
        }
      }
      
      // Save tasks to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          // Ensure each task has its content before saving
          const tasksToSave = tasks.map(task => {
            // If this is the task we just saved, use the new content
            if (task.id === savedTask.id) {
              return { 
                ...task, 
                content: taskContent,
                taskType: taskForm.taskType 
              };
            }
            
            // For other tasks, preserve their content from sessionStorage if available
            if (!task.content) {
              try {
                const storedContent = sessionStorage.getItem(`task_content_${task.id}`);
                if (storedContent) {
                  const parsedContent = JSON.parse(storedContent);
                  
                  // Determine task type from content properties
                  let taskType = parsedContent.taskType;
                  if (!taskType) {
                    if (parsedContent.isQuiz) taskType = 'quiz';
                    else if (parsedContent.isApplication) taskType = 'application';
                    else if (parsedContent.isVideo) taskType = 'video';
                    else if (parsedContent.isReferral) taskType = 'referral';
                    else if (parsedContent.isReading || parsedContent.readingTime > 0) taskType = 'reading';
                    else taskType = 'regular';
                  }
                  
                  return { 
                    ...task, 
                    content: parsedContent,
                    taskType: task.taskType || taskType
                  };
                }
              } catch (e) {
                console.error(`Error loading content for task ${task.id}:`, e);
              }
            }
            
            // Make sure taskType is consistent even if there's no content
            if (!task.taskType && task.content && task.content.taskType) {
              return {
                ...task,
                taskType: task.content.taskType
              };
            }
            
            return task;
          });
          
          // Add a utility function to determine task type from content
          function getTaskTypeFromContent(content) {
            if (!content) return 'regular';
            
            if (content.taskType) return content.taskType;
            if (content.isQuiz) return 'quiz';
            if (content.isApplication) return 'application';
            if (content.isVideo) return 'video';
            if (content.isReferral) return 'referral';
            if (content.isReading || content.readingTime > 0) return 'reading';
            
            return 'regular';
          }
          
          // Save the updated tasks array
          localStorage.setItem('customTasks', JSON.stringify(tasksToSave));
          console.log('Saved tasks to localStorage with content:', tasksToSave);
        } catch (e) {
          console.error('Error saving tasks to localStorage:', e);
        }
      }

      alert(`Task "${savedTask.title}" ${isNew ? 'created' : 'updated'} successfully!`);
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('An error occurred while saving the task.');
    }
  };

  // Function to handle deleting an item
  const handleDelete = (type: 'badge' | 'module' | 'certificate' | 'reward' | 'task', id: string) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    const deleted = mockDataHelpers.deleteItem(type, id);
    
    if (deleted) {
      // Also update localStorage to persist the deletion
      if (typeof window !== 'undefined') {
        try {
          switch (type) {
            case 'badge':
              localStorage.setItem('customBadges', JSON.stringify(badges));
              console.log('Updated badges in localStorage after deletion');
              break;
            case 'module':
              localStorage.setItem('customModules', JSON.stringify(modules));
              console.log('Updated modules in localStorage after deletion');
              break;
            case 'certificate':
              localStorage.setItem('customCertificates', JSON.stringify(certificates));
              console.log('Updated certificates in localStorage after deletion');
              break;
            case 'reward':
              localStorage.setItem('customRewards', JSON.stringify(rewards));
              console.log('Updated rewards in localStorage after deletion');
              break;
            case 'task':
              localStorage.setItem('customTasks', JSON.stringify(tasks));
              console.log('Updated tasks in localStorage after deletion');
              break;
          }
        } catch (e) {
          console.error('Error updating localStorage after deletion:', e);
        }
      }
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } else {
      alert(`Error deleting ${type}. Please try again.`);
    }
  };

  // Function to add a new quiz question
  const addQuizQuestion = () => {
    setTaskForm({
      ...taskForm,
      quizQuestions: [
        ...taskForm.quizQuestions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }
      ]
    });
  };
  
  // Function to update a quiz question
  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: string | string[] | number) => {
    const updatedQuestions = [...taskForm.quizQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setTaskForm({
      ...taskForm,
      quizQuestions: updatedQuestions
    });
  };
  
  // Function to remove a quiz question
  const removeQuizQuestion = (index: number) => {
    const updatedQuestions = [...taskForm.quizQuestions];
    updatedQuestions.splice(index, 1);
    
    setTaskForm({
      ...taskForm,
      quizQuestions: updatedQuestions
    });
  };
  
  // Function to add a new form field
  const addFormField = () => {
    const newId = `field_${Date.now()}`;
    setTaskForm({
      ...taskForm,
      formFields: [
        ...taskForm.formFields,
        {
          id: newId,
          label: '',
          type: 'text',
          required: false,
          options: []
        }
      ]
    });
  };
  
  // Function to update a form field
  const updateFormField = (index: number, field: keyof FormField, value: string | boolean | string[]) => {
    const updatedFields = [...taskForm.formFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value
    };
    
    // If changing type to something other than select, remove options
    if (field === 'type' && value !== 'select') {
      updatedFields[index].options = [];
    }
    
    // If changing to select and no options exist, add some defaults
    if (field === 'type' && value === 'select' && (!updatedFields[index].options || updatedFields[index].options.length === 0)) {
      updatedFields[index].options = ['Option 1', 'Option 2'];
    }
    
    setTaskForm({
      ...taskForm,
      formFields: updatedFields
    });
  };
  
  // Function to remove a form field
  const removeFormField = (index: number) => {
    const updatedFields = [...taskForm.formFields];
    updatedFields.splice(index, 1);
    
    setTaskForm({
      ...taskForm,
      formFields: updatedFields
    });
  };
  
  // Function to add an option to a select field
  const addSelectOption = (fieldIndex: number) => {
    const updatedFields = [...taskForm.formFields];
    const options = updatedFields[fieldIndex].options || [];
    updatedFields[fieldIndex].options = [...options, `Option ${options.length + 1}`];
    
    setTaskForm({
      ...taskForm,
      formFields: updatedFields
    });
  };
  
  // Function to update a select option
  const updateSelectOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...taskForm.formFields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    
    setTaskForm({
      ...taskForm,
      formFields: updatedFields
    });
  };
  
  // Function to remove a select option
  const removeSelectOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...taskForm.formFields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    
    setTaskForm({
      ...taskForm,
      formFields: updatedFields
    });
  };

  // Utility function to get Annual Leave Policies content
  const getAnnualLeavePoliciesContent = () => {
    return [
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
    ];
  };

  // Update handleEdit for task2
  const setupAnnualLeavePoliciesTask = () => {
    const task = tasks.find(t => t.id === 'task2');
    if (task) {
      console.log('Setting up Annual Leave Policies task for editing');
      setSelectedTask(task);
      setTaskForm({
        ...task,
        taskType: 'reading',
        readingTime: 40,
        isQuiz: false,
        isApplication: false,
        isVideo: false,
        isReferral: false,
        externalUrl: '',
        quizQuestions: [],
        formFields: [],
        emailRecipient: '',
        sections: getAnnualLeavePoliciesContent()
      });
      setShowTaskModal(true);
      
      // Manually store the content in sessionStorage for future retrieval
      const contentData = {
        title: task.title,
        taskType: 'reading',
        readingTime: 40,
        sections: getAnnualLeavePoliciesContent()
      };
      sessionStorage.setItem(`task_content_${task.id}`, JSON.stringify(contentData));
      localStorage.setItem('annual_leave_policies_content', JSON.stringify(contentData));
      
      console.log('Annual Leave Policies task loaded with sections:', getAnnualLeavePoliciesContent());
    }
  };

  // Function to handle task type change 
  const handleTaskTypeChange = (value: string) => {
    // Cast the value to the appropriate type
    const taskType = value as 'regular' | 'reading' | 'quiz' | 'application' | 'video' | 'referral';
    
    console.log(`Changing task type to: ${taskType}`);
    
    // Update the form with the new task type
    setTaskForm(prev => ({
      ...prev,
      taskType,
      // Reset type-specific fields to ensure clean state
      readingTime: taskType === 'reading' ? (prev.readingTime || 5) : 0,
      quizQuestions: taskType === 'quiz' ? prev.quizQuestions : [],
      externalUrl: taskType === 'application' || taskType === 'video' ? prev.externalUrl : '',
      videoDescription: taskType === 'video' ? prev.videoDescription : '',
      emailRecipient: taskType === 'referral' ? prev.emailRecipient : '',
      formFields: taskType === 'referral' ? prev.formFields : []
    }));
  };

  // New function to handle creation wizard selection
  const handleCreateFromWizard = (type: WizardItemType) => {
    handleCreate(type);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Top Admin Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setShowCreationWizard(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Single Item
          </button>
          <button
            onClick={() => setShowFlowWizard(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
            Create Learning Path
          </button>
        </div>
      </div>

      {/* Admin Help Card */}
      <div className="admin-help-card bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-800 mb-2">Creating Content Made Easy</h2>
        <p className="text-gray-700 mb-3">Welcome to the admin dashboard! Here you can create and manage all the content for your learning platform.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Single Item Creation
            </h3>
            <p className="text-sm text-gray-600">Create individual badges, modules, or tasks one at a time. This is perfect when you need to add one specific item.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h3 className="font-medium text-green-700 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
              </svg>
              Complete Learning Path
            </h3>
            <p className="text-sm text-gray-600">Create a full learning path in one go - badge, module, and task all connected. Perfect for building structured learning experiences.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <h3 className="font-medium text-orange-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <Link href="/admin/referrals" className="hover:underline">View Referrals</Link>
            </h3>
            <p className="text-sm text-gray-600">View and manage all form submissions from referral tasks. Export data to CSV or clear all entries.</p>
          </div>
        </div>
      </div>

      {/* The rest of your component... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Modules Management */}
        <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">1</div>
            <h2 className="text-xl font-semibold">Modules</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage modules - the foundational units for organizing related tasks</p>
          
          <div className="flex flex-col mb-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search modules..."
                value={moduleSearchQuery}
                onChange={(e) => setModuleSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {moduleSearchQuery && (
                <button
                  onClick={() => setModuleSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => handleCreate('module')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Create New Module
            </button>
          </div>
          
          <div className="divide-y">
            {filteredModules.length > 0 ? (
              filteredModules.map(module => (
                <div key={module.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.tasks.length} tasks • Badge: {
                      badges.find(b => b.id === module.badgeId)?.title || 'None'
                    }</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit('module', module.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('module', module.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No modules found matching "{moduleSearchQuery}"
              </div>
            )}
          </div>
        </section>
        
        {/* Tasks Management */}
        <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">2</div>
            <h2 className="text-xl font-semibold">Tasks</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage tasks for modules - the specific activities users will complete</p>
          
          <div className="flex flex-col mb-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {taskSearchQuery && (
                <button
                  onClick={() => setTaskSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => handleCreate('task')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Create New Task
            </button>
          </div>
          
          <div className="flex flex-wrap space-x-2 mt-2 mb-4">
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-gray-200 mr-1"></span>
              Regular
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-blue-200 mr-1"></span>
              Reading
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-indigo-200 mr-1"></span>
              Quiz
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-green-200 mr-1"></span>
              Application
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-yellow-200 mr-1"></span>
              Video
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-orange-200 mr-1"></span>
              Referral
            </div>
          </div>
          
          <div className="divide-y">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => {
                // Determine task type for display
                let taskTypeDisplay = 'Regular';
                let taskTypeBgColor = 'bg-gray-200';
                
                // Use the task's taskType property if available
                if (task.taskType) {
                  switch (task.taskType) {
                    case 'application':
                      taskTypeDisplay = 'Application';
                      taskTypeBgColor = 'bg-green-200';
                      break;
                    case 'reading':
                      taskTypeDisplay = 'Reading';
                      taskTypeBgColor = 'bg-blue-200';
                      break;
                    case 'quiz':
                      taskTypeDisplay = 'Quiz';
                      taskTypeBgColor = 'bg-indigo-200';
                      break;
                    case 'video':
                      taskTypeDisplay = 'Video';
                      taskTypeBgColor = 'bg-yellow-200';
                      break;
                    case 'referral':
                      taskTypeDisplay = 'Referral';
                      taskTypeBgColor = 'bg-orange-200';
                      break;
                    default:
                      taskTypeDisplay = 'Regular';
                      taskTypeBgColor = 'bg-gray-200';
                  }
                } 
                // Fallback to legacy pattern-based detection only if taskType is not available
                else if (task.id.includes('1') || task.id.includes('8')) {
                  taskTypeDisplay = 'Application';
                  taskTypeBgColor = 'bg-green-200';
                } else if (task.id.includes('2') || task.id.includes('4')) {
                  taskTypeDisplay = 'Reading';
                  taskTypeBgColor = 'bg-blue-200';
                } else if (task.id.includes('3')) {
                  taskTypeDisplay = 'Quiz';
                  taskTypeBgColor = 'bg-indigo-200';
                } else if (task.id.includes('5')) {
                  taskTypeDisplay = 'Video';
                  taskTypeBgColor = 'bg-yellow-200';
                } else if (task.id.includes('6')) {
                  taskTypeDisplay = 'Referral';
                  taskTypeBgColor = 'bg-orange-200';
                }
                
                // Also check content property which might contain taskType info
                if (task.content && task.content.taskType) {
                  switch (task.content.taskType) {
                    case 'application':
                      taskTypeDisplay = 'Application';
                      taskTypeBgColor = 'bg-green-200';
                      break;
                    case 'reading':
                      taskTypeDisplay = 'Reading';
                      taskTypeBgColor = 'bg-blue-200';
                      break;
                    case 'quiz':
                      taskTypeDisplay = 'Quiz';
                      taskTypeBgColor = 'bg-indigo-200';
                      break;
                    case 'video':
                      taskTypeDisplay = 'Video';
                      taskTypeBgColor = 'bg-yellow-200';
                      break;
                    case 'referral':
                      taskTypeDisplay = 'Referral';
                      taskTypeBgColor = 'bg-orange-200';
                      break;
                  }
                }
                // Alternative checks on content properties
                else if (task.content) {
                  if (task.content.isQuiz) {
                    taskTypeDisplay = 'Quiz';
                    taskTypeBgColor = 'bg-indigo-200';
                  } else if (task.content.isApplication) {
                    taskTypeDisplay = 'Application';
                    taskTypeBgColor = 'bg-green-200';
                  } else if (task.content.isVideo) {
                    taskTypeDisplay = 'Video';
                    taskTypeBgColor = 'bg-yellow-200';
                  } else if (task.content.isReferral) {
                    taskTypeDisplay = 'Referral';
                    taskTypeBgColor = 'bg-orange-200';
                  } else if (task.content.isReading || task.content.readingTime > 0) {
                    taskTypeDisplay = 'Reading';
                    taskTypeBgColor = 'bg-blue-200';
                  }
                }
                
                return (
                  <div key={task.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${taskTypeBgColor}`}>
                          {taskTypeDisplay}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {task.completed ? 'Completed' : 'Not completed'} • 
                        Module: {modules.find(m => m.id === task.moduleId)?.title || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit('task', task.id)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete('task', task.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-gray-500">
                No tasks found matching "{taskSearchQuery}"
              </div>
            )}
          </div>
        </section>
        
        {/* Badges Management */}
        <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">3</div>
            <h2 className="text-xl font-semibold">Badges</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage badges - earned when users complete required modules</p>
          
          <div className="flex flex-col mb-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search badges..."
                value={badgeSearchQuery}
                onChange={(e) => setBadgeSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {badgeSearchQuery && (
                <button
                  onClick={() => setBadgeSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => handleCreate('badge')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Create New Badge
            </button>
          </div>
          
          <div className="divide-y">
            {filteredBadges.length > 0 ? (
              filteredBadges.map(badge => (
                <div key={badge.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                      {badge.imageUrl && <img src={badge.imageUrl} alt={badge.title} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{badge.title}</h3>
                      <p className="text-sm text-gray-500">
                        {badge.points} points • Requires {badge.requiredToComplete.length} modules
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit('badge', badge.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('badge', badge.id)} 
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No badges found matching "{badgeSearchQuery}"
              </div>
            )}
          </div>
        </section>
        
        {/* Certificates Management */}
        <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">4</div>
            <h2 className="text-xl font-semibold">Certificates</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage certificates - awarded when users earn specific badges</p>
          
          <div className="flex flex-col mb-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search certificates..."
                value={certificateSearchQuery}
                onChange={(e) => setCertificateSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {certificateSearchQuery && (
                <button
                  onClick={() => setCertificateSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => handleCreate('certificate')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Create New Certificate
            </button>
          </div>
          
          <div className="divide-y">
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map(certificate => (
                <div key={certificate.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-gray-200 mr-3 overflow-hidden">
                      {certificate.imageUrl && <img src={certificate.imageUrl} alt={certificate.title} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{certificate.title}</h3>
                      <p className="text-sm text-gray-500">Requires badges: {
                        certificate.badgesRequired.map(badgeId => 
                          badges.find(b => b.id === badgeId)?.title
                        ).join(', ')
                      }</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit('certificate', certificate.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('certificate', certificate.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No certificates found matching "{certificateSearchQuery}"
              </div>
            )}
          </div>
        </section>
        
        {/* Rewards Management */}
        <section className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">5</div>
            <h2 className="text-xl font-semibold">Rewards</h2>
          </div>
          <p className="text-gray-600 mb-4">Create and manage rewards - incentives for users to earn specific badges</p>
          
          <div className="flex flex-col mb-4 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search rewards..."
                value={rewardSearchQuery}
                onChange={(e) => setRewardSearchQuery(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {rewardSearchQuery && (
                <button
                  onClick={() => setRewardSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => handleCreate('reward')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Create New Reward
            </button>
          </div>
          
          <div className="divide-y">
            {filteredRewards.length > 0 ? (
              filteredRewards.map(reward => (
                <div key={reward.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-gray-200 mr-3 overflow-hidden flex items-center justify-center">
                      {reward.imageUrl ? (
                        <img src={reward.imageUrl} alt={reward.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">{reward.type === 'badge' ? '🏅' : '🪙'}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{reward.title}</h3>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${reward.type === 'badge' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {reward.type === 'badge' ? 'Badge-based' : 'Point-based'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {reward.type === 'badge' 
                          ? `Requires: ${badges.find(b => b.id === reward.badgeRequired)?.title || 'Unknown Badge'}`
                          : `Cost: ${reward.pointCost} points`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit('reward', reward.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('reward', reward.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No rewards found matching "{rewardSearchQuery}"
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              {selectedBadge ? 'Edit Badge' : 'Create New Badge'}
            </h3>
            
            <div className="space-y-3">
              {/* Title and Points in one row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={badgeForm.title}
                    onChange={(e) => setBadgeForm({...badgeForm, title: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
          </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={badgeForm.points}
                    onChange={(e) => setBadgeForm({...badgeForm, points: parseInt(e.target.value) || 0})}
                    min="0"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  rows={2}
                ></textarea>
              </div>
              
              {/* Badge Appearance - Color and Icon */}
              <div className="grid grid-cols-2 gap-3">
                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={badgeForm.backgroundColor || '#7c3aed'}
                      onChange={(e) => setBadgeForm({...badgeForm, backgroundColor: e.target.value})}
                      className="w-8 h-8 rounded border border-gray-300 mr-2 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={badgeForm.backgroundColor || '#7c3aed'}
                      onChange={(e) => setBadgeForm({...badgeForm, backgroundColor: e.target.value})}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
                
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center mr-2 border border-gray-300"
                      style={{ backgroundColor: badgeForm.backgroundColor || '#7c3aed' }}
                    >
                      <span className="text-white text-lg">{badgeForm.icon || '📅'}</span>
                    </div>
                    <select
                      value={badgeForm.icon || '📅'}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="📅">📅 Calendar</option>
                      <option value="🚀">🚀 Rocket</option>
                      <option value="🏆">🏆 Trophy</option>
                      <option value="📊">📊 Chart</option>
                      <option value="👥">👥 Team</option>
                      <option value="🔰">🔰 Beginner</option>
                      <option value="🎯">🎯 Target</option>
                      <option value="💼">💼 Briefcase</option>
                      <option value="⭐">⭐ Star</option>
                      <option value="🌟">🌟 Sparkle</option>
                      <option value="📚">📚 Books</option>
                      <option value="💻">💻 Computer</option>
                      <option value="🔍">🔍 Search</option>
                      <option value="📝">📝 Note</option>
                      <option value="✨">✨ Sparkles</option>
                      <option value="🎓">🎓 Graduation</option>
                      <option value="🧠">🧠 Knowledge</option>
                      <option value="💡">💡 Idea</option>
                      <option value="🛠️">🛠️ Tools</option>
                      <option value="🔑">🔑 Key</option>
                      <option value="🌱">🌱 Growth</option>
                      <option value="🎨">🎨 Creative</option>
                      <option value="👩‍💻">👩‍💻 Developer</option>
                      <option value="👨‍💼">👨‍💼 Manager</option>
                      <option value="📱">📱 Mobile</option>
                      <option value="⚙️">⚙️ Settings</option>
                      <option value="📣">📣 Announcement</option>
                      <option value="🔒">🔒 Security</option>
                      <option value="🌐">🌐 Global</option>
                      <option value="📞">📞 Support</option>
                      <option value="👨‍🏫">👨‍🏫 Teacher</option>
                      <option value="🏅">🏅 Medal</option>
                      <option value="👑">👑 Crown</option>
                      <option value="🧩">🧩 Puzzle</option>
                      <option value="🔔">🔔 Notification</option>
                      <option value="⏱️">⏱️ Time</option>
                      <option value="🏋️">🏋️ Training</option>
                      <option value="📋">📋 Clipboard</option>
                      <option value="🌿">🌿 Wellness</option>
                      <option value="🗂️">🗂️ Organization</option>
                      <option value="💭">💭 Thinking</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Preview</label>
                <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: badgeForm.backgroundColor || '#7c3aed' }}
                  >
                    <span className="text-white text-3xl">{badgeForm.icon || '📅'}</span>
                  </div>
                </div>
              </div>

              {/* Required Modules */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Required Modules</label>
                  <span className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</span>
                </div>
                <select
                  multiple
                  value={badgeForm.requiredToComplete}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setBadgeForm({...badgeForm, requiredToComplete: selectedOptions});
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  size={3}
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Earned by default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={badgeForm.earned}
                  onChange={(e) => setBadgeForm({...badgeForm, earned: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Earned by default</label>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBadge}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedModule ? 'Edit Module' : 'Create New Module'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <select
                  value={moduleForm.badgeId}
                  onChange={(e) => setModuleForm({...moduleForm, badgeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {badges.map(badge => (
                    <option key={badge.id} value={badge.id}>{badge.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={moduleForm.completed}
                  onChange={(e) => setModuleForm({...moduleForm, completed: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Completed</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModuleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModule}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={taskForm.moduleId}
                  onChange={(e) => setTaskForm({...taskForm, moduleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'regular',
                        isQuiz: false,
                        isApplication: false,
                        isVideo: false,
                        isReferral: false,
                        readingTime: 0
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'regular' 
                        ? 'bg-gray-200 border-gray-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                    Regular
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'reading',
                        isQuiz: false,
                        isApplication: false,
                        isVideo: false,
                        isReferral: false,
                        readingTime: 30,
                        sections: taskForm.sections && taskForm.sections.length > 0 
                          ? taskForm.sections 
                          : [{ heading: "Content", content: "" }]
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'reading' 
                        ? 'bg-blue-100 border-blue-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                    Reading
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'quiz',
                        isQuiz: true,
                        isApplication: false,
                        isVideo: false,
                        isReferral: false,
                        readingTime: 0
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'quiz' 
                        ? 'bg-indigo-100 border-indigo-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-indigo-400 mr-2"></span>
                    Quiz
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'application',
                        isQuiz: false,
                        isApplication: true,
                        isVideo: false,
                        isReferral: false,
                        readingTime: 0
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'application' 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                    Application
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'video',
                        isQuiz: false,
                        isApplication: false,
                        isVideo: true,
                        isReferral: false,
                        readingTime: 0
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'video' 
                        ? 'bg-yellow-100 border-yellow-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                    Video
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm({
                        ...taskForm,
                        taskType: 'referral',
                        isQuiz: false,
                        isApplication: false,
                        isVideo: false,
                        isReferral: true,
                        readingTime: 0
                      });
                    }}
                    className={`px-3 py-2 border rounded-md text-sm flex items-center justify-center ${
                      taskForm.taskType === 'referral' 
                        ? 'bg-orange-100 border-orange-400' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                    Referral
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Select the task type to configure its specific completion requirements
                </p>
              </div>

              {/* Before the task specific UI, add task type specific info cards */}
              <div className={`mb-4 border rounded-md p-3 ${
                taskForm.taskType === 'regular' ? 'border-gray-200 bg-gray-50' :
                taskForm.taskType === 'reading' ? 'border-blue-200 bg-blue-50' :
                taskForm.taskType === 'quiz' ? 'border-indigo-200 bg-indigo-50' :
                taskForm.taskType === 'application' ? 'border-green-200 bg-green-50' :
                taskForm.taskType === 'video' ? 'border-yellow-200 bg-yellow-50' :
                'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {taskForm.taskType === 'regular' ? 'Regular Task' :
                       taskForm.taskType === 'reading' ? 'Reading Task' :
                       taskForm.taskType === 'quiz' ? 'Quiz Task' :
                       taskForm.taskType === 'application' ? 'Application Task' :
                       taskForm.taskType === 'video' ? 'Video Task' :
                       'Referral Form Task'}
                    </p>
                    <p>
                      {taskForm.taskType === 'regular' && 'Regular task can be completed by simply clicking "Mark as Complete" button.'}
                      {taskForm.taskType === 'reading' && 'Reading task requires the user to spend the specified reading time before it can be completed.'}
                      {taskForm.taskType === 'quiz' && 'Quiz task requires the user to answer all questions before it can be completed.'}
                      {taskForm.taskType === 'application' && 'Application task requires the user to click the external link before it can be completed.'}
                      {taskForm.taskType === 'video' && 'Video task requires the user to watch the entire video before it can be completed.'}
                      {taskForm.taskType === 'referral' && 'Referral form task requires the user to fill out and submit the form before it can be completed.'}
                    </p>
                  </div>
                </div>
              </div>

              {taskForm.taskType === 'reading' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={taskForm.readingTime}
                    onChange={(e) => setTaskForm({...taskForm, readingTime: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Task will auto-complete after this duration</p>
                  
                  {/* Section Content Editor */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">Content Sections</label>
                      <button
                        type="button"
                        onClick={() => {
                          // Initialize sections array if it doesn't exist
                          const currentSections = taskForm.sections || [];
                          setTaskForm({
                            ...taskForm,
                            sections: [
                              ...currentSections,
                              { heading: "", content: "" }
                            ]
                          });
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Section
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 mb-3">Create separate sections for your reading content. Each section will have a heading and content.</p>
                    
                    {(!taskForm.sections || taskForm.sections.length === 0) ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                          No content sections added yet. Add at least one section to provide content for this reading task.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {taskForm.sections.map((section, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-md p-4 bg-white">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-gray-800">Section {idx + 1}</h5>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSections = [...taskForm.sections];
                                  updatedSections.splice(idx, 1);
                                  setTaskForm({
                                    ...taskForm,
                                    sections: updatedSections
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                                disabled={taskForm.sections.length <= 1}
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Section Heading</label>
                              <input
                                type="text"
                                value={section.heading}
                                onChange={(e) => {
                                  const updatedSections = [...taskForm.sections];
                                  updatedSections[idx].heading = e.target.value;
                                  setTaskForm({
                                    ...taskForm,
                                    sections: updatedSections
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. Introduction, Key Concepts, etc."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Section Content</label>
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const updatedSections = [...taskForm.sections];
                                  updatedSections[idx].content = e.target.value;
                                  setTaskForm({
                                    ...taskForm,
                                    sections: updatedSections
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={5}
                                placeholder="Enter the content for this section..."
                              ></textarea>
                              <p className="text-xs text-gray-500 mt-1">
                                Use paragraph breaks to organize your content. 
                                This content will be displayed in the reading task.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(taskForm.taskType === 'application' || taskForm.taskType === 'video') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {taskForm.taskType === 'application' ? 'External URL' : 'Video URL (YouTube)'}
                  </label>
                  <input
                    type="text"
                    value={taskForm.externalUrl || ''}
                    onChange={(e) => setTaskForm({...taskForm, externalUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={taskForm.taskType === 'application' ? 'https://example.com' : 'https://youtube.com/embed/VIDEO_ID'}
                  />
                  {taskForm.taskType === 'video' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video Description
                      </label>
                      <textarea
                        value={taskForm.videoDescription || ''}
                        onChange={(e) => setTaskForm({...taskForm, videoDescription: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Enter a description for this video..."
                      ></textarea>
                      
                      {taskForm.externalUrl && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Preview
                          </label>
                          <div className="aspect-video w-full bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              src={taskForm.externalUrl}
                              title="Video preview" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowFullScreen
                            ></iframe>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Ensure you're using an embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {taskForm.taskType === 'quiz' && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-3">Quiz Questions</h4>
                  
                  {taskForm.quizQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-3">No questions added yet. Add your first question below.</p>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {taskForm.quizQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="p-3 bg-white border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">Question {qIndex + 1}</h5>
                            <button 
                              type="button" 
                              onClick={() => removeQuizQuestion(qIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="Enter question text"
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`correct_${qIndex}`}
                                    checked={question.correctAnswer === oIndex}
                                    onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                                    className="mr-2"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[oIndex] = e.target.value;
                                      updateQuizQuestion(qIndex, 'options', newOptions);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                            <textarea
                              value={question.explanation}
                              onChange={(e) => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows={2}
                              placeholder="Explain why this is the correct answer"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">This will be shown when a user selects the wrong answer</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={addQuizQuestion}
                    className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                  >
                    + Add Question
                  </button>
                </div>
              )}

              {taskForm.taskType === 'referral' && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-3">Referral Form Configuration</h4>
          
          <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipient</label>
                    <input
                      type="email"
                      value={taskForm.emailRecipient || ''}
                      onChange={(e) => setTaskForm({...taskForm, emailRecipient: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="recipient@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Form submissions will be sent to this email address</p>
                  </div>
                  
                  <h5 className="font-medium text-gray-700 mb-2">Default Form Fields</h5>
                  <div className="p-3 bg-white border border-gray-200 rounded-md mb-4">
                    <p className="text-sm text-gray-600 mb-2">The referral form will include these standard fields:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        First Name (required)
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Last Name (required)
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Work Email (required)
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Department (required)
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Personal Message (optional)
                      </li>
                    </ul>
                  </div>
                  
                  <h5 className="font-medium text-gray-700 mb-2">Additional Form Fields</h5>
                  
                  {taskForm.formFields.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-3">No additional fields added yet. Add custom fields below.</p>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {taskForm.formFields.map((field, fIndex) => (
                        <div key={field.id} className="p-3 bg-white border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">Additional Field {fIndex + 1}</h5>
            <button 
                              type="button" 
                              onClick={() => removeFormField(fIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
            >
                              Remove
            </button>
          </div>
          
                          <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateFormField(fIndex, 'label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. Job Title"
                              />
                </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateFormField(fIndex, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="select">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(fIndex, 'required', e.target.checked)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                            />
                            <label className="text-sm text-gray-700">Required field</label>
                          </div>
                          
                          {field.type === 'select' && field.options && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Dropdown Options</label>
                              <div className="space-y-2 mb-2">
                                {field.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateSelectOption(fIndex, oIndex, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                      placeholder={`Option ${oIndex + 1}`}
                                    />
                  <button 
                                      type="button"
                                      onClick={() => removeSelectOption(fIndex, oIndex)}
                                      className="ml-2 text-red-500 hover:text-red-700"
                                      disabled={field.options.length <= 1}
                                    >
                                      &times;
                  </button>
                                  </div>
                                ))}
                              </div>
                  <button 
                                type="button"
                                onClick={() => addSelectOption(fIndex)}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={addFormField}
                    className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                  >
                    + Add Custom Field
                  </button>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={taskForm.completed}
                  onChange={(e) => setTaskForm({...taskForm, completed: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Completed</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedCertificate ? 'Edit Certificate' : 'Create New Certificate'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={certificateForm.title}
                  onChange={(e) => setCertificateForm({...certificateForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={certificateForm.description}
                  onChange={(e) => setCertificateForm({...certificateForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={certificateForm.imageUrl}
                  onChange={(e) => setCertificateForm({...certificateForm, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Badges</label>
                <select
                  multiple
                  value={certificateForm.badgesRequired}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setCertificateForm({...certificateForm, badgesRequired: selectedOptions});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {badges.map(badge => (
                    <option key={badge.id} value={badge.id}>{badge.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={certificateForm.earned}
                  onChange={(e) => setCertificateForm({...certificateForm, earned: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Earned by default</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCertificate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              {selectedReward ? 'Edit Reward' : 'Create New Reward'}
            </h3>
            
            <div className="space-y-4">
              {/* Row for title and type */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={rewardForm.title}
                    onChange={(e) => setRewardForm({...rewardForm, title: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Enter reward title"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) => setRewardForm({...rewardForm, type: e.target.value as 'badge' | 'point'})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="badge">Badge-based</option>
                    <option value="point">Point-based</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the reward"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={rewardForm.imageUrl || ''}
                  onChange={(e) => setRewardForm({...rewardForm, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {/* Requirements section with slightly larger styling */}
              <div className={`p-4 border rounded-md ${
                rewardForm.type === 'badge' 
                  ? 'border-indigo-100 bg-indigo-50' 
                  : 'border-yellow-100 bg-yellow-50'
              }`}>
                <div className="flex items-center mb-3">
                  {rewardForm.type === 'badge' ? (
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {rewardForm.type === 'badge' ? 'Badge Requirement' : 'Point Requirement'}
                  </span>
                </div>
                
                {rewardForm.type === 'badge' ? (
                  <select
                    value={rewardForm.badgeRequired}
                    onChange={(e) => setRewardForm({...rewardForm, badgeRequired: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    {badges.map(badge => (
                      <option key={badge.id} value={badge.id}>{badge.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center">
                    <input
                      type="number"
                    min="1"
                      value={rewardForm.pointCost || 100}
                      onChange={(e) => setRewardForm({...rewardForm, pointCost: parseInt(e.target.value) || 0})}
                      className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                    <span className="ml-3 text-sm text-gray-600">points required</span>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {rewardForm.type === 'badge' 
                    ? 'User must earn this badge to claim the reward' 
                    : 'User must have this many points to claim the reward'}
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="claimed-checkbox"
                  checked={rewardForm.claimed}
                  onChange={(e) => setRewardForm({...rewardForm, claimed: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="claimed-checkbox" className="ml-2 block text-sm text-gray-700">Claimed by default</label>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={() => setShowRewardModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReward}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Wizard Modal */}
      {showCreationWizard && (
        <CreationWizard
          onCreateItem={handleCreateFromWizard}
          onClose={() => setShowCreationWizard(false)}
        />
      )}

      {/* Flow Wizard Modal */}
      {showFlowWizard && (
        <CreationFlowWizard
          onSaveBadge={(badgeData) => {
            const isNew = !badgeData.id;
            const newBadge = mockDataHelpers.saveBadge(badgeData as Badge, isNew);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('customBadges', JSON.stringify(badges));
                console.log('Saved badges to localStorage:', badges);
              } catch (e) {
                console.error('Error saving to localStorage:', e);
              }
            }
            
            return newBadge;
          }}
          onSaveModule={(moduleData) => {
            const isNew = !moduleData.id;
            const newModule = mockDataHelpers.saveModule(moduleData as Module, isNew);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('customModules', JSON.stringify(modules));
                console.log('Saved modules to localStorage:', modules);
              } catch (e) {
                console.error('Error saving to localStorage:', e);
              }
            }
            
            return newModule;
          }}
          onSaveTask={(taskData) => {
            const isNew = !taskData.id;
            const newTask = mockDataHelpers.saveTask(taskData as Task, isNew);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('customTasks', JSON.stringify(tasks));
                console.log('Saved tasks to localStorage:', tasks);
              } catch (e) {
                console.error('Error saving to localStorage:', e);
              }
            }
            
            return newTask;
          }}
          onClose={() => setShowFlowWizard(false)}
          badges={badges}
          modules={modules}
        />
      )}
    </main>
  );
} 