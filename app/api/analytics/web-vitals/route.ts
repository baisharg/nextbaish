import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Log to console (replace with your analytics service)
    console.log('Web Vital:', data)

    // TODO: Send to analytics service
    // await analytics.track(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 })
  }
}
