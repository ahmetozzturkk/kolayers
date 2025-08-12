'use client';

import { useEffect } from 'react';

export default function ZendeskWidget() {
  useEffect(() => {
    // Check if Zendesk script is already loaded
    if (!document.getElementById('ze-snippet')) {
      const script = document.createElement('script');
      script.id = 'ze-snippet';
      script.src = 'https://static.zdassets.com/ekr/snippet.js?key=eab0b2a5-d3fa-4aa9-bacd-60fd1ffc3706';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null; // This component doesn't render anything visible
}
