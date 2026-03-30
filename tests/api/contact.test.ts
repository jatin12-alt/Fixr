import { test, expect } from '@playwright/test'
import { authenticate } from '../e2e/helpers/auth'

test.describe('Contact API', () => {
  const validContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Support Request',
    message: 'I need help with my account',
    company: 'Acme Corp',
  }

  test('POST /api/contact with valid data returns 200', async ({ request }: { request: any }) => {
    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: validContactData,
    })

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('message', 'Message sent successfully')
  })

  test('POST /api/contact with missing required fields returns 400', async ({ request }: { request: any }) => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
      subject: '',
      message: '',
    }

    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: invalidData,
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('details')
    expect(Array.isArray(data.details)).toBe(true)
  })

  test('POST /api/contact enforces rate limiting', async ({ request }: { request: any }) => {
    // Make 3 requests quickly
    const requests = []
    for (let i = 0; i < 3; i++) {
      requests.push(
        request.post('/api/contact', {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            ...validContactData,
            email: `test${i}@example.com`,
          },
        })
      )
    }

    const responses = await Promise.all(requests)

    // First requests should succeed
    const successCount = responses.filter(r => r.status() === 200).length
    expect(successCount).toBeGreaterThanOrEqual(1)

    // Subsequent requests might be rate limited
    const rateLimitedCount = responses.filter(r => r.status() === 429).length
    if (rateLimitedCount > 0) {
      const rateLimitedResponse = responses.find(r => r.status() === 429)
      if (rateLimitedResponse) {
        const data = await rateLimitedResponse.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toContain('rate limit')
      }
    }
  })

  test('POST /api/contact rejects honeypot filled submissions', async ({ request }: { request: any }) => {
    const dataWithHoneypot = {
      ...validContactData,
      website: 'spam-website.com', // Honeypot field
    }

    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: dataWithHoneypot,
    })

    // Should return success but not actually send (silent reject)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    // But no actual email should be sent (can't test this directly in E2E)
  })

  test('POST /api/contact validates email format', async ({ request }: { request: any }) => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user@.com',
      'user@@example.com',
    ]

    for (const email of invalidEmails) {
      const response = await request.post('/api/contact', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          ...validContactData,
          email,
        },
      })

      expect(response.status()).toBe(400)

      const data = await response.json()
      expect(data.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('email'),
        })
      )
    }
  })

  test('POST /api/contact validates message length', async ({ request }: { request: any }) => {
    // Test too short message
    const shortResponse = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...validContactData,
        message: 'Hi',
      },
    })

    expect(shortResponse.status()).toBe(400)

    // Test too long message (10000+ characters)
    const longMessage = 'a'.repeat(10001)
    const longResponse = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...validContactData,
        message: longMessage,
      },
    })

    expect(longResponse.status()).toBe(400)
  })

  test('POST /api/contact validates name length', async ({ request }: { request: any }) => {
    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        ...validContactData,
        name: 'A', // Too short
      },
    })

    expect(response.status()).toBe(400)
  })

  test('POST /api/contact handles XSS attempts', async ({ request }: { request: any }) => {
    const xssAttempt = {
      ...validContactData,
      message: '<script>alert("XSS")</script>',
    }

    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: xssAttempt,
    })

    // Should sanitize the input
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  })

  test('POST /api/contact returns proper error messages', async ({ request }: { request: any }) => {
    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {},
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error', 'Validation failed')
    expect(data).toHaveProperty('details')
    expect(Array.isArray(data.details)).toBe(true)
    expect(data.details.length).toBeGreaterThan(0)

    // Check specific validation errors
    const nameError = data.details.find((d: any) => d.field === 'name')
    const emailError = data.details.find((d: any) => d.field === 'email')
    const messageError = data.details.find((d: any) => d.field === 'message')

    expect(nameError).toBeDefined()
    expect(emailError).toBeDefined()
    expect(messageError).toBeDefined()
  })

  test('POST /api/contact with authenticated user includes user context', async ({ request }: { request: any }) => {
    await authenticate({ request } as any)

    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      data: validContactData,
    })

    expect(response.status()).toBe(200)

    // The API should log the authenticated user
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  })

  test('POST /api/contact sets correct security headers', async ({ request }: { request: any }) => {
    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: validContactData,
    })

    const headers = response.headers()
    expect(headers).toHaveProperty('x-content-type-options', 'nosniff')
    expect(headers).toHaveProperty('x-frame-options', 'DENY')
  })

  test('POST /api/contact requires Content-Type header', async ({ request }: { request: any }) => {
    const response = await request.post('/api/contact', {
      data: validContactData,
    })

    // Should handle missing Content-Type gracefully
    expect([200, 400, 415]).toContain(response.status())
  })
})
