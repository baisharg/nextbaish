'use client'

import { useEffect } from 'react'

export function LCPDebugger() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformancePaintTiming & {
        element?: HTMLElement
        size?: number
        url?: string
        loadTime?: number
        renderTime?: number
      }

      // Log LCP details
      console.group('🎯 LCP Analysis')
      console.log('Element:', lastEntry.element)
      console.log('Time:', lastEntry.startTime.toFixed(2), 'ms')
      console.log('Size:', lastEntry.size, 'px²')
      console.log('URL:', lastEntry.url || 'N/A')

      // Visual highlight
      if (lastEntry.element) {
        lastEntry.element.style.outline = '5px solid lime'
        lastEntry.element.style.outlineOffset = '-5px'
      }

      // LCP Sub-parts breakdown
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const ttfb = navEntry ? navEntry.responseStart : 0

      console.table({
        'TTFB': `${ttfb.toFixed(2)}ms`,
        'Resource Load': `${(lastEntry.loadTime || 0).toFixed(2)}ms`,
        'Render Delay': `${(lastEntry.renderTime || 0).toFixed(2)}ms`,
        'Total LCP': `${lastEntry.startTime.toFixed(2)}ms`
      })
      console.groupEnd()
    })

    po.observe({ type: 'largest-contentful-paint', buffered: true })

    return () => po.disconnect()
  }, [])

  return null
}
