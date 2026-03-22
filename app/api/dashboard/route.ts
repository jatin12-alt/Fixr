import { auth } from '@clerk/nextjs/server'
import { db, users, repos, pipelineRuns } from '@/lib/db'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)
    
    if (user.length === 0) {
      return Response.json({ 
        repos: [], 
        recentRuns: [],
        stats: { activeRepos: 0, fixesApplied: 0, timeSaved: 0, totalRuns: 0 }
      })
    }

    // Get user's repositories
    const userRepos = await db
      .select()
      .from(repos)
      .where(eq(repos.userId, user[0].id))

    // Get recent pipeline runs with repo info
    const recentRuns = await db
      .select({
        id: pipelineRuns.id,
        status: pipelineRuns.status,
        errorMessage: pipelineRuns.errorMessage,
        confidence: pipelineRuns.confidence,
        createdAt: pipelineRuns.createdAt,
        repo: {
          name: repos.name,
          fullName: repos.fullName
        }
      })
      .from(pipelineRuns)
      .leftJoin(repos, eq(pipelineRuns.repoId, repos.id))
      .where(eq(repos.userId, user[0].id))
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(10)

    // Calculate stats
    const totalRuns = recentRuns.length
    const fixesApplied = recentRuns.filter(run => run.status === 'fixed').length
    const timeSaved = fixesApplied * 2 // Estimate 2 hours per fix

    return Response.json({
      repos: userRepos,
      recentRuns,
      stats: {
        activeRepos: userRepos.filter(repo => repo.isActive).length,
        fixesApplied,
        timeSaved,
        totalRuns
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
