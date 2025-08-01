'use client';

import { useEffect } from 'react';
import Intercom from '@intercom/messenger-js-sdk';

export default function IntercomChat() {
  useEffect(() => {
    // Initialize Intercom
    Intercom({
      app_id: 'gub0xehc',
    });
    
    // Cleanup function to shutdown Intercom when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}