import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users, repos, pipelineRuns, githubTokens } from '@/lib/db'
import { eq, desc, and, sql } from 'drizzle-orm'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'

// Secure GET endpoint
const getHandler = secureAPIRoute(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { userId } = auth()
    
    console.log("🔍 FETCHING_REPO_ID:", params.id, "USER_ID:", userId)
    console.log("🔍 PARAMS_TYPE:", typeof params.id, "USERID_TYPE:", typeof userId)
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const repoId = parseInt(params.id)
      console.log("🔍 PARSED_REPO_ID:", repoId, "TYPE:", typeof repoId)
      
      if (isNaN(repoId)) {
        console.log("❌ INVALID_REPO_ID:", params.id)
        return Response.json({ error: 'Invalid repository ID' }, { status: 400 })
      }

      console.log("🔍 LOOKING_FOR_REPO:", { repoId, userId })

      // First, let's check if the repo exists at all
      const repoExists = await db
        .select({ id: repos.id, name: repos.name, userId: repos.userId })
        .from(repos)
        .where(eq(repos.id, repoId))
        .limit(1)

      console.log("🔍 REPO_EXISTS_CHECK:", repoExists)

      // Now check if user has access
      const userAccess = await db
        .select({ id: repos.id, name: repos.name, userId: repos.userId })
        .from(repos)
        .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
        .limit(1)

      console.log("🔍 USER_ACCESS_CHECK:", userAccess)

      // Get repo details with user info - use defensive querying
      let repoData;
      try {
        repoData = await db
          .select({
            repo: repos,
            user: users,
          })
          .from(repos)
          .leftJoin(users, eq(repos.userId, users.clerkId))
          .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
          .limit(1)
      } catch (selectError) {
        console.error("❌ SELECT_ERROR:", selectError)
        // Fallback to basic query if full query fails
        console.log("🔄 TRYING_FALLBACK_QUERY...")
        repoData = await db
          .select({
            repo: {
              id: repos.id,
              name: repos.name,
              fullName: repos.fullName,
              userId: repos.userId,
              isActive: repos.isActive,
              createdAt: repos.createdAt,
              githubId: repos.githubId,
              autoFixEnabled: repos.autoFixEnabled,
              healthStatus: repos.healthStatus,
              lastScanAt: repos.lastScanAt,
              webhookId: repos.webhookId
            },
            user: users,
          })
          .from(repos)
          .leftJoin(users, eq(repos.userId, users.clerkId))
          .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
          .limit(1)
      }

      console.log("📊 REPO_QUERY_RESULT:", repoData.length, "records found")
      console.log("📊 REPO_QUERY_DATA:", JSON.stringify(repoData, null, 2))

      if (repoData.length === 0) {
        console.log("❌ REPO_NOT_FOUND:", { repoId, userId })
        return Response.json({ error: 'Repository not found' }, { status: 404 })
      }

      const { repo, user } = repoData[0]
      console.log("✅ REPO_FOUND:", { 
        repoId: repo.id, 
        repoName: repo.name,
        repoFullName: repo.fullName,
        userId: repo.userId,
        allRepoFields: Object.keys(repo)
      })

      // Get latest pipeline runs (last 5) - resilient to missing columns
      let runs: {
        aiCategory?: string | null;
        id: number; 
        status: string; 
        errorMessage: string | null; 
        fixApplied: string | null; 
        confidence: number | null; 
        createdAt: Date | null;
        aiExplanation?: string | null;
        aiFixSuggestion?: string | null;
        aiCodeFix?: string | null;
        aiSeverity?: string | null;
      }[] = [];
      try {
        runs = await db
          .select()
          .from(pipelineRuns)
          .where(eq(pipelineRuns.repoId, repoId))
          .orderBy(desc(pipelineRuns.createdAt))
          .limit(5);
      } catch (runsError) {
        console.error("⚠️ PIPELINE_RUNS_QUERY_FAILED:", runsError);
        // Fallback: try to get only basic columns
        try {
          console.log("🔄 TRYING_BASIC_PIPELINE_QUERY...");
          runs = await db
            .select({
              id: pipelineRuns.id,
              status: pipelineRuns.status,
              errorMessage: pipelineRuns.errorMessage,
              fixApplied: pipelineRuns.fixApplied,
              confidence: pipelineRuns.confidence,
              createdAt: pipelineRuns.createdAt,
            })
            .from(pipelineRuns)
            .where(eq(pipelineRuns.repoId, repoId))
            .orderBy(desc(pipelineRuns.createdAt))
            .limit(5);
          console.log("✅ BASIC_PIPELINE_QUERY_SUCCESS");
        } catch (basicError) {
          console.error("❌ BASIC_PIPELINE_QUERY_FAILED:", basicError);
          runs = []; // Empty array as ultimate fallback
        }
      }

      // Calculate stats
      const totalRuns = runs.length
      const fixesApplied = runs.filter(run => run.status === 'fixed').length
      const successRate = totalRuns > 0 ? Math.round((fixesApplied / totalRuns) * 100) : 0
      const timeSaved = fixesApplied * 2 // 2 hours per fix

      // Try to get GitHub repo info
      let githubInfo = null
      try {
        const tokenRecord = await db
          .select()
          .from(githubTokens)
          .where(eq(githubTokens.userId, userId))
          .limit(1)
        
        if (tokenRecord.length > 0) {
          // For now, we'll just set basic GitHub info
          // TODO: Implement GitHub API call if needed
          githubInfo = {
            id: repo.githubId ? parseInt(repo.githubId) : repo.id,
            name: repo.name,
            full_name: repo.fullName,
            description: null,
            html_url: `https://github.com/${repo.fullName}`,
            private: false,
            language: null,
            stargazers_count: 0,
            pushed_at: repo.createdAt?.toISOString() || new Date().toISOString()
          }
        }
      } catch (error) {
        console.log('Could not fetch GitHub info:', error)
      }

      const responseData = {
        success: true,
        repo: {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          userId: repo.userId,
          isActive: repo.isActive || false,
          autoFixEnabled: repo.autoFixEnabled || false,
          healthStatus: repo.healthStatus || 'pending',
          lastScanAt: repo.lastScanAt || null,
          createdAt: repo.createdAt,
          webhookId: repo.webhookId || null,
          github: githubInfo ? {
            description: githubInfo.description,
            stars: githubInfo.stargazers_count,
            language: githubInfo.language,
            lastPush: githubInfo.pushed_at,
          } : null,
        },
        stats: {
          totalRuns,
          fixesApplied,
          successRate,
          timeSaved,
        },
        recentRuns: runs.map(run => ({
          id: run.id,
          status: run.status,
          errorMessage: run.errorMessage,
          fixApplied: run.fixApplied,
          confidence: run.confidence,
          createdAt: run.createdAt,
          // AI fields - use null if they don't exist
          aiExplanation: run.aiExplanation || null,
          aiFixSuggestion: run.aiFixSuggestion || null,
          aiCodeFix: run.aiCodeFix || null,
          aiSeverity: run.aiSeverity || null,
          aiCategory: run.aiCategory || null,
          aiConfidence: run.confidence || null,
        })),
      }

      console.log("📤 SENDING_RESPONSE:", {
        hasRepo: !!responseData.repo,
        repoId: responseData.repo?.id,
        repoName: responseData.repo?.name,
        statsCount: Object.keys(responseData.stats).length,
        runsCount: responseData.recentRuns.length
      })

      return Response.json(responseData)
    } catch (error) {
      console.error('Failed to fetch repo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return Response.json({ 
        error: 'Failed to fetch repository details',
        details: errorMessage,
        repo: null,
        stats: null,
        recentRuns: []
      }, { status: 500 })
    }
  },
  {
    requireAuth: true,
    rateLimit: apiRateLimit,
    validateContentType: false,
  }
)

