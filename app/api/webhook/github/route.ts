import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db, repos, pipelineRuns, users, githubTokens } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { analyzeErrorWithGroq } from '@/lib/groq'
import { Octokit } from '@octokit/rest'
import { 
  notifyPipelineFailed, 
  notifyAIAnalysisComplete, 
  notifyAutoFixApplied, 
  createNotification 
} from '@/lib/notifications'

import { 
  performAutoFixProductMode, 
  getGitHubTokenForUser 
} from '@/lib/github/fix-engine'

// Webhook secret for GitHub signature verification
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'fixr-webhook-secret'

export async function GET() {
  return new Response("ROUTE_IS_VISIBLE_AND_WORKING");
}

// Internal developer route to trigger a test notification/logic run
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'test';
  
  console.log(`🧪 TEST_TRIGGER: ${type}`);
  return NextResponse.json({ triggered: type });
}

export async function POST(req: Request) {
  console.log("🚀 WEBHOOK RECEIVED! 🚀 ROUTE HIT SUCCESSFULLY! 🚀")
  
  try {
    console.log("📥 WEBHOOK_TRIGGERED: ", "GitHub Webhook Received")
    
    const headersList = headers()
    const signature = headersList.get('x-hub-signature-256')
    const eventType = headersList.get('x-github-event')
    
    console.log("📥 RECEIVED EVENT:", eventType)
    console.log("🔑 SIGNATURE_PRESENT:", !!signature)
    
    if (!signature) {
      console.log("🎣 WEBHOOK_REJECTED: No signature provided")
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      )
    }

    const body = await req.text()
    console.log("🎣 WEBHOOK_BODY_LENGTH:", body.length)
    
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
    hmac.update(body)
    const expectedSignature = `sha256=${hmac.digest('hex')}`

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.log("🎣 WEBHOOK_REJECTED: Invalid signature")
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log("🎣 WEBHOOK_VERIFIED: Signature valid, processing event:", eventType)
    
    const payload = JSON.parse(body)
    
    console.log("🔍 REPO ID FROM GITHUB:", payload.repository?.id)
    console.log("🔍 REPO NAME FROM GITHUB:", payload.repository?.full_name)
    console.log("🔍 EVENT ACTION:", payload.action)
    
    // Process event in the background to prevent GitHub timeouts
    process.nextTick(() => {
      (async () => {
        try {
          // Route to appropriate handler
          switch (eventType) {
            case 'push':
              console.log("🎣 PROCESSING_PUSH_EVENT")
              await handlePushEvent(payload)
              break
            case 'pull_request':
              console.log("🎣 PROCESSING_PR_EVENT")
              await handlePullRequestEvent(payload)
              break
            case 'workflow_run':
              console.log("🎣 PROCESSING_WORKFLOW_RUN_EVENT")
              console.log("🔄 WORKFLOW STATUS:", payload.workflow_run?.status)
              console.log("🔄 WORKFLOW CONCLUSION:", payload.workflow_run?.conclusion)
              await handleWorkflowRunEvent(payload)
              break
            default:
              console.log("🎣 UNHANDLED_EVENT:", eventType)
          }
          console.log("🎣 WEBHOOK_BACKGROUND_PROCESSING_COMPLETE")
        } catch (bgError) {
          console.error("❌ BACKGROUND_PROCESSING_ERROR:", bgError)
        }
      })()
    })

    console.log("🎣 WEBHOOK_ACCEPTED_IMMEDIATELY")
    return NextResponse.json({ received: true }, { 
      status: 202,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error("🎣 WEBHOOK_ERROR:", error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Event handlers
async function handlePushEvent(payload: any) {
  // Loop-Breaker: Ignore pushes that contain AI-generated fixes
  const aiCommits = payload.commits?.filter((commit: any) => 
    commit.message?.includes('🤖 AI Fix') || commit.author?.name === 'fixr-ai[bot]'
  )
  
  if (aiCommits?.length > 0) {
    console.log("⚠️ LOOP_BREAKER: Push contains AI fixes. Ignoring.")
    return
  }

  console.log("🎣 PUSH_EVENT:", {
    ref: payload.ref,
    repo: payload.repository?.full_name,
    pusher: payload.pusher?.name,
    commits: payload.commits?.length || 0
  })
}

async function handlePullRequestEvent(payload: any) {
  console.log("🎣 PR_EVENT:", {
    action: payload.action,
    repo: payload.repository?.full_name,
    number: payload.pull_request?.number
  })
}

// Workflow Run Event Handler with AI Analysis
async function handleWorkflowRunEvent(payload: any) {
  console.log("🔄 WORKFLOW_RUN_EVENT_START")
  
  console.log("🔄 WORKFLOW_RUN_EVENT:", {
    action: payload.action,
    status: payload.workflow_run?.conclusion,
    repo: payload.repository?.full_name,
    runId: payload.workflow_run?.id,
    headBranch: payload.workflow_run?.head_branch
  })

  const { workflow_run, repository } = payload
  
  // ABSOLUTE LOGGING - Force terminal output for failures
  if (workflow_run?.conclusion === 'failure') {
    console.log("❌ FAILURE_DETECTED for: ", workflow_run.name)
    console.log("🤖 CALLING_GROQ_NOW...")
  }
  
  // Only process failed workflows
  if (workflow_run?.conclusion !== 'failure') {
    console.log("✅ WORKFLOW_SUCCESS - No analysis needed. Status:", workflow_run?.conclusion)
    return
  }

  console.log("🔍 STARTING_FAILURE_ANALYSIS...")

  try {
    // CRITICAL FIX: Use GitHub repository ID to find our internal repo record
    const githubRepoId = repository.id.toString() // GitHub's ID (e.g., "1182288720")
    console.log("🔍 LOOKING_FOR_REPO_BY_GITHUB_ID:", githubRepoId)
    console.log("🔍 GITHUB_REPO_TYPE:", typeof repository.id, "VALUE:", repository.id)
    
    const repoRecord = await db
      .select()
      .from(repos)
      .where(eq(repos.githubId, githubRepoId))
      .limit(1)

    console.log("📋 DB REPO_DATA:", repoRecord)
    console.log("📋 DB_REPO_COUNT:", repoRecord.length)

    if (repoRecord.length === 0) {
      console.log("❌ REPO_NOT_FOUND_BY_GITHUB_ID:", { 
        githubId: githubRepoId, 
        fullName: repository.full_name 
      })
      
      // Fallback: try to find by full_name (for debugging)
      console.log("🔄 TRYING_FALLBACK_SEARCH_BY_FULLNAME...")
      const fallbackRepo = await db
        .select()
        .from(repos)
        .where(eq(repos.fullName, repository.full_name))
        .limit(1)
      
      console.log("📋 FALLBACK_SEARCH_RESULT:", fallbackRepo)
      
      if (fallbackRepo.length > 0) {
        console.log("⚠️ FOUND_BY_FULLNAME_BUT_NOT_GITHUBID:", {
          fullName: repository.full_name,
          ourGithubId: fallbackRepo[0].githubId,
          ourGithubIdType: typeof fallbackRepo[0].githubId,
          expectedGithubId: githubRepoId,
          expectedGithubIdType: typeof githubRepoId
        })
      }
      
      return
    }

    const repo = repoRecord[0]
    console.log("✅ REPO_FOUND_BY_GITHUB_ID:", { 
      ourInternalId: repo.id, 
      githubId: repo.githubId,
      autoFixEnabled: repo.autoFixEnabled 
    })

    // Check for existing runs to prevent duplicates
    console.log("🔍 CHECKING_EXISTING_RUNS...")
    const existingRun = await db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.githubRunId, workflow_run.id.toString()))
      .limit(1)

    console.log("📋 EXISTING_RUNS:", existingRun.length)

    if (existingRun.length > 0 && existingRun[0].status === 'fixed_and_merged') {
      console.log("⚠️ LOOP_BREAKER: Run already successfully fixed and merged. Stopping.")
      return
    }

    // Get GitHub token for log fetching
    console.log("🔍 FETCHING_GITHUB_TOKEN...")
    const githubToken = await getGitHubTokenForUser(repo.userId)
    if (!githubToken) {
      console.log("❌ NO_GITHUB_TOKEN - Cannot fetch logs")
      return
    }

    console.log("✅ GITHUB_TOKEN_FOUND")

    // Initialize Octokit
    console.log("🔧 INITIALIZING_OCTOKIT...")
    const octokit = new Octokit({ auth: githubToken })
    console.log("✅ OCTOKIT_INITIALIZED")

    // Fetch workflow logs (last 100 lines)
    console.log("📋 FETCHING_WORKFLOW_LOGS...")
    let logs = ''
    try {
      const logsResponse = await octokit.actions.listJobsForWorkflowRun({
        owner: repository.owner.login,
        repo: repository.name,
        run_id: workflow_run.id,
        per_page: 10
      })

      if (logsResponse.data.jobs.length > 0) {
        const job = logsResponse.data.jobs[0]
        if (job.steps && job.steps.length > 0) {
          const failedStep = job.steps.find(step => step.conclusion === 'failure')
          if (failedStep) {
            logs = `Failed step: ${failedStep.name}\nExit: ${failedStep.conclusion}\n\nRecent logs:\n`
            // Try to get actual logs (this might require additional API calls)
            logs += `Step: ${failedStep.name} - Status: ${failedStep.conclusion}`
          }
        }
      }
      
      console.log("✅ LOGS_FETCHED_SUCCESSFULLY")
    } catch (logError) {
      console.log("⚠️ LOG_FETCH_FAILED:", logError)
      logs = `Workflow ${workflow_run.name} failed but logs could not be retrieved. Conclusion: ${workflow_run.conclusion}`
    }

    if (!logs.trim()) {
      logs = `Workflow ${workflow_run.name} failed but no logs could be retrieved. Conclusion: ${workflow_run.conclusion}`
    }

    // Step 3: Run AI Analysis once
    console.log("🤖 STARTING_AI_ANALYSIS...")
    const aiAnalysis = await analyzeErrorWithGroq(logs)
    
    console.log("✅ AI_ANALYSIS_COMPLETE:", {
      severity: aiAnalysis.severity,
      category: aiAnalysis.category,
      confidence: aiAnalysis.confidence,
      hasCodeFix: !!aiAnalysis.codeFix
    })

    // Step 4: Save to DB once
    console.log("💾 SAVING_PIPELINE_RUN_TO_DB...")
    try {
      const [pipelineRun] = await db
        .insert(pipelineRuns)
        .values({
          repoId: repo.id,
          githubRunId: workflow_run.id.toString(),
          status: 'failed',
          errorMessage: workflow_run.conclusion || 'Workflow failed',
          aiExplanation: aiAnalysis.explanation,
          aiFixSuggestion: aiAnalysis.fixSuggestion,
          aiCodeFix: aiAnalysis.codeFix || aiAnalysis.fixSuggestion,
          aiSeverity: aiAnalysis.severity,
          aiCategory: aiAnalysis.category,
          aiConfidence: aiAnalysis.confidence
        })
        .returning()

      console.log("✅ PIPELINE_RUN_SAVED_TO_DB:", { runId: pipelineRun.id, status: pipelineRun.status })
    } catch (dbError) {
      console.error("💀 DB_INSERT_ERROR:", dbError)
      throw dbError
    }

      if (repo.autoFixEnabled && (aiAnalysis.codeFix || aiAnalysis.fixSuggestion)) {
        console.log("🔧 STARTING_AUTO_FIX...")
        console.log("🔧 AUTO_FIX_DETAILS:", {
          repoAutoFixEnabled: repo.autoFixEnabled,
          hasCodeFix: !!aiAnalysis.codeFix,
          hasFixSuggestion: !!aiAnalysis.fixSuggestion,
          confidence: aiAnalysis.confidence
        })

        // Mocking enough of workflow_run for the fix-engine
        const mockWorkflowRun = {
          id: workflow_run.id,
          name: workflow_run.name,
          head_commit: workflow_run.head_commit,
          head_branch: workflow_run.head_branch
        }

        await performAutoFixProductMode(repo, mockWorkflowRun, repository, aiAnalysis, githubToken, octokit)
        console.log("✅ AUTO_FIX_COMPLETED")
      } else {
      console.log("⚠️ AUTO_FIX_SKIPPED:", {
        repoAutoFixEnabled: repo.autoFixEnabled,
        hasCodeFix: !!aiAnalysis.codeFix,
        hasFixSuggestion: !!aiAnalysis.fixSuggestion
      })
    }

    console.log("🎉 WORKFLOW_RUN_PROCESSING_COMPLETE")

  } catch (error) {
    console.error("❌ WORKFLOW_RUN_ERROR:", error instanceof Error ? error.message : String(error))
    console.error("❌ WORKFLOW_RUN_FULL_ERROR:", error)
  }
}


