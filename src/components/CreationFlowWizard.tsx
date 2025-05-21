'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Module, Task, Concept } from '../types';
import CreationGuidanceTip from './CreationGuidanceTip';

interface ExtendedBadge extends Partial<Badge> {
  conceptId?: string;
  newConcept?: string;
}

interface CreationFlowWizardProps {
  onSaveBadge: (badge: ExtendedBadge) => Partial<Badge> | undefined;
  onSaveModule: (module: Partial<Module>) => Partial<Module> | undefined;
  onSaveTask: (task: Partial<Task>) => Task;
  onClose: () => void;
  badges: Badge[];
  modules: Module[];
  concepts?: Concept[];
}

const CreationFlowWizard: React.FC<CreationFlowWizardProps> = ({
  onSaveBadge,
  onSaveModule,
  onSaveTask,
  onClose,
  badges,
  modules,
  concepts = []
}) => {
  const [step, setStep] = useState(1);
  const [badge, setBadge] = useState<ExtendedBadge>({
    title: '',
    description: '',
    imageUrl: '',
    earned: false,
    points: 0,
    requiredToComplete: [],
    backgroundColor: '#7c3aed',
    icon: '📅',
    conceptId: '',
    newConcept: ''
  });
  
  const [module, setModule] = useState<Partial<Module>>({
    title: '',
    description: '',
    completed: false,
    badgeId: ''
  });
  
  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    completed: false,
    moduleId: ''
  });

  // Track created items directly with their full object, not just IDs
  const [createdBadge, setCreatedBadge] = useState<Badge | null>(null);
  const [createdModule, setCreatedModule] = useState<Module | null>(null);
  
  const [localBadges, setLocalBadges] = useState<Badge[]>(badges);
  const [localModules, setLocalModules] = useState<Module[]>(modules);
  
  // Update local arrays when props change
  useEffect(() => {
    setLocalBadges(badges);
  }, [badges]);
  
  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  // Determine if we can proceed to the next step
  const canProceed = () => {
    switch (step) {
      case 1: // Badge step
        return badge.title && badge.description;
      case 2: // Module step
        return module.title && module.description && module.badgeId;
      case 3: // Task step
        return task.title && task.description && task.moduleId;
      default:
        return false;
    }
  };

  // Handle badge save and creation
  const handleSaveBadge = () => {
    // Process concept if needed
    let conceptToSave = badge.conceptId;
    
    if (badge.newConcept && badge.newConcept.trim() !== '') {
      // Pass the concept through for creation (this would be handled by the parent)
      conceptToSave = badge.newConcept.trim();
    }
    
    // Initialize requiredToComplete array if needed
    const badgeToSave = {
      ...badge,
      concept: conceptToSave || undefined,
      requiredToComplete: []  // Initialize empty array for now
    };
    
    const savedBadge = onSaveBadge(badgeToSave);
    
    if (savedBadge && typeof savedBadge === 'object' && 'id' in savedBadge) {
      // Store the complete badge object
      const newBadge = savedBadge as Badge;
      
      // Update module with correct badge ID
      setModule({
        ...module,
        badgeId: newBadge.id
      });
      
      // Store created badge as complete object
      setCreatedBadge(newBadge);
      
      // Add to local badge list if not present
      if (!localBadges.some(b => b.id === newBadge.id)) {
        setLocalBadges(prev => [...prev, newBadge]);
      }
      
      // Move to next step
      setStep(2);
    }
  };

  // Handle module save and creation
  const handleSaveModule = () => {
    // Ensure we have the correct badge ID from either state or created badge
    const moduleToSave = {
      ...module,
      badgeId: createdBadge?.id || module.badgeId,
      tasks: [] // Initialize empty tasks array
    };
    
    const savedModule = onSaveModule(moduleToSave);
    if (savedModule && typeof savedModule === 'object' && 'id' in savedModule) {
      // Store the complete module object
      const newModule = savedModule as Module;
      
      // Update task with correct module ID
      setTask({
        ...task,
        moduleId: newModule.id
      });
      
      // Store created module as complete object
      setCreatedModule(newModule);
      
      // Add to local module list if not present
      if (!localModules.some(m => m.id === newModule.id)) {
        setLocalModules(prev => [...prev, newModule]);
      }
      
      // Update the badge's requiredToComplete array to include this module
      if (createdBadge) {
        // Create a copy of the badge with updated requiredToComplete
        const updatedBadge = {
          ...createdBadge,
          requiredToComplete: [...(createdBadge.requiredToComplete || []), newModule.id]
        };
        
        // Save the updated badge to persist the changes
        onSaveBadge(updatedBadge);
        
        // Update local state
        setCreatedBadge(updatedBadge);
        
        // Update in local badges array
        setLocalBadges(prev => 
          prev.map(b => b.id === updatedBadge.id ? updatedBadge : b)
        );
      }
      
      // Move to next step
      setStep(3);
    }
  };

  // Handle task save and creation
  const handleSaveTask = () => {
    // Make sure we have the correct module ID
    const moduleId = createdModule?.id || module.id;
    
    // Ensure we have the correct module ID from either state or created module
    const taskToSave = {
      ...task,
      moduleId: moduleId,
      // Make sure this task has valid taskType and content
      taskType: task.taskType || 'regular',
      content: {
        title: task.title || '',
        taskType: task.taskType || 'regular',
        sections: []
      }
    };
    
    // Call the parent handler to save the task
    const savedTask = onSaveTask(taskToSave) as Task;
    
    console.log("Task saved successfully:", savedTask);
    
    // Complete the wizard
    onClose();
  };

  // Handle the "Next" button click
  const handleNext = () => {
    if (step === 1) {
      handleSaveBadge();
    } else if (step === 2) {
      handleSaveModule();
    } else if (step === 3) {
      handleSaveTask();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create Learning Path</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${step === stepNum ? 'bg-indigo-600 text-white' : 
                      step > stepNum ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {step > stepNum ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <div className="text-sm mt-2 font-medium text-gray-600">
                  {stepNum === 1 ? 'Badge' : stepNum === 2 ? 'Module' : 'Task'}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-3">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-between">
              <div className={`w-1/3 ${step >= 2 ? 'border-t-2 border-indigo-600' : ''}`}></div>
              <div className={`w-1/3 ${step >= 3 ? 'border-t-2 border-indigo-600' : ''}`}></div>
            </div>
          </div>
        </div>

        {/* Step 1: Badge Creation */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Create a Badge</h3>
            <p className="text-gray-600">Badges are earned by completing modules. Define your badge first.</p>
            
            <CreationGuidanceTip
              title="Badge Creation Tips"
              description="Badges are visual rewards that learners earn by completing modules."
              tips={[
                "Choose a meaningful title that reflects the skill or knowledge gained",
                "Set points to reward learners appropriately for their achievement",
                "Select an icon that visually represents the badge's meaning",
                "Choose a background color that matches your brand or the badge's theme"
              ]}
            />
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={badge.title}
                  onChange={(e) => setBadge({...badge, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., HR Fundamentals Badge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={badge.points}
                  onChange={(e) => setBadge({...badge, points: parseInt(e.target.value) || 0})}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={badge.description}
                onChange={(e) => setBadge({...badge, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Describe what this badge represents"
              ></textarea>
            </div>
            
            {/* Concept Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concept</label>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <select
                    value={badge.conceptId || ''}
                    onChange={(e) => setBadge({...badge, conceptId: e.target.value, newConcept: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select Concept --</option>
                    {concepts.map(concept => (
                      <option key={concept.id} value={concept.id}>{concept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => setBadge({...badge, conceptId: '', newConcept: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">Or add a new concept:</label>
                <input
                  type="text"
                  value={badge.newConcept || ''}
                  onChange={(e) => setBadge({...badge, newConcept: e.target.value, conceptId: ''})}
                  placeholder="Enter new concept name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select
                  value={badge.icon}
                  onChange={(e) => setBadge({...badge, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {['📅', '🏆', '🎓', '🚀', '💼', '📚', '🔧', '🧩', '⭐'].map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={badge.backgroundColor}
                  onChange={(e) => setBadge({...badge, backgroundColor: e.target.value})}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Preview</label>
              <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: badge.backgroundColor || '#7c3aed' }}
                >
                  <span className="text-white text-3xl">{badge.icon || '📅'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Module Creation */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Create a Module</h3>
            <p className="text-gray-600">Modules are collections of tasks that learners complete to earn a badge.</p>
            
            <CreationGuidanceTip
              title="Module Creation Tips"
              description="Modules organize related tasks into meaningful learning units."
              tips={[
                "Choose a clear title that describes what learners will achieve",
                "Write a description that outlines the key learning objectives",
                "Keep modules focused on a specific skill or knowledge area",
                "Consider the logical order of tasks within the module"
              ]}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={module.title}
                onChange={(e) => setModule({...module, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Leave Management Basics"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={module.description}
                onChange={(e) => setModule({...module, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Describe what learners will learn in this module"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              {createdBadge ? (
                <div className="flex items-center">
                  <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {createdBadge.title} {/* Use direct reference to created badge */}
                  </div>
                  <div className="ml-2 text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <select
                  value={module.badgeId}
                  onChange={(e) => setModule({...module, badgeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select Badge --</option>
                  {localBadges.map(badgeItem => (
                    <option key={badgeItem.id} value={badgeItem.id}>{badgeItem.title}</option>
                  ))}
                </select>
              )}
              {createdBadge && (
                <p className="text-xs text-indigo-600 mt-1">This module will be part of the badge "{createdBadge.title}" you just created.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Task Creation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Create a Task</h3>
            <p className="text-gray-600">Tasks are activities that learners complete within a module.</p>
            
            <CreationGuidanceTip
              title="Task Creation Tips"
              description="Tasks are the building blocks of your learning content."
              tips={[
                "Write clear, action-oriented task titles",
                "Provide detailed instructions in the description",
                "Consider creating different types of tasks (reading, quiz, etc.) for variety",
                "Ensure tasks build on each other in a logical progression"
              ]}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask({...task, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Introduction to Leave Policies"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={task.description}
                onChange={(e) => setTask({...task, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Describe what this task involves"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              {createdModule ? (
                <div className="flex items-center">
                  <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {createdModule.title} {/* Use direct reference to created module */}
                  </div>
                  <div className="ml-2 text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <select
                  value={task.moduleId}
                  onChange={(e) => setTask({...task, moduleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select Module --</option>
                  {localModules.map(moduleItem => (
                    <option key={moduleItem.id} value={moduleItem.id}>{moduleItem.title}</option>
                  ))}
                </select>
              )}
              {createdModule && (
                <p className="text-xs text-indigo-600 mt-1">This task will be part of the module "{createdModule.title}" you just created.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              canProceed() 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-indigo-300 cursor-not-allowed'
            }`}
          >
            {step < 3 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationFlowWizard; 