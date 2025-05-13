import { Badge, Certificate, Module, Reward, Task, User } from '../types';

// Tasks
export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Start Leave Management',
    description: 'Access the Kolay Leave Management System',
    completed: false,
    moduleId: 'module1',
    taskType: 'application',
  },
  {
    id: 'task2',
    title: 'Annual Leave Policies',
    description: 'Learn about company leave policies',
    completed: false,
    moduleId: 'module1',
    taskType: 'reading',
    content: {
      title: "Annual Leave Policies",
      taskType: 'reading',
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
    }
  },
  {
    id: 'task3',
    title: 'Sick Leave Procedures Quiz',
    description: 'Test your knowledge of sick leave procedures',
    completed: false,
    moduleId: 'module1',
    taskType: 'quiz',
  },
  {
    id: 'task4',
    title: 'Start Advanced Leave Management',
    description: 'Begin advanced leave management module',
    completed: false,
    moduleId: 'module2'
  },
  {
    id: 'task5',
    title: 'Leave Approval Workflows',
    description: 'Learn how to manage leave approval workflows',
    completed: false,
    moduleId: 'module2'
  },
  {
    id: 'task6',
    title: 'Leave Calendar Integration',
    description: 'Set up team leave calendars and integrations',
    completed: false,
    moduleId: 'module2',
    taskType: 'referral'
  },
  {
    id: 'task7',
    title: 'Start Onboarding',
    description: 'Begin learning about employee onboarding',
    completed: false,
    moduleId: 'module3'
  },
  {
    id: 'task8',
    title: 'Onboarding Checklist',
    description: 'Create comprehensive onboarding checklists',
    completed: false,
    moduleId: 'module3'
  },
  {
    id: 'task9',
    title: 'First Day Procedures',
    description: 'Learn best practices for employee first day',
    completed: false,
    moduleId: 'module3'
  },
  // New tasks for Remote Work Management badge
  {
    id: 'task10',
    title: 'Remote Work Essentials',
    description: 'Learn the fundamentals of managing remote teams',
    completed: false,
    moduleId: 'module4'
  },
  {
    id: 'task11',
    title: 'Remote Productivity Tools',
    description: 'Master the key tools for remote team productivity',
    completed: false,
    moduleId: 'module4'
  },
  {
    id: 'task12',
    title: 'Remote Team Communication',
    description: 'Establish effective communication practices for remote teams',
    completed: false,
    moduleId: 'module4'
  }
];

// Modules
export const modules: Module[] = [
  {
    id: 'module1',
    title: 'Leave Fundamentals',
    description: 'Basic leave management processes',
    tasks: [],
    completed: false,
    badgeId: 'badge1',
  },
  {
    id: 'module2',
    title: 'Advanced Leave Management',
    description: 'Master advanced leave concepts and procedures',
    tasks: tasks.filter(task => task.moduleId === 'module2'),
    completed: false,
    badgeId: 'badge1'
  },
  {
    id: 'module3',
    title: 'Onboarding Essentials',
    description: 'Learn the essentials of employee onboarding',
    tasks: tasks.filter(task => task.moduleId === 'module3'),
    completed: false,
    badgeId: 'badge2'
  },
  // New module for Remote Work Management badge
  {
    id: 'module4',
    title: 'Remote Work Mastery',
    description: 'Master the essentials of remote work management',
    tasks: tasks.filter(task => task.moduleId === 'module4'),
    completed: false,
    badgeId: 'badge3'
  }
];

// Badges
export const badges: Badge[] = [
  {
    id: 'badge1',
    title: 'Leave Management Beginner',
    description: 'Completed leave management basics',
    imageUrl: '/badges/png/leave-management.svg',
    modules: [],
    earned: false,
    points: 100,
    requiredToComplete: ['module1']
  },
  {
    id: 'badge2',
    title: 'Onboarding Expert',
    description: 'Expert in employee onboarding procedures',
    imageUrl: '/badges/png/onboarding-expert.svg',
    modules: modules.filter(module => module.badgeId === 'badge2'),
    earned: false,
    points: 150,
    requiredToComplete: ['module3']
  },
  // New badge for Remote Work Management
  {
    id: 'badge3',
    title: 'Remote Work Manager',
    description: 'Expert in managing remote teams effectively',
    imageUrl: '/badges/png/remote-work.svg',
    modules: modules.filter(module => module.badgeId === 'badge3'),
    earned: false,
    points: 200,
    requiredToComplete: ['module4']
  }
];

