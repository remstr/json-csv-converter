'use client';

import { useEffect } from 'react';

export default function AdsterraSocialBar() {
  useEffect(() => {
    const scriptUrl = 'https://pl32184823.profitableratecpmnetwork.com/0c/41/27/0c4127a49ecd79b6c96909489f8eddd9.js';
    
    // Prevent duplicate scripts during hot reload or page transitions
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null; // Renders floating widgets dynamically over the page
}
