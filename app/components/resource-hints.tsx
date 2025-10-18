"use client";

import { preconnect } from "react-dom";

/**
 * Resource hints for third-party domains
 * Uses React 19's native preconnect API for optimal performance
 */
export function ResourceHints() {
  // Preconnect to Vercel Analytics (includes DNS + TCP + TLS handshake)
  preconnect("https://va.vercel-scripts.com", { crossOrigin: "anonymous" });

  return null;
}
