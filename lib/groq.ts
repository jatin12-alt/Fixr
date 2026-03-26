import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required')
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface GroqAnalysisResult {
  explanation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'syntax' | 'dependency' | 'test' | 'configuration' | 'runtime' | 'other'
  fixSuggestion: string
  codeFix?: string
  confidence: number
}

export async function analyzeErrorWithGroq(logs: string): Promise<GroqAnalysisResult> {
  try {
    console.log('🤖 Analyzing error with Groq AI...')
    
    const prompt = `Analyze this CI/CD pipeline failure and provide a structured response:

LOGS:
${logs}

Please analyze the failure and respond with a JSON object containing:
- explanation: Clear explanation of what went wrong
- severity: "low", "medium", "high", or "critical"
- category: "syntax", "dependency", "test", "configuration", "runtime", or "other"
- fixSuggestion: Step-by-step instructions to fix the issue
- codeFix: Actual code changes needed (if applicable)
- confidence: Number from 0-100 indicating confidence in the analysis

Respond only with valid JSON, no explanations.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert DevOps engineer specializing in CI/CD pipeline troubleshooting. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Groq AI')
    }

    const result = JSON.parse(content) as GroqAnalysisResult
    
    // Validate and sanitize the result
    return {
      explanation: result.explanation || 'Unable to analyze the error logs.',
      severity: ['low', 'medium', 'high', 'critical'].includes(result.severity) ? result.severity : 'medium',
      category: ['syntax', 'dependency', 'test', 'configuration', 'runtime', 'other'].includes(result.category) ? result.category : 'other',
      fixSuggestion: result.fixSuggestion || 'Review the error logs and fix the identified issues.',
      codeFix: result.codeFix,
      confidence: Math.min(100, Math.max(0, result.confidence || 50))
    }
  } catch (error) {
    console.error('❌ Groq analysis failed:', error)
    
    // Return a fallback result
    return {
      explanation: 'AI analysis failed. Please review the error logs manually.',
      severity: 'medium',
      category: 'other',
      fixSuggestion: 'Check the CI/CD logs for specific error details and address them manually.',
      codeFix: undefined,
      confidence: 0
    }
  }
}