// Certificates
export const certificates: Certificate[] = [
  {
    id: 'cert1',
    title: 'HR Process Mastery',
    description: 'You have mastered key HR processes',
    imageUrl: '/certificates/mastery.svg',
    badgesRequired: ['badge1', 'badge2'],
    earned: false
  },
  // New certificate for Digital Workplace Mastery
  {
    id: 'cert2',
    title: 'Digital Workplace Mastery',
    description: 'You have mastered modern digital workplace management',
    imageUrl: '/certificates/digital.svg',
    badgesRequired: ['badge2', 'badge3'],
    earned: false
  }
];

// Rewards
export const rewards: Reward[] = [
  {
    id: 'reward1',
    title: 'HR Tools Suite',
    description: 'Access to premium HR tools',
    badgeRequired: 'badge1',
    claimed: false,
    type: 'badge'
  },
  {
    id: 'reward2',
    title: 'HR Strategy Workshop',
    description: 'Access to exclusive HR strategy workshop',
    badgeRequired: 'badge2',
    claimed: false,
    type: 'badge'
  },
  // New reward for Remote Work Manager badge
  {
    id: 'reward3',
    title: 'Remote Team Building Workshop',
    description: 'Access to premium remote team building workshop and toolkit',
    badgeRequired: 'badge3',
    claimed: false,
    type: 'badge'
  },
  // Point rewards
  {
    id: 'point_reward1',
    title: 'HR Tools Suite Premium',
    description: 'Access to premium HR tools with advanced features for leave management and employee tracking',
    badgeRequired: 'badge1', // This is needed for the data structure, but won't be used for point rewards
    pointCost: 500,
    claimed: false,
    type: 'point'
  },
  {
    id: 'point_reward2',
    title: 'LinkedIn Learning Subscription',
    description: 'One month free subscription to LinkedIn Learning for HR professionals',
    badgeRequired: 'badge1',
    pointCost: 300,
    claimed: false,
    type: 'point'
  },
  {
    id: 'point_reward3',
    title: 'Virtual Team-Building Event',
    description: 'Access to a professionally facilitated virtual team-building event for your team',
    badgeRequired: 'badge1',
    pointCost: 750,
    claimed: false,
    type: 'point'
  },
  {
    id: 'point_reward4',
    title: 'HR Certification Exam Voucher',
    description: 'Voucher covering the cost of a professional HR certification exam',
    badgeRequired: 'badge1',
    pointCost: 1000,
    claimed: false,
    type: 'point'
  }
];

// User
export const currentUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  badges: [],
  certificates: [],
  rewards: [],
  currentModule: modules[0]
};

// Initialize modules with tasks
modules.forEach(module => {
  module.tasks = tasks.filter(task => task.moduleId === module.id);
});

// Initialize badges with modules
badges.forEach(badge => {
  badge.modules = modules.filter(module => module.badgeId === badge.id);
});

// Initialize user with data
currentUser.badges = [...badges];
currentUser.certificates = [...certificates];
currentUser.rewards = [...rewards];

// Save content to localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    // Save Annual Leave Policies content to localStorage
    const annualLeavePoliciesContent = {
      title: "Annual Leave Policies",
      readingTime: 40,
      sections: tasks.find(t => t.id === 'task2')?.content?.sections || []
    };
    localStorage.setItem('annual_leave_policies_content', JSON.stringify(annualLeavePoliciesContent));

    // Set up task content in sessionStorage
    tasks.forEach(task => {
      if (task.content) {
        sessionStorage.setItem(`task_content_${task.id}`, JSON.stringify(task.content));
      }
    });
  } catch (e) {
    console.error('Error saving task content to storage:', e);
  }
}

