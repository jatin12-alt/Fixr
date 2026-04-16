import { NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth'
import { notificationEmitter } from '@/lib/notification-emitter'

/**
 * Sentinel Notification Stream (SSE)
 * Provides real-time event telemetry to the architectural dashboard.
 */
export async function GET(req: NextRequest) {
  const { userId, error } = await getAuth(req)
  
  // High-priority rejection for expired/missing tokens
  if (!userId) {
    return new Response(
      JSON.stringify({ error: error === 'TOKEN_EXPIRED' ? 'REAUTH_REQUIRED' : 'UNAUTHORIZED' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // SSE Configuration
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Vercel
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // 1. Connection Established
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (e) {
          // Stream might be closed
        }
      }

      notificationEmitter.subscribe(userId, controller)

      // 2. Initial Handshake
      sendEvent({ type: 'handshake', status: 'connected', identity: userId })

      // 3. Keep-Alive Heartbeat (Critical for Heroku/Vercel 30s timeouts)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (e) {
          clearInterval(heartbeat)
        }
      }, 15000)

      // 4. Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        notificationEmitter.unsubscribe(userId, controller)
        console.log(`[Sentinel SSE] Discconnected node: ${userId}`)
      })
    }
  })

  return new Response(stream, { headers })
}
