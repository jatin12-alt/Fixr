import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface ServiceCheck {
  name: string
  check: () => Promise<boolean>
}

const services: ServiceCheck[] = [
  {
    name: 'API Server',
    check: async () => {
      // API server is running if we can execute this
      return true
    },
  },
  {
    name: 'Database',
    check: async () => {
      try {
        // Simple database ping
        await db.execute(sql`SELECT 1`)
        return true
      } catch {
        return false
      }
    },
  },
  {
    name: 'GitHub Integration',
    check: async () => {
      try {
        const response = await fetch('https://api.github.com/status', {
          next: { revalidate: 30 },
        })
        return response.ok
      } catch {
        return false
      }
    },
  },
  {
    name: 'AI Analysis Engine',
    check: async () => {
      try {
        // Check if Groq API is reachable
        if (!process.env.GROQ_API_KEY) {
          return false
        }
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          next: { revalidate: 30 },
        })
        return response.ok
      } catch {
        return false
      }
    },
  },
  {
    name: 'Webhook Processing',
    check: async () => {
      // Webhook processing is operational if API is up
      return true
    },
  },
]

export async function GET(req: NextRequest) {
  try {
    // Check all services
    const serviceResults = await Promise.all(
      services.map(async (service) => {
        const isUp = await service.check()
        return {
          name: service.name,
          status: isUp ? 'operational' : 'down' as 'operational' | 'degraded' | 'down',
          uptime: '99.9%', // Placeholder - would be calculated from monitoring data
          lastChecked: new Date().toLocaleTimeString(),
        }
      })
    )

    // Determine overall status
    const downCount = serviceResults.filter(s => s.status === 'down').length
    const degradedCount = serviceResults.filter(s => s.status === 'degraded').length
    
    let overall: 'operational' | 'degraded' | 'down' = 'operational'
    if (downCount > 0) {
      overall = 'down'
    } else if (degradedCount > 0) {
      overall = 'degraded'
    }

    // Sample incidents (would be fetched from database in production)
    const incidents = [
      {
        id: '1',
        title: 'Brief GitHub API Outage',
        status: 'resolved' as const,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'GitHub API experienced intermittent connectivity issues. All services restored.',
      },
      {
        id: '2',
        title: 'Database Maintenance',
        status: 'resolved' as const,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Scheduled database maintenance completed successfully.',
      },
    ]

    const response = {
      overall,
      services: serviceResults,
      incidents,
      timestamp: new Date().toISOString(),
    }

    // Return with cache headers (30 seconds)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'CDN-Cache-Control': 'public, max-age=30',
        'Vercel-CDN-Cache-Control': 'public, max-age=30',
      },
    })
    
  } catch (error) {
    console.error('Status check error:', error)
    
    return NextResponse.json(
      {
        overall: 'down' as const,
        services: services.map(s => ({
          name: s.name,
          status: 'down' as const,
          uptime: 'Unknown',
          lastChecked: new Date().toLocaleTimeString(),
        })),
        incidents: [],
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=10',
        },
      }
    )
  }
}
