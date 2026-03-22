import { Groq } from 'groq-sdk'
import { createGitHubClient, getWorkflowRunLogs } from '@/lib/github/api'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

interface AnalysisResult {
  rootCause: string
  confidence: number
  fixSuggestion: string
  autoFixable: boolean
}

export async function analyzePipelineFailure(
  accessToken: string,
  owner: string,
  repo: string,
  runId: string
): Promise<AnalysisResult> {
  
  try {
    const logs = await getWorkflowRunLogs(accessToken, owner, repo, runId)
    const errorLines = extractErrors(logs.toString())
    
    const analysis = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Analyze CI/CD pipeline failures. Return JSON: 
          {
            "rootCause": "brief description", 
            "confidence": 85, 
            "fixSuggestion": "specific fix", 
            "autoFixable": true
          }`
        },
        {
          role: 'user',
          content: `Pipeline failed:\n${errorLines.join('\n')}`
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.1,
    })

    const response = analysis.choices[0].message.content || '{}'
    return parseAnalysisResponse(response)
  } catch (error) {
    console.error('Analysis error:', error)
    return {
      rootCause: 'Analysis failed',
      confidence: 0,
      fixSuggestion: 'Manual review required',
      autoFixable: false
    }
  }
}

function extractErrors(logs: string): string[] {
  const lines = logs.split('\n')
  const errorPatterns = [
    /error:/i,
    /failed/i,
    /cannot find/i,
    /module not found/i,
  ]
  
  return lines.filter(line => 
    errorPatterns.some(pattern => pattern.test(line))
  ).slice(0, 10)
}

function parseAnalysisResponse(response: string): AnalysisResult {
  try {
    const cleaned = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      rootCause: parsed.rootCause || 'Unknown error',
      confidence: parseInt(parsed.confidence) || 50,
      fixSuggestion: parsed.fixSuggestion || 'Manual review required',
      autoFixable: Boolean(parsed.autoFixable)
    }
  } catch (error) {
    return {
      rootCause: 'Parse failed',
      confidence: 0,
      fixSuggestion: 'Manual review required',
      autoFixable: false
    }
  }
}
