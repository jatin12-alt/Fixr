import http from 'k6/http'
import { check, sleep, group } from 'k6'

/**
 * Database Load Test for Fixr
 * 
 * Test concurrent database operations:
 * - 10 users simultaneously reading analytics
 * - 5 users connecting repos
 * - 20 users viewing dashboards
 * 
 * Verify no connection pool exhaustion
 */

export const options = {
  stages: [
    { duration: '30s', target: 35 },   // Ramp up to 35 concurrent users
    { duration: '2m', target: 35 },   // Steady state
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% under 3s for DB operations
    http_req_failed: ['rate<0.05'],      // Less than 5% errors
  },
}

const BASE_URL = __ENV.BASE_URL || 'https://fixr.vercel.app'

// Simulate analytics dashboard load (heavy read)
export function readAnalytics() {
  group('Analytics Dashboard Load', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    }
    
    const response = http.get(`${BASE_URL}/api/analytics?range=30d`, params)
    
    check(response, {
      'analytics read successful': (r) => r.status === 200,
      'analytics DB query time < 2000ms': (r) => r.timings.waiting < 2000,
    })
  })
}

// Simulate repo connection (write operation)
export function connectRepository() {
  group('Repository Connection', () => {
    const payload = JSON.stringify({
      repoFullName: `test-org/test-repo-${Math.floor(Math.random() * 1000)}`,
      owner: 'test-org',
      repo: `test-repo-${Math.floor(Math.random() * 1000)}`,
    })
    
    const params = {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
        'Content-Type': 'application/json',
      },
    }
    
    const response = http.post(`${BASE_URL}/api/repositories/connect`, payload, params)
    
    check(response, {
      'repo connect successful or already exists': (r) => [200, 201, 409].includes(r.status),
      'repo connect DB time < 1500ms': (r) => r.timings.waiting < 1500,
    })
  })
}

// Simulate dashboard view (mixed read operations)
export function viewDashboard() {
  group('Dashboard View', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    }
    
    // Multiple parallel requests that would happen on dashboard load
    const responses = http.batch([
      ['GET', `${BASE_URL}/api/repositories`, null, params],
      ['GET', `${BASE_URL}/api/notifications?limit=5`, null, params],
      ['GET', `${BASE_URL}/api/analytics?range=7d`, null, params],
    ])
    
    check(responses[0], {
      'repositories load successful': (r) => r.status === 200,
      'repositories DB time < 1000ms': (r) => r.timings.waiting < 1000,
    })
    
    check(responses[1], {
      'notifications load successful': (r) => r.status === 200,
      'notifications DB time < 500ms': (r) => r.timings.waiting < 500,
    })
    
    check(responses[2], {
      'analytics load successful': (r) => r.status === 200,
      'analytics DB time < 2000ms': (r) => r.timings.waiting < 2000,
    })
  })
}

// Simulate notification read/update (read + write)
export function notificationOperations() {
  group('Notification Operations', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    }
    
    // First, get notifications
    const getResponse = http.get(`${BASE_URL}/api/notifications?limit=10`, params)
    
    check(getResponse, {
      'notifications fetch successful': (r) => r.status === 200,
      'notifications fetch DB time < 500ms': (r) => r.timings.waiting < 500,
    })
    
    // If we have notifications, mark some as read
    if (getResponse.status === 200) {
      const data = JSON.parse(getResponse.body)
      
      if (data.notifications && data.notifications.length > 0) {
        const unreadIds = data.notifications
          .filter((n) => !n.read)
          .slice(0, 3)
          .map((n) => n.id)
        
        if (unreadIds.length > 0) {
          const markReadPayload = JSON.stringify({ ids: unreadIds })
          const markReadParams = {
            headers: {
              ...params.headers,
              'Content-Type': 'application/json',
            },
          }
          
          const markReadResponse = http.patch(
            `${BASE_URL}/api/notifications`,
            markReadPayload,
            markReadParams
          )
          
          check(markReadResponse, {
            'mark as read successful': (r) => r.status === 200,
            'mark as read DB time < 500ms': (r) => r.timings.waiting < 500,
          })
        }
      }
    }
  })
}

// Simulate team operations (multi-user scenarios)
export function teamOperations() {
  group('Team Operations', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    }
    
    // Get team list
    const teamsResponse = http.get(`${BASE_URL}/api/teams`, params)
    
    check(teamsResponse, {
      'teams fetch successful': (r) => r.status === 200,
      'teams fetch DB time < 1000ms': (r) => r.timings.waiting < 1000,
    })
    
    // If teams exist, get team details and members
    if (teamsResponse.status === 200) {
      const data = JSON.parse(teamsResponse.body)
      
      if (data.teams && data.teams.length > 0) {
        const teamId = data.teams[0].id
        
        const responses = http.batch([
          ['GET', `${BASE_URL}/api/teams/${teamId}`, null, params],
          ['GET', `${BASE_URL}/api/teams/${teamId}/members`, null, params],
          ['GET', `${BASE_URL}/api/teams/${teamId}/audit`, null, params],
        ])
        
        check(responses[0], {
          'team details fetch successful': (r) => r.status === 200,
        })
        
        check(responses[1], {
          'team members fetch successful': (r) => r.status === 200,
          'team members DB time < 800ms': (r) => r.timings.waiting < 800,
        })
        
        check(responses[2], {
          'audit logs fetch successful': (r) => r.status === 200,
          'audit logs DB time < 1000ms': (r) => r.timings.waiting < 1000,
        })
      }
    }
  })
}

// Default function - simulates different user behaviors
export default function () {
  const random = Math.random()
  
  // 57% of users: Dashboard view (20 users out of 35)
  if (random < 0.57) {
    viewDashboard()
    sleep(Math.random() * 2 + 1)
  }
  
  // 28% of users: Analytics heavy read (10 users out of 35)
  else if (random < 0.85) {
    readAnalytics()
    sleep(Math.random() * 3 + 2)
  }
  
  // 10% of users: Notification operations
  else if (random < 0.95) {
    notificationOperations()
    sleep(Math.random() * 1 + 0.5)
  }
  
  // 5% of users: Team operations
  else {
    teamOperations()
    sleep(Math.random() * 2 + 1)
  }
  
  // 14% of users (interleaved): Repo connection (5 users out of 35)
  // This runs in parallel with other operations
  if (Math.random() < 0.14) {
    connectRepository()
    sleep(Math.random() * 2 + 1)
  }
}

export function setup() {
  console.log('Database Load Test Starting...')
  console.log(`Target: ${BASE_URL}`)
  console.log('Simulating:')
  console.log('  - 20 users viewing dashboards concurrently')
  console.log('  - 10 users loading analytics (heavy DB reads)')
  console.log('  - 5 users connecting repositories (DB writes)')
  console.log('  - Mixed notification and team operations')
  
  // Verify connection
  const response = http.get(`${BASE_URL}/api/health/database`)
  if (response.status !== 200) {
    console.error('Database health check failed!')
    return { abort: true }
  }
  
  const data = JSON.parse(response.body)
  console.log(`Database status: ${data.status}`)
  console.log(`Connection latency: ${data.latency}ms`)
  
  return {}
}

export function teardown(data) {
  if (data.abort) {
    console.error('Test aborted due to setup failure')
    return
  }
  
  console.log('Database Load Test Completed')
  console.log('Check for:')
  console.log('  - Connection pool exhaustion errors')
  console.log('  - Query timeout errors')
  console.log('  - Deadlock errors')
  console.log('  - High latency spikes')
}
