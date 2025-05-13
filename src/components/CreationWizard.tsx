'use client';

import React, { useState } from 'react';

// Define the wizard steps
export type WizardItemType = 'badge' | 'module' | 'task' | 'certificate' | 'reward';

interface WizardStep {
  title: string;
  description: string;
  type: WizardItemType;
  icon: string;
  color: string;
}

interface CreationWizardProps {
  onCreateItem: (type: WizardItemType) => void;
  onClose: () => void;
}

const CreationWizard: React.FC<CreationWizardProps> = ({ onCreateItem, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: WizardStep[] = [
    {
      title: 'What would you like to create?',
      description: 'Choose an item to create for your learning platform',
      type: 'badge', // Just a placeholder, not used in this step
      icon: '✨',
      color: 'bg-gray-100'
    },
    {
      title: 'Badge',
      description: 'Create a badge that learners can earn upon completing modules',
      type: 'badge',
      icon: '🏆',
      color: 'bg-amber-100'
    },
    {
      title: 'Module',
      description: 'Create a module containing a series of learning tasks',
      type: 'module',
      icon: '📚',
      color: 'bg-blue-100'
    },
    {
      title: 'Task',
      description: 'Create a task for learners to complete within a module',
      type: 'task',
      icon: '✅',
      color: 'bg-green-100'
    },
    {
      title: 'Certificate',
      description: 'Create a certificate that can be earned by completing badges',
      type: 'certificate',
      icon: '🎓',
      color: 'bg-purple-100'
    },
    {
      title: 'Reward',
      description: 'Create a reward that can be claimed by earning badges or points',
      type: 'reward',
      icon: '🎁',
      color: 'bg-pink-100'
    }
  ];

  const handleSelectType = (type: WizardItemType) => {
    onCreateItem(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create New Item</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="text-gray-600 mb-6">
          Select the type of item you want to create. Each item serves a different purpose in your learning platform.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.slice(1).map((step, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:border-indigo-500 hover:shadow-md transition cursor-pointer bg-white group"
              onClick={() => handleSelectType(step.type)}
            >
              <div className="flex items-start space-x-4">
                <div className={`${step.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition duration-200`}>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  <button 
                    className="mt-4 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100 transition flex items-center group-hover:bg-indigo-600 group-hover:text-white"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create {step.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreationWizard; 