// Secure DELETE endpoint  
const deleteHandler = secureAPIRoute(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { userId } = auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const repoId = parseInt(params.id)
      
      if (isNaN(repoId)) {
        return Response.json({ error: 'Invalid repository ID' }, { status: 400 })
      }

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1)
      
      if (user.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      // Verify ownership and delete
      const result = await db
        .delete(repos)
        .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
        .returning()

      if (result.length === 0) {
        return Response.json({ error: 'Repository not found' }, { status: 404 })
      }

      // TODO: Also delete webhook from GitHub
      // const githubToken = req.cookies.get('github_token')?.value
      // if (githubToken && result[0].webhookId) {
      //   await deleteWebhook(githubToken, owner, repo, result[0].webhookId)
      // }

      return Response.json({ success: true })
    } catch (error) {
      console.error('Repository delete API error:', error)
      return Response.json({ error: 'Failed to delete repository' }, { status: 500 })
    }
  },
  {
    requireAuth: true,
    rateLimit: apiRateLimit,
    validateContentType: false,
  }
)

// Secure PATCH endpoint
const patchHandler = secureAPIRoute(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { userId } = auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const repoId = parseInt(params.id)
      
      if (isNaN(repoId)) {
        return Response.json({ error: 'Invalid repository ID' }, { status: 400 })
      }

      const body = await req.json()
      const { autoFixEnabled, healthStatus, isActive } = body

      // Verify repo ownership
      const existing = await db
        .select()
        .from(repos)
        .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
        .limit(1)

      if (existing.length === 0) {
        return Response.json({ error: 'Repository not found' }, { status: 404 })
      }

      // Update repo with provided fields
      const updateData: any = {}
      if (typeof autoFixEnabled === 'boolean') updateData.autoFixEnabled = autoFixEnabled
      if (healthStatus) updateData.healthStatus = healthStatus
      if (typeof isActive === 'boolean') updateData.isActive = isActive
      
      // Update last scan time if requested
      if (body.refreshScan) {
        updateData.lastScanAt = new Date()
      }

      const [updatedRepo] = await db
        .update(repos)
        .set(updateData)
        .where(eq(repos.id, repoId))
        .returning()

      console.log("🔧 REPO_UPDATED:", { repoId, updates: Object.keys(updateData) })

      return Response.json({
        success: true,
        repo: updatedRepo
      })
    } catch (error) {
      console.error('Repository update API error:', error)
      return Response.json({ error: 'Failed to update repository' }, { status: 500 })
    }
  },
  {
    requireAuth: true,
    rateLimit: apiRateLimit,
    validateContentType: true,
  }
)

export { getHandler as GET, patchHandler as PATCH, deleteHandler as DELETE }
