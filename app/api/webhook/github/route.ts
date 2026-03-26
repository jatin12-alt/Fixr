import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db, repos, pipelineRuns, users, githubTokens } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { analyzeErrorWithGroq } from '@/lib/groq'
import { Octokit } from '@octokit/rest'

// Webhook secret for GitHub signature verification
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'fixr-webhook-secret'

export async function POST(req: NextRequest) {
  try {
    console.log("📥 WEBHOOK_TRIGGERED: ", "GitHub Webhook Received")
    
    const headersList = headers()
    const signature = headersList.get('x-hub-signature-256')
    const eventType = headersList.get('x-github-event')
    
    console.log("📥 WEBHOOK_TRIGGERED: ", eventType)
    
    console.log("🎣 WEBHOOK_DETAILS:", { 
      hasSignature: !!signature, 
      eventType,
      userAgent: headersList.get('user-agent')
    })
    
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
    
    console.log("🔍 GITHUB_REPO_ID: ", payload.repository?.id)
    
    // Handle different event types
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
        await handleWorkflowRunEvent(payload)
        break
      default:
        console.log("🎣 UNHANDLED_EVENT:", eventType)
    }

    console.log("🎣 WEBHOOK_PROCESSED_SUCCESSFULLY")
    return NextResponse.json({ received: true })
    
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
  console.log("🎣 PUSH_EVENT:", {
    ref: payload.ref,
    repo: payload.repository?.full_name,
    pusher: payload.pusher?.name,
    commits: payload.commits?.length || 0
  })
      const simulatedAnalysis = [
        {
          status: 'pending_fix',
          errorMessage: 'Import path error detected in components/Button.tsx',
          confidence: 92,
          fixApplied: null
        },
        {
          status: 'pending_fix', 
          errorMessage: 'Missing dependency "lucide-react" in package.json',
          confidence: 88,
          fixApplied: null
        },
        {
          status: 'manual_review',
          errorMessage: 'TypeScript error in complex generic function',
          confidence: 45,
          fixApplied: null
        }
      ]
      
      const analysis = simulatedAnalysis[Math.floor(Math.random() * simulatedAnalysis.length)]
      
      await db
        .update(pipelineRuns)
        .set(analysis)
        .where(eq(pipelineRuns.id, pipelineRunId))
      
      console.log(`🎯 Simulated analysis complete: ${analysis.errorMessage}`)
    }
  } catch (error) {
    console.error('AI analysis error:', error)
  }
}

