'use client'

import { useState, useEffect } from 'react'

interface ConnectionStatus {
  database: { status: string; error: string | null }
  firebaseAdmin: { status: string; error: string | null }
  firebaseClient: { status: string; error: string | null }
  environment: { status: string; vars: Record<string, string> }
}

export default function DebugPage() {
  const [connections, setConnections] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnections() {
      try {
        const response = await fetch('/api/test/connections')
        const data = await response.json()
        setConnections(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check connections')
      } finally {
        setLoading(false)
      }
    }

    checkConnections()
  }, [])

  if (loading) return <div className="p-8">Loading connection status...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!connections) return <div className="p-8">No connection data available</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Connection Status</h1>
      
      <div className="space-y-6">
        {/* Database */}
        <div className={`p-4 rounded-lg border ${
          connections.database.status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">Database</h2>
          <p className="mb-2">Status: <span className="font-mono">{connections.database.status}</span></p>
          {connections.database.error && (
            <p className="text-red-600 text-sm">Error: {connections.database.error}</p>
          )}
        </div>

        {/* Firebase Admin */}
        <div className={`p-4 rounded-lg border ${
          connections.firebaseAdmin.status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">Firebase Admin</h2>
          <p className="mb-2">Status: <span className="font-mono">{connections.firebaseAdmin.status}</span></p>
          {connections.firebaseAdmin.error && (
            <p className="text-red-600 text-sm">Error: {connections.firebaseAdmin.error}</p>
          )}
        </div>

        {/* Firebase Client */}
        <div className={`p-4 rounded-lg border ${
          connections.firebaseClient.status === 'configured' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">Firebase Client</h2>
          <p className="mb-2">Status: <span className="font-mono">{connections.firebaseClient.status}</span></p>
          {connections.firebaseClient.error && (
            <p className="text-red-600 text-sm">Error: {connections.firebaseClient.error}</p>
          )}
        </div>

        {/* Environment Variables */}
        <div className={`p-4 rounded-lg border ${
          connections.environment.status === 'complete' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p className="mb-2">Status: <span className="font-mono">{connections.environment.status}</span></p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.entries(connections.environment.vars).map(([key, status]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono">{key}:</span>
                <span className={status === 'present' ? 'text-green-600' : 'text-red-600'}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>If Database is not connected: Check DATABASE_URL in .env.local</li>
          <li>If Firebase Admin is not configured: Follow FIREBASE_ADMIN_SETUP.md</li>
          <li>If Environment variables are missing: Update your .env.local file</li>
        </ul>
      </div>
    </div>
  )
}
