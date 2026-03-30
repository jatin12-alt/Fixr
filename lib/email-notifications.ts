import { Resend } from 'resend'
import { db, notificationPreferences, users } from '@/lib/db'
import { 
  PipelineFailedEmail,
  AIAnalysisCompleteEmail,
  WeeklyDigestEmail 
} from '@/components/emails'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPipelineFailedEmail(
  userEmail: string,
  repoName: string,
  errorSummary: string,
  repoId: string
) {
  try {
    await resend.emails.send({
      from: 'Fixr <notifications@fixr.ai>',
      to: userEmail,
      subject: `Pipeline Failed: ${repoName}`,
      react: PipelineFailedEmail({
        repoName,
        errorSummary,
        repoUrl: `https://fixr.ai/dashboard/repos/${repoId}`,
      }),
    })
  } catch (error) {
    console.error('Failed to send pipeline failed email:', error)
  }
}

export async function sendAIAnalysisCompleteEmail(
  userEmail: string,
  repoName: string,
  result: string,
  fixApplied: boolean,
  repoId: string
) {
  try {
    await resend.emails.send({
      from: 'Fixr <notifications@fixr.ai>',
      to: userEmail,
      subject: `AI Analysis Complete: ${repoName}`,
      react: AIAnalysisCompleteEmail({
        repoName,
        result,
        fixApplied,
        repoUrl: `https://fixr.ai/dashboard/repos/${repoId}`,
      }),
    })
  } catch (error) {
    console.error('Failed to send AI analysis email:', error)
  }
}

export async function sendWeeklyDigestEmail(
  userEmail: string,
  weekStats: {
    totalRuns: number
    successRate: number
    fixesApplied: number
    timeSaved: number
    topRepos: Array<{ name: string; runs: number; successRate: number }>
  }
) {
  try {
    await resend.emails.send({
      from: 'Fixr <notifications@fixr.ai>',
      to: userEmail,
      subject: 'Your Weekly Fixr Digest',
      react: WeeklyDigestEmail(weekStats),
    })
  } catch (error) {
    console.error('Failed to send weekly digest email:', error)
  }
}

// Get user notification preferences
export async function getUserNotificationPrefs(userId: string) {
  const prefs = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, userId),
  })

  return prefs || {
    emailOnFailure: true,
    emailOnFix: true,
    weeklyDigest: false,
    pushEnabled: false,
  }
}

// Send notification based on user preferences
export async function sendNotificationByPrefs(
  userId: string,
  type: 'pipeline_failed' | 'ai_complete' | 'auto_fix_applied',
  data: any
) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })

  if (!user || !user.email) return

  const prefs = await getUserNotificationPrefs(userId)

  switch (type) {
    case 'pipeline_failed':
      if (prefs?.emailOnFailure) {
        await sendPipelineFailedEmail(
          user.email,
          data.repoName,
          data.errorSummary,
          data.repoId
        )
      }
      break

    case 'ai_complete':
      if (prefs?.emailOnFix) {
        await sendAIAnalysisCompleteEmail(
          user.email,
          data.repoName,
          data.result,
          data.fixApplied,
          data.repoId
        )
      }
      break

    case 'auto_fix_applied':
      if (prefs?.emailOnFix) {
        await sendAIAnalysisCompleteEmail(
          user.email,
          data.repoName,
          data.fixDescription,
          true,
          data.repoId
        )
      }
      break
  }
}
