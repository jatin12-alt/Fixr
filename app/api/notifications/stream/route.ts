import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { notificationEmitter } from '@/lib/notification-emitter'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Subscribe this user to notifications
      notificationEmitter.subscribe(userId, controller)

      // Send initial connection message
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream'
      })}\n\n`))

      // Ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'))
        } catch (error) {
          clearInterval(pingInterval)
        }
      }, 30000)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        notificationEmitter.unsubscribe(userId, controller)
      })
    },
    cancel() {
      // Controller is not available here, just cleanup the subscription
      notificationEmitter.unsubscribe(userId)
    }
  })

  return new Response(stream, { headers })
}
