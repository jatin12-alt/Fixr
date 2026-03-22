import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Notifications API', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('GET /api/notifications returns paginated notifications', async ({ request }) => {
    const response = await request.get('/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('notifications')
    expect(data).toHaveProperty('pagination')
    expect(data).toHaveProperty('unreadCount')
    expect(Array.isArray(data.notifications)).toBe(true)
    expect(typeof data.unreadCount).toBe('number')
  })

  test('GET /api/notifications supports pagination', async ({ request }) => {
    const response = await request.get('/api/notifications?page=1&limit=10', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.pagination).toHaveProperty('page', 1)
    expect(data.pagination).toHaveProperty('limit', 10)
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination).toHaveProperty('totalPages')
  })

  test('GET /api/notifications filters by read status', async ({ request }) => {
    const response = await request.get('/api/notifications?read=false', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    // All returned notifications should be unread
    data.notifications.forEach((notification: any) => {
      expect(notification.read).toBe(false)
    })
  })

  test('PATCH /api/notifications marks as read', async ({ request }) => {
    const response = await request.patch('/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      data: {
        ids: ['1', '2'],
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('updatedCount')
  })

  test('PATCH /api/notifications marks all as read', async ({ request }) => {
    const response = await request.patch('/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      data: {
        markAll: true,
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('updatedCount')
  })

  test('DELETE /api/notifications deletes specific notifications', async ({ request }) => {
    const response = await request.delete('/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      data: {
        ids: ['1'],
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('deletedCount', 1)
  })

  test('unauthorized requests return 401', async ({ request }) => {
    const endpoints = [
      { method: 'GET', url: '/api/notifications' },
      { method: 'PATCH', url: '/api/notifications', data: {} },
      { method: 'DELETE', url: '/api/notifications', data: {} },
    ]

    for (const endpoint of endpoints) {
      const response = await request.fetch(endpoint.url, {
        method: endpoint.method,
        data: endpoint.data,
      })

      expect(response.status()).toBe(401)
    }
  })

  test('notification contains required fields', async ({ request }) => {
    const response = await request.get('/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    if (data.notifications.length > 0) {
      const notification = data.notifications[0]
      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('type')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('message')
      expect(notification).toHaveProperty('read')
      expect(notification).toHaveProperty('createdAt')
    }
  })

  test('GET /api/notifications supports type filtering', async ({ request }) => {
    const response = await request.get('/api/notifications?type=pipeline_failure', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    // All returned notifications should be of the specified type
    data.notifications.forEach((notification: any) => {
      expect(notification.type).toBe('pipeline_failure')
    })
  })

  test('GET /api/notifications supports date range filtering', async ({ request }) => {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = new Date().toISOString()

    const response = await request.get(
      `/api/notifications?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      }
    )

    expect(response.status()).toBe(200)

    const data = await response.json()
    // All returned notifications should be within the date range
    data.notifications.forEach((notification: any) => {
      const notificationDate = new Date(notification.createdAt)
      expect(notificationDate.getTime()).toBeGreaterThanOrEqual(new Date(startDate).getTime())
      expect(notificationDate.getTime()).toBeLessThanOrEqual(new Date(endDate).getTime())
    })
  })
})