async function processFailureAsync(params: {
  pipelineRunId: number
  repo: any
  user: any
  runId: string
  workflowName: string
  headSha: string | null
}) {
  try {
    const { pipelineRunId, repo, user, runId, workflowName, headSha } = params

    // Development: Simulate AI analysis
    if (process.env.NODE_ENV === 'development') {
      await simulateAIAnalysis(pipelineRunId, repo, runId)
      return
    }

    // Production: Real AI analysis
    // Prductio: RalAI lysis
    // Get GitHub token securely
    const githubToken = await getGitHubTokenForUser(repo.userId)
    //GtGitHubtk
     (!gt oithubTk=wai getGtHubTokeForUer(uer.id
    console.log('No GitHub token available, skipping AI analysis')
    if (!gthubTok){
      phrowdate(EirpR('NsGitHuboken avalabl f ur'
    }  .set({

    const analysis = a:a 'nanalyzePlpeiineFsilure(gi_hubTokfn,ioweer, repoNdme, runId)
    
        errorMessage: 'GitHub token not available - please reconnect GitHub'
      })
      .where(eq(pipelineRuns.id, pipelineRunId))
      rernanalysis.autoFixable ?  : 'manual_review'
    }aalysrooCaue
analysis.confidence
    //arse repository owner and name
    cot [owner, repoName] = repo.fullName.split('/')

    //Ifauto-fixable and auto-mode enabled, apply fix
    ifi(analysis.autoFixablef&& repo.autoMode) {
       (process.en`🔧 =uto- ppevlngpfix fer ${reto.fu'lNam)}`
      e.log('Development mode: Simulating AI analysis')
      const fix =aawait geneaaeeFwx(githubT keP,rowner,irepoNsme, ae(resol)ve => setTimeout(resolve, 2000))
      
      if (fix) {
          ppedpyxfix, aalysis
          // Update with simulated analysis
      abf(pped){
              .update(pipelineRuns)
              .set({
                status: 'pending_fix',
                errorM'ft od',
            rdfixAptliet: n c.utoeNamnsx',
                confidence: `Auto-fixed: ${85}` 
           })
            
            console.log('Simulated AI analysis completed')
            return`✅ uto-fixpp`
        }
      }
    }
}

    // Production `❌ I aprocessiag fliled for pipeysne${pipelinRunId}`const analysis = await analyzePipelineFailure(githubToken, owner, repoName, runId)

    // Update with real analysis results
    await db
      .update(pipelineRuns)
      .set({
        status: analys`s.autoFixable ? 'p:x${erro'.m ssag'}`niled',
        errorMessage: analysis.rootCause,
        confidence: analysis.confidence
      })
      .where(eq(pipelineRuns.id, pipelineRunId))
    
    console.logsimulateAIAnalysis(pip'l neRunId: namler, reps: any, runId: stri g) {
  conlole.loge`🎭 Simul sing AI unclyeif fol)${repo.fllName}`)
  
  // Siulat pocessing time
  await newse(reolv => etTimeou(esolve, 3000))
  
cost simatedAnayses = [
   
      sta us:'pending_fix',
    } errocMessaga: 'Import path erroh(detecred){n componens/i/utton.tsx',
      cnfidc: 92,
      fixAppled: null
    },
    {
      status: 'pndin_fix', 
      rrrMessage: 'Missing dependc "lucide-rec" in pckge.jon',
      confidenc: 88,
      fixAppli: null
    },
    {
      stus: 'mnul_rviw',
      errorMessage: 'TypeScript nypel.reor in crmplex geneoic function',
      confidence: 45,
      fixApplied: null
    }
 (]AI analysis error:', error)
  
  nst aalysis = imulatedAnayss[Mathfloo(Math.andm) * smuatAnalyses.length)]
 
awa d
   .updae(pipelinRus)
   .st(analysis
    .whe/e(eq(pipelineRuns.id, pipelin/RUdId))
  
 console.log(`🎯 Simulated analysis complete: ${analysis.errorMessage}`) await db
      .update(pipelineRuns)
      .set({
        status: 'analysis_failed',
        errorMessage: 'AI analysis failed - manual review required'
      })
      .where(eq(pipelineRuns.id, pipelineRunId))
  }
}

// Workflow Run Event Handler with AI Analysis
async function handleWorkflowRunEvent(payload: any) {
  console.log("🔄 WORKFLOW_RUN_EVENT:", {
    action: payload.action,
    status: payload.workflow_run?.conclusion,
    repo: payload.repository?.full_name,
    runId: payload.workflow_run?.id
  })

  const { workflow_run, repository } = payload
  
  // ABSOLUTE LOGGING - Force terminal output for failures
  if (workflow_run?.conclusion === 'failure') {
    console.log("❌ FAILURE_DETECTED for: ", workflow_run.name)
    console.log("🤖 CALLING_GROQ_NOW...")
  }
  
  // Only process failed workflows
  if (workflow_run?.conclusion !== 'failure') {
    console.log("✅ WORKFLOW_SUCCESS - No analysis needed")
    return
  }

  try {
    // CRITICAL FIX: Use GitHub repository ID to find our internal repo record
    const githubRepoId = repository.id.toString() // GitHub's ID (e.g., "1182288720")
    console.log("🔍 GITHUB_REPO_ID: ", githubRepoId)
    console.log("🔍 LOOKING_FOR_REPO_BY_GITHUB_ID:", githubRepoId)
    
    const repoRecord = await db
      .select()
      .from(repos)
      .where(eq(repos.githubId, githubRepoId))
      .limit(1)

    if (repoRecord.length === 0) {
      console.log("❌ REPO_NOT_FOUND_BY_GITHUB_ID:", { 
        githubId: githubRepoId, 
        fullName: repository.full_name 
      })
      
      // Fallback: try to find by full_name (for debugging)
      const fallbackRepo = await db
        .select()
        .from(repos)
        .where(eq(repos.fullName, repository.full_name))
        .limit(1)
      
      if (fallbackRepo.length > 0) {
        console.log("⚠️ FOUND_BY_FULLNAME_BUT_NOT_GITHUBID:", {
          fullName: repository.full_name,
          ourGithubId: fallbackRepo[0].githubId,
          expectedGithubId: githubRepoId
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

    // Get GitHub token for log fetching
    const githubToken = await getGitHubTokenForUser(repo.userId)
    if (!githubToken) {
      console.log("❌ NO_GITHUB_TOKEN - Cannot fetch logs")
      return
    }

    // Initialize Octokit
    const octokit = new Octokit({ auth: githubToken })

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

      // Get logs from failed jobs
      for (const job of logsResponse.data.jobs) {
        if (job.conclusion === 'failure') {
          try {
            const logResponse = await octokit.actions.downloadJobLogsForWorkflowRun({
              owner: repository.owner.login,
              repo: repository.name,
              run_id: workflow_run.id,
              job_id: job.id
            })
            
            // Convert logs to string and take last 100 lines
            const logText = await logResponse.data.text()
            const logLines = logText.split('\n').slice(-100)
            logs += logLines.join('\n') + '\n'
          } catch (logError) {
            console.log("⚠️ COULD_NOT_FETCH_JOB_LOGS:", job.name)
          }
        }
      }
    } catch (error) {
      console.log("⚠️ LOG_FETCH_FAILED:", error)
      logs = `Failed to fetch logs. Workflow: ${workflow_run.name}, Status: ${workflow_run.conclusion}`
    }

    if (!logs.trim()) {
      logs = `Workflow ${workflow_run.name} failed but no logs could be retrieved. Conclusion: ${workflow_run.conclusion}`
    }

    console.log("🤖 STARTING_AI_ANALYSIS...")
    
    // Analyze with Groq AI
    const aiAnalysis = await analyzeErrorWithGroq(logs)
    
    console.log("✅ AI_ANALYSIS_COMPLETE:", {
      severity: aiAnalysis.severity,
      category: aiAnalysis.category,
      confidence: aiAnalysis.confidence
    })

    // Save pipeline run with AI analysis - WRAPPED IN TRY-CATCH
    try {
      console.log("💾 ATTEMPTING_DB_INSERT:", {
        repoId: repo.id,
        githubRunId: workflow_run.id.toString(),
        status: 'failed'
      })

      const [pipelineRun] = await db
        .insert(pipelineRuns)
        .values({
          repoId: repo.id,
          githubRunId: workflow_run.id.toString(),
          status: 'failed',
          errorMessage: workflow_run.conclusion || 'Workflow failed',
          aiExplanation: aiAnalysis.explanation,
          aiFixSuggestion: aiAnalysis.fixSuggestion,
          aiCodeFix: aiAnalysis.codeFix,
          aiSeverity: aiAnalysis.severity,
          aiCategory: aiAnalysis.category,
          aiConfidence: aiAnalysis.confidence
        })
        .returning()

      console.log("✅ PIPELINE_RUN_SAVED:", { 
        savedId: pipelineRun.id,
        repoId: pipelineRun.repoId,
        githubRunId: pipelineRun.githubRunId
      })
    } catch (dbError) {
      console.error("💀 DB_INSERT_ERROR: ", dbError instanceof Error ? dbError.message : String(dbError))
      console.error("💀 DB_INSERT_FULL_ERROR: ", dbError)
      throw dbError
    }

    // Auto-fix if enabled
    if (repo.autoFixEnabled && aiAnalysis.codeFix) {
      console.log("🔧 STARTING_AUTO_FIX...")
      await performAutoFix(repo, workflow_run, aiAnalysis, githubToken, octokit)
    }

  } catch (error) {
    console.error("❌ WORKFLOW_RUN_ERROR:", error instanceof Error ? error.message : String(error))
    console.error("❌ WORKFLOW_RUN_FULL_ERROR:", error)
  }
}

// Auto-fix function
async function performAutoFix(repo: any, workflowRun: any, aiAnalysis: any, githubToken: string, octokit: Octokit) {
  try {
    const branchName = `fixr/ai-fix-${workflowRun.id}`
    
    console.log("🔧 CREATING_FIX_BRANCH:", branchName)

    // Check if branch already exists
    try {
      await octokit.rest.repos.getBranch({
        owner: workflowRun.repository.owner.login,
        repo: workflowRun.repository.name,
        branch: branchName
      })
      console.log("⚠️ BRANCH_ALREADY_EXISTS - Skipping auto-fix")
      return
    } catch (error) {
      // Branch doesn't exist, proceed
    }

    // Get default branch
    const defaultBranch = await octokit.rest.repos.get({
      owner: workflowRun.repository.owner.login,
      repo: workflowRun.repository.name
    })

    // Create new branch from default
    await octokit.rest.git.createRef({
      owner: workflowRun.repository.owner.login,
      repo: workflowRun.repository.name,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranch.data.default_branch === 'main' 
        ? defaultBranch.data.commit.sha 
        : defaultBranch.data.commit.sha
    })

    // Apply code fix (simplified - in real implementation, you'd parse and modify files)
    if (aiAnalysis.codeFix) {
      console.log("📝 APPLYING_CODE_FIX...")
      // This is a placeholder for actual file modification
      // You would need to:
      // 1. Get the file content
      // 2. Apply the AI-suggested fix
      // 3. Commit the changes
    }

    // Create pull request
    const pr = await octokit.rest.pulls.create({
      owner: workflowRun.repository.owner.login,
      repo: workflowRun.repository.name,
      title: `🤖 AI Fix: ${aiAnalysis.category} - ${workflowRun.name}`,
      head: branchName,
      base: defaultBranch.data.default_branch,
      body: `## 🤖 AI-Generated Fix

**Issue:** ${aiAnalysis.explanation}

**Severity:** ${aiAnalysis.severity}

**Fix Applied:** 
\`\`\`
${aiAnalysis.codeFix || aiAnalysis.fixSuggestion}
\`\`\`

**Confidence:** ${aiAnalysis.confidence}%

---
*This fix was automatically generated by Fixr AI based on workflow failure analysis.*
`
    })

    console.log("✅ PULL_REQUEST_CREATED:", { 
      prNumber: pr.data.number,
      url: pr.data.html_url 
    })

  } catch (error) {
    console.error("❌ AUTO_FIX_FAILED:", error)
  }
}

async function getGitHubTokenForUser(userId: string): Promise<string | null> {
  try {
    const tokenRecord = await db
      .select()
      .from(githubTokens)
      .where(eq(githubTokens.userId, userId))
      .limit(1)
    
    return tokenRecord.length > 0 ? tokenRecord[0].encryptedToken : null
  } catch (error) {
    console.error('Failed to get GitHub token:', error)
    return null
  }
}
