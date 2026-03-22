import { db } from '@/lib/db'
import { format, subDays, startOfDay } from 'date-fns'

interface AnalyticsStats {
  totalRuns: number
  successRate: number
  totalFixes: number
  timeSaved: number
  healthScore: number
}

interface TrendData {
  date: string
  successCount: number
  failureCount: number
  successRate: number
}

interface ErrorBreakdown {
  errorType: string
  count: number
  percentage: number
}

interface RepoLeaderboard {
  repoName: string
  healthScore: number
  totalRuns: number
  successRate: number
  lastRun: string
}

interface HeatmapData {
  hour: number
  dayOfWeek: number
  failureCount: number
}

interface FixTimeline {
  id: string
  repoName: string
  fixDescription: string
  timeSaved: number
  appliedAt: string
}

export async function getOverallStats(
  userId: string,
  dateRange: { startDate: Date; endDate: Date }
): Promise<AnalyticsStats> {
  const { startDate, endDate } = dateRange

  const [totalRuns, successCount, totalFixes] = await Promise.all([
    db.pipeline.count({
      where: {
        repo: {
          owner: { id: userId },
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    db.pipeline.count({
      where: {
        repo: {
          owner: { id: userId },
        },
        status: 'success',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    db.notification.count({
      where: {
        user: { id: userId },
        type: 'AUTO_FIX_APPLIED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ])

  const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0
  const timeSaved = totalFixes * 2 // Average 2 hours saved per fix
  const healthScore = Math.min(100, successRate + (totalFixes * 0.5))

  return {
    totalRuns,
    successRate,
    totalFixes,
    timeSaved,
    healthScore,
  }
}

export async function getPipelineTrend(
  userId: string,
  repoId?: string,
  days: number = 30
): Promise<TrendData[]> {
  const endDate = new Date()
  const startDate = subDays(endDate, days)

  const pipelines = await db.pipeline.findMany({
    where: {
      repo: {
        owner: { id: userId },
        ...(repoId && { id: repoId }),
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by date
  const dailyData = new Map<string, { success: number; failure: number }>()

  for (let i = 0; i < days; i++) {
    const date = format(subDays(endDate, i), 'yyyy-MM-dd')
    dailyData.set(date, { success: 0, failure: 0 })
  }

  pipelines.forEach(pipeline => {
    const date = format(pipeline.createdAt, 'yyyy-MM-dd')
    const day = dailyData.get(date) || { success: 0, failure: 0 }
    
    if (pipeline.status === 'success') {
      day.success++
    } else {
      day.failure++
    }
    
    dailyData.set(date, day)
  })

  // Convert to array format
  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      successCount: data.success,
      failureCount: data.failure,
      successRate: data.success + data.failure > 0 
        ? (data.success / (data.success + data.failure)) * 100 
        : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getErrorBreakdown(
  userId: string,
  repoId?: string
): Promise<ErrorBreakdown[]> {
  const where = {
    repo: {
      owner: { id: userId },
      ...(repoId && { id: repoId }),
    },
    status: 'failure',
  }

  const failedPipelines = await db.pipeline.findMany({
    where,
    select: {
      id: true,
    },
  })

  // In a real implementation, you'd extract error types from logs
  // For now, we'll simulate common error types
  const errorTypes = [
    'Dependency Error',
    'Configuration Error', 
    'Test Failure',
    'Build Error',
    'Network Error',
  ]

  const breakdown = errorTypes.map(type => ({
    errorType: type,
    count: Math.floor(Math.random() * failedPipelines.length),
  }))

  const total = breakdown.reduce((sum, item) => sum + item.count, 0)

  return breakdown
    .map(item => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export async function getRepoLeaderboard(userId: string): Promise<RepoLeaderboard[]> {
  const repos = await db.repository.findMany({
    where: {
      owner: { id: userId },
    },
    include: {
      pipelines: {
        select: {
          status: true,
          createdAt: true,
        },
      },
    },
  })

  return repos
    .map(repo => {
      const totalRuns = repo.pipelines.length
      const successCount = repo.pipelines.filter(p => p.status === 'success').length
      const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0
      const lastRun = repo.pipelines.length > 0 
        ? repo.pipelines.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt.toISOString()
        : null

      const healthScore = Math.min(100, successRate + (totalRuns * 0.1))

      return {
        repoName: repo.name,
        healthScore,
        totalRuns,
        successRate,
        lastRun: lastRun || 'Never',
      }
    })
    .filter(repo => repo.totalRuns > 0)
    .sort((a, b) => b.healthScore - a.healthScore)
}

export async function getHourlyHeatmap(userId: string): Promise<HeatmapData[]> {
  const endDate = new Date()
  const startDate = subDays(endDate, 30) // Last 30 days

  const failedPipelines = await db.pipeline.findMany({
    where: {
      repo: {
        owner: { id: userId },
      },
      status: 'failure',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
  })

  const heatmap = Array.from({ length: 24 * 7 }, (_, index) => {
    const hour = index % 24
    const dayOfWeek = Math.floor(index / 24)
    return {
      hour,
      dayOfWeek,
      failureCount: 0,
    }
  })

  failedPipelines.forEach(pipeline => {
    const hour = pipeline.createdAt.getHours()
    const dayOfWeek = pipeline.createdAt.getDay()
    const index = dayOfWeek * 24 + hour
    
    if (heatmap[index]) {
      heatmap[index].failureCount++
    }
  })

  return heatmap
}

export async function getFixTimeline(userId: string, limit: number = 10): Promise<FixTimeline[]> {
  const fixes = await db.notification.findMany({
    where: {
      user: { id: userId },
      type: 'AUTO_FIX_APPLIED',
    },
    select: {
      id: true,
      message: true,
      repoName: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return fixes.map(fix => ({
    id: fix.id,
    repoName: fix.repoName || 'Unknown',
    fixDescription: fix.message,
    timeSaved: 2, // Average 2 hours saved per fix
    appliedAt: fix.createdAt.toISOString(),
  }))
}
