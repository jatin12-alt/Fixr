// Push notification utilities
import { db } from '@/lib/db'

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications')
  }

  const permission = await Notification.requestPermission()
  return permission
}

export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push messaging is not supported')
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    // Save subscription to database
    await db.pushSubscription.create({
      data: {
        userId,
        subscription: subscription as any,
      },
    })

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

export async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string,
  url?: string
): Promise<boolean> {
  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        title,
        body,
        url: url || '/dashboard',
      }),
    })

    return true
  } catch (error) {
    console.error('Failed to send push notification:', error)
    return false
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  try {
    // Remove from database
    await db.pushSubscription.deleteMany({
      where: { userId },
    })

    // Unsubscribe from service worker
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
  }
}
