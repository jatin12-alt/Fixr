import { auth } from '@clerk/nextjs/server'
import { db, repos, pipelineRuns, users } from '@/lib/db'
import { eq, desc, and, gte, sql } from 'drizzle-orm'
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
  aiFixSuggestion?: string | null
  aiExplanation?: string | null
  aiCodeFix?: string | null
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
      
      // Calculate stats from repos and pipeline runs
      const stats = {
        activeRepos: userRepos.filter(repo => repo.isActive).length,
        fixesApplied: 0, // Will be updated from pipeline runs
        timeSaved: 0, // Will be calculated from fixesApplied
        totalRuns: 0, // Will be updated from pipeline runs
        savings: 0 // Will be calculated from timeSaved
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
          aiFixSuggestion: pipelineRuns.aiFixSuggestion,
          aiExplanation: pipelineRuns.aiExplanation,
          aiCodeFix: pipelineRuns.aiCodeFix,
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
      const fixesApplied = recentRuns.filter(run => run.status === 'fixed_and_merged').length
      const timeSaved = fixesApplied * 0.5 // 0.5 hours per fix as specified
      const savings = timeSaved * 50 // $50 per hour as specified

      console.log("📊 DASHBOARD_ANALYTICS_CALCULATED:", {
        totalRuns,
        fixesApplied,
        timeSaved,
        savings,
        recentRunsStatuses: recentRuns.map(r => ({ id: r.id, status: r.status }))
      })

      stats = {
        ...stats,
        totalRuns,
        fixesApplied,
        timeSaved,
        savings
      }
    } catch (runsError) {
      console.error('Dashboard API - Pipeline runs query failed:', runsError)
      // Continue with empty runs, keep repo stats
    }

    // 3. New analytics: Last 7 days failure vs fix
    const last7Days: { date: string; failures: number; fixes: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        failures: 0,
        fixes: 0
      })
    }

    // Populate analytics from recentRuns with proper failure/fix counting
    try {
      // Get all runs from the last 7 days for accurate analytics
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const allRunsLast7Days = await db
        .select({
          status: pipelineRuns.status,
          createdAt: pipelineRuns.createdAt
        })
        .from(pipelineRuns)
        .leftJoin(repos, eq(pipelineRuns.repoId, repos.id))
        .where(and(
          eq(repos.userId, userId),
          gte(pipelineRuns.createdAt, sevenDaysAgo)
        ))
        .orderBy(desc(pipelineRuns.createdAt))

      // Group by date and count failures vs fixes
      allRunsLast7Days.forEach(run => {
        const runDate = new Date(run.createdAt)
        const dayIndex = 6 - Math.floor((new Date().getTime() - runDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayIndex >= 0 && dayIndex < 7) {
          if (run.status === 'failure' || run.status === 'failed') {
            last7Days[dayIndex].failures++
          } else if (run.status === 'fixed_and_merged' || run.status === 'fixed') {
            last7Days[dayIndex].fixes++
          }
        }
      })

      console.log("📈 7-DAY_ANALYTICS_CALCULATED:", {
        totalRuns: allRunsLast7Days.length,
        failures: last7Days.reduce((sum, day) => sum + day.failures, 0),
        fixes: last7Days.reduce((sum, day) => sum + day.fixes, 0),
        dailyBreakdown: last7Days
      })
    } catch (e) {
      console.error("Failed to fetch 7-day stats:", e)
    }

    const responseData = {
      repos: userRepos,
      recentRuns,
      stats,
      analytics: last7Days
    }

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
