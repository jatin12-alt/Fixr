import { auth } from '@clerk/nextjs/server'
import { db, users, repos, pipelineRuns } from '@/lib/db'
import { eq, desc, sql } from 'drizzle-orm'
import type { Repo } from '@/lib/db'

// Fallback data structure when database fails
const FALLBACK_DATA = {
  repos: [],
  recentRuns: [],
  stats: { 
    activeRepos: 0, 
    fixesApplied: 0, 
    timeSaved: 0, 
    totalRuns: 0 
  }
}

type RecentRun = {
  id: number
  status: string
  errorMessage: string | null
  confidence: number | null
  createdAt: Date | null
  repo: {
    name: string
    fullName: string
  } | null
}

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Initialize with fallback data
    let userRepos: Repo[] = []
    let recentRuns: RecentRun[] = []
    let stats = FALLBACK_DATA.stats

    // Try to get user repositories
    try {
      userRepos = await db
        .select()
        .from(repos)
        .where(eq(repos.userId, userId))
      
      // Calculate stats from repos
      stats = {
        activeRepos: userRepos.filter(repo => repo.isActive).length,
        fixesApplied: 0,
        timeSaved: 0,
        totalRuns: 0
      }
      
      console.log("📊 DASHBOARD_REPOS_FOUND:", userRepos.length, "repos")
      console.log("📊 DASHBOARD_REPO_DATA:", userRepos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        isActive: repo.isActive,
        autoFixEnabled: repo.autoFixEnabled
      })))
    } catch (repoError) {
      console.error('Dashboard API - Repos query failed:', repoError)
      // Continue with empty repos
    }

    // Try to get recent pipeline runs
    try {
      recentRuns = await db
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
        .where(eq(repos.userId, userId))
        .orderBy(desc(pipelineRuns.createdAt))
        .limit(10)

      // Update stats with pipeline run data
      const totalRuns = recentRuns.length
      const fixesApplied = recentRuns.filter(run => run.status === 'fixed').length
      const timeSaved = fixesApplied * 2 // Estimate 2 hours per fix

      stats = {
        ...stats,
        totalRuns,
        fixesApplied,
        timeSaved
      }
    } catch (runsError) {
      console.error('Dashboard API - Pipeline runs query failed:', runsError)
      // Continue with empty runs, keep repo stats
    }

    const responseData = {
      repos: userRepos,
      recentRuns,
      stats
    }

    console.log("📤 DASHBOARD_SENDING_RESPONSE:", {
      reposCount: responseData.repos.length,
      runsCount: responseData.recentRuns.length,
      hasActiveRepos: responseData.stats.activeRepos > 0,
      sampleRepo: responseData.repos[0] ? {
        id: responseData.repos[0].id,
        name: responseData.repos[0].name
      } : null
    })

    return Response.json(responseData)

  } catch (error) {
    console.error('Dashboard API - Critical error:', error)
    // Always return a valid response, never crash
    return Response.json({
      ...FALLBACK_DATA,
      error: 'Dashboard temporarily unavailable'
    }, { status: 200 }) // Return 200 with fallback data
  }
}
