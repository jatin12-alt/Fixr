'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bug, Play, CheckCircle } from 'lucide-react'

export default function DebugTriggerPage() {
  const [isTriggering, setIsTriggering] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const triggerMockWorkflow = async () => {
    setIsTriggering(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debug/trigger-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repository: 'CodeSense-AI',
          action: 'trigger_failure'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to trigger workflow')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Bug className="h-8 w-8 text-cyan-400" />
            Fixr Debug Tools
          </h1>
          <p className="text-gray-400">
            Developer-only tools for testing the AI engine without real code changes
          </p>
        </div>

        <Card className="glass border-white/5 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Mock Workflow Trigger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              <p className="mb-2">This tool simulates a failed workflow run for CodeSense-AI to test:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>GitHub webhook processing</li>
                <li>Groq AI analysis</li>
                <li>Auto-fix branch creation</li>
                <li>Pull request generation</li>
              </ul>
            </div>

            <Button
              onClick={triggerMockWorkflow}
              disabled={isTriggering}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {isTriggering ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Triggering Mock Workflow...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Mock Workflow Failure
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Mock Workflow Triggered Successfully</span>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong>Environment:</strong> Development</p>
              <p><strong>Webhook Endpoint:</strong> /api/webhook/github</p>
              <p><strong>Test Repository:</strong> CodeSense-AI (ID: 3)</p>
              <p><strong>AI Model:</strong> llama-3.3-70b-versatile</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
