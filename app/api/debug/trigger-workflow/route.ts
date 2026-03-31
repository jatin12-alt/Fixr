import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, repos, pipelineRuns } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the repository (using CodeSense-AI with ID 3 for testing)
    const repoRecord = await db
      .select()
      .from(repos)
      .where(eq(repos.id, 3)) // Hardcoded for CodeSense-AI
      .limit(1)

    if (repoRecord.length === 0) {
      return NextResponse.json({ error: 'Test repository not found' }, { status: 404 })
    }

    const repo = repoRecord[0]

    // Create a mock workflow run payload
    const mockPayload = {
      action: 'completed',
      workflow_run: {
        id: `mock_${Date.now()}`,
        name: 'CI/CD Pipeline',
        conclusion: 'failure',
        status: 'completed',
        created_at: new Date().toISOString(),
        repository: {
          id: repo.githubId,
          name: repo.name,
          full_name: repo.fullName,
          owner: {
            login: repo.fullName.split('/')[0]
          }
        }
      },
      repository: {
        id: repo.githubId,
        name: repo.name,
        full_name: repo.fullName,
        owner: {
          login: repo.fullName.split('/')[0]
        }
      }
    }

    // Create a pipeline run record to simulate the failure
    const [pipelineRun] = await db
      .insert(pipelineRuns)
      .values({
        repoId: repo.id,
        githubRunId: mockPayload.workflow_run.id,
        status: 'failed',
        errorMessage: 'Mock workflow failure for testing AI engine',
        aiExplanation: 'Test AI analysis - mock failure detected in build process',
        aiFixSuggestion: 'Test fix suggestion - update dependency version',
        aiCodeFix: 'npm update package-name',
        aiSeverity: 'medium',
        aiCategory: 'dependency',
        aiConfidence: 85
      })
      .returning()

    console.log('🧪 DEBUG: Mock workflow triggered for', repo.fullName)
    console.log('🧪 DEBUG: Pipeline run created:', pipelineRun.id)

    return NextResponse.json({
      success: true,
      message: 'Mock workflow triggered successfully',
      data: {
        repository: repo.fullName,
        pipelineRunId: pipelineRun.id,
        mockPayload: mockPayload.workflow_run
      }
    })

  } catch (error) {
    console.error('🧪 DEBUG: Mock workflow trigger failed:', error)
    return NextResponse.json({
      error: 'Failed to trigger mock workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