// Helper functions for managing mock data
export const mockDataHelpers = {
  // Add a new badge or update an existing one
  saveBadge: (badge: Badge, isNew: boolean = false): Badge => {
    if (isNew) {
      // Generate a new ID if not provided
      if (!badge.id) {
        badge.id = `badge${badges.length + 1}`;
      }
      badges.push(badge);
      return badge;
    } else {
      // Update existing badge
      const index = badges.findIndex(b => b.id === badge.id);
      if (index !== -1) {
        badges[index] = { ...badges[index], ...badge };
        return badges[index];
      }
      return badge;
    }
  },

  // Add a new module or update an existing one
  saveModule: (module: Module, isNew: boolean = false): Module => {
    if (isNew) {
      if (!module.id) {
        module.id = `module${modules.length + 1}`;
      }
      // Ensure tasks array exists
      if (!module.tasks) {
        module.tasks = [];
      }
      modules.push(module);
      return module;
    } else {
      const index = modules.findIndex(m => m.id === module.id);
      if (index !== -1) {
        // Preserve the existing tasks array unless specifically updated
        if (!module.tasks) {
          module.tasks = modules[index].tasks;
        }
        modules[index] = { ...modules[index], ...module };
        return modules[index];
      }
      return module;
    }
  },

  // Add a new task or update an existing one
  saveTask: (task: Task, isNew: boolean = false): Task => {
    if (isNew) {
      if (!task.id) {
        task.id = `task${tasks.length + 1}`;
      }
      // Make sure content exists
      if (!task.content) {
        task.content = {
          title: task.title || "Task Content",
          taskType: task.taskType || "regular",
          sections: []
        };
      }
      tasks.push(task);
      
      // Add this task to its module's tasks array
      if (task.moduleId) {
        const moduleIndex = modules.findIndex(m => m.id === task.moduleId);
        if (moduleIndex !== -1) {
          if (!modules[moduleIndex].tasks) {
            modules[moduleIndex].tasks = [];
          }
          modules[moduleIndex].tasks.push(task);
        }
      }
      
      return task;
    } else {
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        // Preserve content unless specifically updated
        if (!task.content) {
          task.content = tasks[index].content;
        }
        tasks[index] = { ...tasks[index], ...task };
        
        // Update this task in its module's tasks array
        if (task.moduleId) {
          const moduleIndex = modules.findIndex(m => m.id === task.moduleId);
          if (moduleIndex !== -1) {
            if (!modules[moduleIndex].tasks) {
              modules[moduleIndex].tasks = [];
            }
            const taskIndex = modules[moduleIndex].tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
              modules[moduleIndex].tasks[taskIndex] = tasks[index];
            } else {
              modules[moduleIndex].tasks.push(tasks[index]);
            }
          }
        }
        
        return tasks[index];
      }
      return task;
    }
  },

  // Add a new certificate or update an existing one
  saveCertificate: (certificate: Certificate, isNew: boolean = false): Certificate => {
    if (isNew) {
      if (!certificate.id) {
        certificate.id = `cert${certificates.length + 1}`;
      }
      certificates.push(certificate);
      return certificate;
    } else {
      const index = certificates.findIndex(c => c.id === certificate.id);
      if (index !== -1) {
        certificates[index] = { ...certificates[index], ...certificate };
        return certificates[index];
      }
      return certificate;
    }
  },

  // Add a new reward or update an existing one
  saveReward: (reward: Reward, isNew: boolean = false): Reward => {
    if (isNew) {
      if (!reward.id) {
        reward.id = `reward${rewards.length + 1}`;
      }
      rewards.push(reward);
      return reward;
    } else {
      const index = rewards.findIndex(r => r.id === reward.id);
      if (index !== -1) {
        rewards[index] = { ...rewards[index], ...reward };
        return rewards[index];
      }
      return reward;
    }
  },

  // Delete an item
  deleteItem: (type: 'badge' | 'module' | 'certificate' | 'reward' | 'task', id: string): boolean => {
    switch (type) {
      case 'badge':
        const badgeIndex = badges.findIndex(b => b.id === id);
        if (badgeIndex !== -1) {
          badges.splice(badgeIndex, 1);
          return true;
        }
        break;
      case 'module':
        const moduleIndex = modules.findIndex(m => m.id === id);
        if (moduleIndex !== -1) {
          modules.splice(moduleIndex, 1);
          return true;
        }
        break;
      case 'task':
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          const task = tasks[taskIndex];
          
          // Also remove from the module's tasks array
          const moduleIndex = modules.findIndex(m => m.id === task.moduleId);
          if (moduleIndex !== -1 && modules[moduleIndex].tasks) {
            modules[moduleIndex].tasks = modules[moduleIndex].tasks.filter(t => t.id !== id);
          }
          
          tasks.splice(taskIndex, 1);
          return true;
        }
        break;
      case 'certificate':
        const certIndex = certificates.findIndex(c => c.id === id);
        if (certIndex !== -1) {
          certificates.splice(certIndex, 1);
          return true;
        }
        break;
      case 'reward':
        const rewardIndex = rewards.findIndex(r => r.id === id);
        if (rewardIndex !== -1) {
          rewards.splice(rewardIndex, 1);
          return true;
        }
        break;
    }
    return false;
  }
}; 