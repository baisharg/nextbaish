"use client";

import { useEffect } from "react";

export default function Head() {
  useEffect(() => {
    // Use React 19's resource hint APIs for optimal performance
    // These will be rendered during SSR and maintained on the client
    if (typeof document !== 'undefined') {
      const domains = [
        "https://substackapi.com",
        "https://baish.substack.com",
        "https://substackcdn.com",
        "https://lu.ma",
        "https://cdn.lu.ma",
        "https://va.vercel-scripts.com",
      ];

      // Create link elements for resource hints
      domains.forEach(domain => {
        // DNS prefetch
        const prefetch = document.createElement('link');
        prefetch.rel = 'dns-prefetch';
        prefetch.href = domain;
        document.head.appendChild(prefetch);

        // Preconnect
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = domain;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });
    }
  }, []);

  return null;
}
