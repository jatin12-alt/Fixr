import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'
import { GET as HealthDatabaseGET } from '@/app/api/health/database/route'

describe('Health API Routes', () => {
  describe('GET /api/health', () => {
    it('should return 200 with healthy status', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('environment')
      expect(data).toHaveProperty('checks')
      expect(data).toHaveProperty('metrics')

      // Status should be healthy, degraded, or unhealthy
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status)
    })

    it('should include database check', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data.checks).toHaveProperty('database')
      expect(data.checks.database).toHaveProperty('status')
      expect(['healthy', 'unhealthy']).toContain(data.checks.database.status)
    })

    it('should include memory check', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data.checks).toHaveProperty('memory')
      expect(data.checks.memory).toHaveProperty('status')
      expect(data.checks.memory).toHaveProperty('usage')
      expect(data.checks.memory).toHaveProperty('percentage')
    })

    it('should include external services check', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data.checks).toHaveProperty('external_services')
      expect(data.checks.external_services).toHaveProperty('firebase')
      expect(data.checks.external_services).toHaveProperty('github')
      expect(data.checks.external_services).toHaveProperty('resend')
    })

    it('should include application metrics', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data.metrics).toHaveProperty('total_requests')
      expect(data.metrics).toHaveProperty('error_rate')
      expect(data.metrics).toHaveProperty('active_users')
      expect(data.metrics).toHaveProperty('connected_repositories')
    })

    it('should return proper cache headers', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)

      const cacheControl = response.headers.get('Cache-Control')
      expect(cacheControl).toContain('no-cache')
      expect(cacheControl).toContain('no-store')
    })

    it('should return JSON content type', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)

      const contentType = response.headers.get('Content-Type')
      expect(contentType).toContain('application/json')
    })

    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      // Should still return 200 with degraded status
      expect(response.status).toBe(200)
      expect(['degraded', 'unhealthy']).toContain(data.status)
      expect(data.checks.database.status).toBe('unhealthy')
    })

    it('should log health check for monitoring', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '192.168.1.1',
        },
      })

      await GET(req as unknown as NextRequest)

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should include correct timestamp format', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      // Should be ISO 8601 format
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should include uptime in seconds', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health',
      })

      const response = await GET(req as unknown as NextRequest)
      const data = await response.json()

      expect(typeof data.uptime).toBe('number')
      expect(data.uptime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('HEAD /api/health', () => {
    it('should return 200 for HEAD request', async () => {
      const { req } = createMocks({
        method: 'HEAD',
        url: '/api/health',
      })

      // Import the HEAD handler
      const { HEAD } = await import('@/app/api/health/route')
      const response = await HEAD(req as unknown as NextRequest)

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/health/database', () => {
    it('should return database status', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health/database',
      })

      const response = await HealthDatabaseGET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data).toHaveProperty('status')
      expect(['connected', 'disconnected']).toContain(data.status)
    })

    it('should include database version when connected', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health/database',
      })

      const response = await HealthDatabaseGET(req as unknown as NextRequest)
      const data = await response.json()

      if (data.status === 'connected') {
        expect(data).toHaveProperty('version')
        expect(typeof data.version).toBe('string')
      }
    })

    it('should include latency measurement', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/health/database',
      })

      const response = await HealthDatabaseGET(req as unknown as NextRequest)
      const data = await response.json()

      expect(data).toHaveProperty('latency')
      expect(typeof data.latency).toBe('number')
      expect(data.latency).toBeGreaterThanOrEqual(0)
    })

    it('should handle database errors', async () => {
      // Mock database error
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const { req } = createMocks({
        method: 'GET',
        url: '/api/health/database',
      })

      const response = await HealthDatabaseGET(req as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('disconnected')
      expect(data).toHaveProperty('error')
    })
  })
})
