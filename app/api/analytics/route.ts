import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { 
  getOverallStats, 
  getPipelineTrend, 
  getErrorBreakdown, 
  getRepoLeaderboard, 
  getHourlyHeatmap, 
  getFixTimeline 
} from '@/lib/analytics'
import { subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'CDN-Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
