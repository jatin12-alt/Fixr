// Simple EventEmitter pattern for real-time notifications
type NotificationData = {
  id: string
  userId: string
  type: string
  title: string
  message: string
  repoName?: string
  repoId?: string
  createdAt: string
}

type StreamController = ReadableStreamDefaultController<NotificationData>

class NotificationEmitter {
  private connections = new Map<string, Set<StreamController>>()

  // Subscribe a user to notification stream
  subscribe(userId: string, controller: StreamController) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId)!.add(controller)
  }

  // Unsubscribe a user from notification stream
  unsubscribe(userId: string, controller: StreamController) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      userConnections.delete(controller)
      if (userConnections.size === 0) {
        this.connections.delete(userId)
      }
    }
  }

  // Emit notification to all active connections for a user
  emit(userId: string, notification: NotificationData) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      const message = `data: ${JSON.stringify(notification)}\n\n`
      
      userConnections.forEach(controller => {
        try {
          controller.enqueue(new TextEncoder().encode(message))
        } catch (error) {
          // Connection closed, remove it
          this.unsubscribe(userId, controller)
        }
      })
    }
  }

  // Get active connection count for a user
  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0
  }

  // Clean up all connections (useful for testing)
  cleanup() {
    this.connections.clear()
  }
}

// Singleton instance
export const notificationEmitter = new NotificationEmitter()
