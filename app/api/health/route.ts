import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorLogger } from '@/lib/error-logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime?: number
      error?: string
    }
    memory: {
      status: 'healthy' | 'warning' | 'critical'
      usage: NodeJS.MemoryUsage
      percentage: number
    }
    disk: {
      status: 'healthy' | 'warning' | 'critical'
      usage?: number
    }
    external_services: {
      clerk: 'healthy' | 'unhealthy'
      github: 'healthy' | 'unhealthy'
      resend: 'healthy' | 'unhealthy'
    }
  }
  metrics: {
    total_requests: number
    error_rate: number
    active_users: number
    connected_repositories: number
  }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: 'unhealthy'
      },
      memory: {
        status: 'healthy',
        usage: process.memoryUsage(),
        percentage: 0
      },
      disk: {
        status: 'healthy'
      },
      external_services: {
        clerk: 'healthy',
        github: 'healthy',
        resend: 'healthy'
      }
    },
    metrics: {
      total_requests: 0,
      error_rate: 0,
      active_users: 0,
      connected_repositories: 0
    }
  }

  try {
    // Check database connection
    const dbStartTime = Date.now()
    try {
      await db.$queryRaw`SELECT 1`
      const dbResponseTime = Date.now() - dbStartTime
      healthStatus.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime
      }
    } catch (error) {
      healthStatus.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
      healthStatus.status = 'degraded'
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed
    const memoryPercentage = (usedMemory / totalMemory) * 100

    healthStatus.checks.memory.usage = memoryUsage
    healthStatus.checks.memory.percentage = memoryPercentage

    if (memoryPercentage > 90) {
      healthStatus.checks.memory.status = 'critical'
      healthStatus.status = 'degraded'
    } else if (memoryPercentage > 75) {
      healthStatus.checks.memory.status = 'warning'
    }

    // Check external services (simple checks)
    const clerkKey = process.env.CLERK_SECRET_KEY
    healthStatus.checks.external_services.clerk = clerkKey ? 'healthy' : 'unhealthy'

    const githubKey = process.env.GITHUB_CLIENT_SECRET
    healthStatus.checks.external_services.github = githubKey ? 'healthy' : 'unhealthy'

    const resendKey = process.env.RESEND_API_KEY
    healthStatus.checks.external_services.resend = resendKey ? 'healthy' : 'unhealthy'

    // Get metrics (mock data for now)
    try {
      // TODO: Get actual metrics from database
      healthStatus.metrics = {
        total_requests: Math.floor(Math.random() * 10000),
        error_rate: Math.random() * 5, // percentage
        active_users: Math.floor(Math.random() * 100),
        connected_repositories: Math.floor(Math.random() * 50)
      }
    } catch (error) {
      console.log('Could not fetch metrics')
    }

    // Determine overall health
    const hasUnhealthyChecks = Object.values(healthStatus.checks).some(
      check => {
        if (typeof check === 'object' && 'status' in check) {
          return check.status === 'unhealthy'
        }
        return false
      }
    )
    
    const hasCriticalChecks = Object.values(healthStatus.checks).some(
      check => {
        if (typeof check === 'object' && 'status' in check) {
          return check.status === 'critical'
        }
        return false
      }
    )

    if (hasUnhealthyChecks || hasCriticalChecks) {
      healthStatus.status = hasCriticalChecks ? 'unhealthy' : 'degraded'
    }

    // Log health check for monitoring
    errorLogger.info('Health check completed', {
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      responseTime: Date.now() - startTime,
      healthStatus
    })

    // Return appropriate HTTP status
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503

    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    errorLogger.error('Health check failed', error instanceof Error ? error : new Error('Unknown error'), {
      url: req.url,
      method: req.method,
      responseTime: Date.now() - startTime
    })

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime()
    }, { status: 503 })
  }
}

// Health check for HEAD requests (for uptime monitoring)
export async function HEAD() {
  try {
    // Quick database check
    await db.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
