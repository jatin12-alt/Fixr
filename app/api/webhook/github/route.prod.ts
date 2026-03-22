import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { getGitHubWebhookUrl } from '@/lib/urls'

// Webhook secret from environment
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    const headersList = headers()
    const signature = headersList.get('x-hub-signature-256')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      )
    }

    const body = await req.text()
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET || '')
    hmac.update(body)
    const expectedSignature = `sha256=${hmac.digest('hex')}`

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    
    // Log webhook event for debugging
    console.log(`📥 GitHub webhook: ${headersList.get('x-github-event')}`)
    console.log(`📦 Repository: ${payload.repository?.full_name}`)
    
    // Handle different webhook events
    switch (headersList.get('x-github-event')) {
      case 'push':
        await handlePushEvent(payload)
        break
      case 'workflow_job':
        await handleWorkflowJobEvent(payload)
        break
      case 'ping':
        console.log('🏓 GitHub webhook ping received')
        break
      default:
        console.log(`ℹ️ Unhandled event: ${headersList.get('x-github-event')}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('🚨 Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePushEvent(payload: any) {
  const { repository, ref, head_commit, pusher } = payload
  
  console.log(`📝 Push to ${repository.full_name}:${ref}`)
  console.log(`👤 Pushed by: ${pusher.name}`)
  console.log(`💬 Latest commit: ${head_commit.message}`)
  
  // TODO: Process push event logic
  // - Check if this affects any tracked repositories
  // - Update repository metadata
  // - Trigger initial pipeline sync if needed
}

async function handleWorkflowJobEvent(payload: any) {
  const { workflow_job, repository, action, organization } = payload
  
  if (action === 'completed') {
    const status = workflow_job.conclusion // success, failure, cancelled
    const jobName = workflow_job.name
    const runId = workflow_job.run_id
    
    console.log(`🔄 Workflow job "${jobName}" completed with status: ${status}`)
    
    // Only process failure events for now
    if (status === 'failure') {
      console.log(`🚨 Pipeline failed: ${repository.full_name}, run: ${runId}`)
      
      // TODO: Implement pipeline processing
      // 1. Create/update pipeline record in database
      // 2. Trigger AI analysis for failures
      // 3. Generate and apply fixes if auto-fixable
      // 4. Send notifications to users
      
      // For now, just log the event
      console.log(`🤖 AI analysis would be triggered here`)
      console.log(`📧 Notifications would be sent here`)
    }
  }
}

// Helper function to get webhook URL for debugging
export async function GET() {
  return NextResponse.json({
    webhookUrl: getGitHubWebhookUrl(),
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
}
