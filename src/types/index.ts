export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  moduleId: string;
  taskType?: 'regular' | 'reading' | 'quiz' | 'application' | 'video' | 'referral';
  content?: TaskContent;
  externalUrl?: string; // URL for application tasks
}

export interface TaskContent {
  title: string;
  taskType: 'regular' | 'reading' | 'quiz' | 'application' | 'video' | 'referral';
  readingTime?: number;
  isQuiz?: boolean;
  isApplication?: boolean;
  isVideo?: boolean;
  isReferral?: boolean;
  isReading?: boolean;
  externalUrl?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  sections?: TaskSection[];
  emailRecipient?: string;
  additionalFields?: FormField[];
  content?: string;
  videoDescription?: string;
}

export interface TaskSection {
  heading: string;
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  completed: boolean;
  badgeId: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  modules: Module[];
  earned: boolean;
  points: number; // Points awarded for earning this badge
  requiredToComplete: string[]; // Module IDs required to complete
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badgesRequired: string[]; // Badge IDs required for this certificate
  earned: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  badgeRequired: string; // Badge ID required for this reward
  claimed: boolean;
  type?: 'badge' | 'point'; // Type of reward - badge-based or point-based
  pointCost?: number; // Cost in points for point-based rewards
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  badges: Badge[];
  certificates: Certificate[];
  rewards: Reward[];
  currentModule?: Module;
} 