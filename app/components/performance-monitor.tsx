'use client'

import { useEffect } from 'react'
import { onLCP, onCLS, onTTFB, onINP } from 'web-vitals'

interface Metric {
  name: string
  value: number
  id: string
  navigationType: string
}

export function PerformanceMonitor() {
  useEffect(() => {
    const sendToAnalytics = (metric: Metric) => {
      const isDesktop = window.innerWidth >= 1024
      const device = isDesktop ? 'desktop' : 'mobile'

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)
        console.log(`[RUM] ${metric.name} (${device}):`, value, 'ms')

        // Color-coded warnings
        if (metric.name === 'LCP') {
          if (metric.value > 2500) {
            console.warn(`⚠️ LCP is slow: ${metric.value}ms (target: <2500ms)`)
          } else {
            console.log(`✅ LCP is good: ${metric.value}ms`)
          }
        }
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Option 1: Send to Vercel Analytics (if enabled)
        // Option 2: Send to custom endpoint
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: metric.name,
            value: metric.value,
            id: metric.id,
            device,
            page: window.location.pathname,
            timestamp: Date.now(),
          }),
        }).catch(console.error)
      }
    }

    // Register observers for all Core Web Vitals
    onLCP(sendToAnalytics)
    onCLS(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics) // INP replaces FID in web-vitals v4+
  }, [])

  return null
}
