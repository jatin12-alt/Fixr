import http from 'k6/http'
import { check, sleep } from 'k6'

/**
 * API Load Test for Fixr
 * 
 * Test scenario:
 * 1. Ramp up: 0 → 50 users over 1 minute
 * 2. Steady: 50 users for 3 minutes  
 * 3. Ramp down: 50 → 0 over 1 minute
 * 
 * Targets:
 * - GET /api/health (public, should handle 100+ RPS)
 * - GET /api/notifications (auth required)
 * - GET /api/analytics (heavy DB query)
 * - POST /api/webhooks/github (webhook processing)
 */

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Steady state
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],      // Less than 1% errors
    http_reqs: ['rate>100'],             // More than 100 RPS for health endpoint
  },
}

const BASE_URL = __ENV.BASE_URL || 'https://fixr.vercel.app'

// Health check endpoint (public)
export function testHealthEndpoint() {
  const response = http.get(`${BASE_URL}/api/health`)
  
  check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
    'health has status field': (r) => JSON.parse(r.body).status !== undefined,
  })
  
  return response
}

// Notifications endpoint (authenticated)
export function testNotificationsEndpoint() {
  // Using a test token - in real scenarios, generate valid tokens
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
    },
  }
  
  const response = http.get(`${BASE_URL}/api/notifications`, params)
  
  check(response, {
    'notifications status is 200 or 401': (r) => [200, 401].includes(r.status),
    'notifications response time < 1000ms': (r) => r.timings.duration < 1000,
  })
  
  return response
}

// Analytics endpoint (heavy DB query)
export function testAnalyticsEndpoint() {
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
    },
  }
  
  const response = http.get(`${BASE_URL}/api/analytics?range=7d`, params)
  
  check(response, {
    'analytics status is 200 or 401': (r) => [200, 401].includes(r.status),
    'analytics response time < 3000ms': (r) => r.timings.duration < 3000,
  })
  
  return response
}

// Webhook endpoint (POST)
export function testWebhookEndpoint() {
  const payload = JSON.stringify({
    action: 'completed',
    workflow_job: {
      id: 123456789,
      run_id: 987654321,
      name: 'Test Workflow',
      conclusion: 'failure',
    },
    repository: {
      full_name: 'test-org/test-repo',
      id: 12345,
    },
  })
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'workflow_job',
      'X-Hub-Signature-256': 'sha256=test-signature',
    },
  }
  
  const response = http.post(`${BASE_URL}/api/webhook/github`, payload, params)
  
  check(response, {
    'webhook status is 200 or 401': (r) => [200, 401, 204].includes(r.status),
    'webhook response time < 500ms': (r) => r.timings.duration < 500,
  })
  
  return response
}

// Database health check
export function testDatabaseHealth() {
  const response = http.get(`${BASE_URL}/api/health/database`)
  
  check(response, {
    'db health status is 200 or 503': (r) => [200, 503].includes(r.status),
    'db health response time < 1000ms': (r) => r.timings.duration < 1000,
  })
  
  return response
}

// Main test function
export default function () {
  // Test health endpoint (high frequency, should handle 100+ RPS)
  testHealthEndpoint()
  
  sleep(0.1)  // Small delay between requests
  
  // Test notifications (10% of requests)
  if (Math.random() < 0.1) {
    testNotificationsEndpoint()
    sleep(0.2)
  }
  
  // Test analytics (5% of requests - heavy operation)
  if (Math.random() < 0.05) {
    testAnalyticsEndpoint()
    sleep(0.5)
  }
  
  // Test webhook (2% of requests)
  if (Math.random() < 0.02) {
    testWebhookEndpoint()
    sleep(0.1)
  }
  
  // Test database health (5% of requests)
  if (Math.random() < 0.05) {
    testDatabaseHealth()
    sleep(0.2)
  }
  
  // Random sleep between 1-3 seconds to simulate realistic user behavior
  sleep(Math.random() * 2 + 1)
}

// Run once before the test
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`)
  console.log(`Test token: ${__ENV.TEST_TOKEN ? 'Set' : 'Not set (some tests may fail)'}`)
  
  // Verify base URL is reachable
  const response = http.get(`${BASE_URL}/api/health`)
  if (response.status !== 200) {
    console.error(`Base URL ${BASE_URL} is not reachable!`)
    return { abort: true }
  }
  
  console.log('Base URL is reachable. Starting load test...')
  return {}
}

// Run once after the test
export function teardown(data) {
  if (data.abort) {
    console.error('Load test was aborted due to setup failure')
    return
  }
  
  console.log('Load test completed successfully')
}
