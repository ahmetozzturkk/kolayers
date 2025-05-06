'use client';

import { useEffect } from 'react';
import { initializeTaskContent } from '../lib/taskContentInitializer';

export default function TaskContentInitializer() {
  useEffect(() => {
    // Initialize task content when the component mounts
    initializeTaskContent();
  }, []);

  // This component doesn't render anything
  return null;
} 