import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users, repos, pipelineRuns } from '@/lib/db'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getUserRepos } from '@/lib/github/api'
import { GitHubTokenService } from '@/lib/services/github-tokens'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'
import { validateInput, connectRepoSchema } from '@/lib/validation/schemas'

// Secure GET endpoint
const getHandler = secureAPIRoute(
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

      // Get repository
      const repo = await db
        .select()
        .from(repos)
        .where(and(eq(repos.id, repoId), eq(repos.userId, user[0].id)))
        .limit(1)
      
      if (repo.length === 0) {
        return Response.json({ error: 'Repository not found' }, { status: 404 })
      }

      // Get pipeline runs
      const runs = await db
        .select()
        .from(pipelineRuns)
        .where(eq(pipelineRuns.repoId, repoId))
        .orderBy(desc(pipelineRuns.createdAt))
        .limit(20)

      // Calculate stats
      const totalRuns = runs.length
      const fixesApplied = runs.filter(run => run.status === 'fixed').length
      const successRate = totalRuns > 0 ? Math.round((fixesApplied / totalRuns) * 100) : 0
      const timeSaved = fixesApplied * 2 // 2 hours per fix

      // Try to get GitHub repo info
      let githubInfo = null
      try {
        const githubToken = await GitHubTokenService.getToken(userId)
        if (githubToken) {
          const userRepos = await getUserRepos(githubToken)
          githubInfo = userRepos.find(gr => gr.id.toString() === repo[0].githubId)
        }
      } catch (error) {
        console.log('Could not fetch GitHub info:', error)
      }

      return Response.json({
        repo: {
          ...repo[0],
          github: githubInfo ? {
            description: githubInfo.description,
            language: githubInfo.language,
            stargazers_count: githubInfo.stargazers_count,
            forks_count: githubInfo.forks_count,
            private: githubInfo.private,
            updated_at: githubInfo.updated_at
          } : null
        },
        runs,
        stats: {
          totalRuns,
          fixesApplied,
          successRate,
          avgFixTime: 15, // Average 15 minutes
          timeSaved
        }
      })
    } catch (error) {
      console.error('Repository detail API error:', error)
      return Response.json({ error: 'Failed to fetch repository details' }, { status: 500 })
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
        .where(and(eq(repos.id, repoId), eq(repos.userId, user[0].id)))
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

export { getHandler as GET, deleteHandler as DELETE }
