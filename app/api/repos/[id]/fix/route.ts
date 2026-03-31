import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, repos, pipelineRuns } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { Octokit } from '@octokit/rest'
import { 
  performAutoFixProductMode, 
  getGitHubTokenForUser 
} from '@/lib/github/fix-engine'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { runId } = await req.json()
    const { id } = await params
    const repoId = parseInt(id)

    if (isNaN(repoId) || !runId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // 1. Fetch repo
    const [repo] = await db
      .select()
      .from(repos)
      .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
      .limit(1)

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    // 2. Fetch run
    const [run] = await db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.id, parseInt(runId)))
      .limit(1)

    if (!run) {
      return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 })
    }

    // 3. Fetch token
    const githubToken = await getGitHubTokenForUser(userId)
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not found' }, { status: 403 })
    }

    // 4. Initialize Octokit
    const octokit = new Octokit({ auth: githubToken })

    // 5. Prepare data for performAutoFixProductMode
    const aiAnalysis = {
      explanation: run.aiExplanation,
      fixSuggestion: run.aiFixSuggestion,
      codeFix: run.aiCodeFix,
      severity: run.aiSeverity,
      category: run.aiCategory,
      confidence: run.aiConfidence || 0
    }

    // Mocking repository object as expected by engine (need owner/name)
    const [owner, name] = repo.fullName.split('/')
    const repository = {
      owner: { login: owner },
      name: name,
      full_name: repo.fullName,
      default_branch: 'main' // Fallback
    }

    const workflowRun = {
      id: run.githubRunId,
      name: `Manual Fix Task #${run.id}`,
      head_commit: { message: 'Manual trigger' },
      head_branch: 'main'
    }

    // 6. Execute
    await performAutoFixProductMode(repo, workflowRun, repository, aiAnalysis, githubToken, octokit)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manual fix trigger error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to trigger auto-fix' 
    }, { status: 500 })
  }
}
