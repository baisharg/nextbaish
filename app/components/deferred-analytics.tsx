'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load analytics components
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => ({
    default: mod.Analytics
  })),
  { ssr: false }
)

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => ({
    default: mod.SpeedInsights
  })),
  { ssr: false }
)

export function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Strategy 1: Wait for LCP to complete
    const po = new PerformanceObserver((list) => {
      const lcpEntry = list.getEntries().at(-1)
      if (lcpEntry) {
        po.disconnect()
        // Load analytics 500ms after LCP
        setTimeout(() => setShouldLoad(true), 500)
      }
    })

    po.observe({ type: 'largest-contentful-paint', buffered: true })

    // Strategy 2: Fallback - load after 3 seconds if LCP not detected
    const fallbackTimer = setTimeout(() => {
      setShouldLoad(true)
    }, 3000)

    return () => {
      po.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
