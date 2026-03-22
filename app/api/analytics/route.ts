import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { 
  getOverallStats, 
  getPipelineTrend, 
  getErrorBreakdown, 
  getRepoLeaderboard, 
  getHourlyHeatmap, 
  getFixTimeline 
} from '@/lib/analytics'
import { format, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : subDays(new Date(), 30)
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()
    const repoId = searchParams.get('repoId') || undefined
    const days = parseInt(searchParams.get('days') || '30')

    // Fetch all analytics data in parallel
    const [
      kpis,
      trend,
      errorBreakdown,
      repoLeaderboard,
      heatmap,
      recentFixes
    ] = await Promise.all([
      getOverallStats(userId, { startDate, endDate }),
      getPipelineTrend(userId, repoId, days),
      getErrorBreakdown(userId, repoId),
      getRepoLeaderboard(userId),
      getHourlyHeatmap(userId),
      getFixTimeline(userId),
    ])

    const response = {
      kpis,
      trend,
      errorBreakdown,
      repoLeaderboard,
      heatmap,
      recentFixes,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    }

    // Cache for 5 minutes
    return Response.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'CDN-Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
