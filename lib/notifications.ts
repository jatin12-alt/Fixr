import { db } from '@/lib/db'
import { notificationEmitter } from '@/lib/notification-emitter'
import { NotificationType } from '@/lib/db'
import { notifications } from '@/lib/db'
import { eq } from 'drizzle-orm'

interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  repoName?: string
  repoId?: number
}

export async function createNotification(data: CreateNotificationData) {
  try {
    // Create notification in database
    const [notification] = await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      repoName: data.repoName,
      repoId: data.repoId,
    }).returning()

    // Emit real-time notification
    notificationEmitter.emit(data.userId, {
      id: notification.id.toString(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      repoName: data.repoName,
      repoId: data.repoId?.toString(),
      createdAt: (notification.createdAt || new Date()).toISOString(),
    })

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    throw error
  }
}

// Specific notification helpers
export async function notifyPipelineFailed(userId: string, repoName: string, repoId: number, runId: string) {
  return createNotification({
    userId,
    type: 'PIPELINE_FAILED',
    title: 'Pipeline Failed',
    message: `${repoName} pipeline failed. Run #${runId}`,
    repoName,
    repoId,
  })
}

export async function notifyPipelineRecovered(userId: string, repoName: string, repoId: number) {
  return createNotification({
    userId,
    type: 'PIPELINE_RECOVERED',
    title: 'Pipeline Recovered',
    message: `${repoName} pipeline is back to green!`,
    repoName,
    repoId,
  })
}

export async function notifyAIAnalysisComplete(userId: string, repoName: string, repoId: number, result: string) {
  return createNotification({
    userId,
    type: 'AI_ANALYSIS_COMPLETE',
    title: 'AI Analysis Complete',
    message: `Analysis complete for ${repoName}. ${result}`,
    repoName,
    repoId,
  })
}

export async function notifyAutoFixApplied(userId: string, repoName: string, repoId: number, fixDescription: string) {
  return createNotification({
    userId,
    type: 'AUTO_FIX_APPLIED',
    title: 'Auto-Fix Applied',
    message: `Fixed ${repoName}: ${fixDescription}`,
    repoName,
    repoId,
  })
}

export async function notifyRepoConnected(userId: string, repoName: string, repoId: number) {
  return createNotification({
    userId,
    type: 'REPO_CONNECTED',
    title: 'Repository Connected',
    message: `${repoName} has been connected successfully`,
    repoName,
    repoId,
  })
}
