'use client';

import React, { useState } from 'react';

interface CreationGuidanceTipProps {
  title: string;
  description: string;
  tips: string[];
}

const CreationGuidanceTip: React.FC<CreationGuidanceTipProps> = ({ title, description, tips }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-medium text-blue-800">{title}</h3>
            <p className="text-sm text-blue-600">{description}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-100">
          <h4 className="font-medium text-blue-800 text-sm mb-2">Tips:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-700">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreationGuidanceTip; 