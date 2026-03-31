import { getAuth } from '@/lib/auth'
import { db, repos, pipelineRuns, users } from '@/lib/db'
import { eq, desc, and, gte, sql } from 'drizzle-orm'
import type { Repo } from '@/lib/db'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'

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

const getHandler = secureAPIRoute(
  async (req) => {
    const { userId } = await getAuth(req)
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }


    try {
      // Initialize variables
      let userRepos: Repo[] = []
      let recentRuns: RecentRun[] = []
      let stats = { ...FALLBACK_DATA.stats, savings: 0 }

      // Fetch repos and recent runs in parallel
      try {
        const [reposData, runsData] = await Promise.all([
          db.select().from(repos).where(eq(repos.userId, userId)),
          db.select({
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
        ])

        userRepos = reposData as Repo[]
        recentRuns = runsData as RecentRun[]

        // Calculate stats
        const fixesApplied = recentRuns.filter(run => run.status === 'fixed_and_merged' || run.status === 'fixed').length
        const timeSaved = fixesApplied * 0.5
        const savings = timeSaved * 50

        stats = {
          activeRepos: userRepos.filter(repo => repo.isActive).length,
          fixesApplied,
          timeSaved,
          totalRuns: recentRuns.length,
          savings
        }
      } catch (err) {
        // Silent failure in parallel fetch
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

        allRunsLast7Days.forEach(run => {
          if (!run.createdAt) return
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
      } catch (e) {
        // Silent failure in analytics
      }

      const responseData = {
        repos: userRepos,
        recentRuns,
        stats,
        analytics: last7Days
      }

      return Response.json(responseData)

    } catch (error) {
      return Response.json({
        ...FALLBACK_DATA,
        error: 'Dashboard temporarily unavailable'
      }, { status: 200 })
    }
  },
  {
    requireAuth: true,
    rateLimit: apiRateLimit
  }
)

export { getHandler as GET }
