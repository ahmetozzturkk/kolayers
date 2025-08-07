'use client';

import { useEffect } from 'react';

export default function YourGPTWidget() {
  useEffect(() => {
    // YourGPT widget configuration
    (window as any).YGC_WIDGET_ID = "0e0f84c6-1dd8-4a83-890c-4a23f40cdc7c";
    
    // Check if script is already loaded
    if (!document.getElementById('yourgpt-chatbot')) {
      const script = document.createElement('script');
      script.src = "https://widget.yourgpt.ai/script.js";
      script.id = 'yourgpt-chatbot';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null; // This component doesn't render anything visible
}
