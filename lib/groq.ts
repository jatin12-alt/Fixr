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

INSTRUCTIONS:
1. Identify the core error from the logs and explain what went wrong.
2. If the failure is due to an intentional error (e.g., "throw new Error", "exit 1", or a clear test failure in a file like "test-fail.js"), instruct to REMOVE the error code or DELETE the file if it's a temporary test file.
3. suggest a plausible code change and place it in the codeFix field.
4. IMPORTANT: The "codeFix" field must contain ONLY the raw code or file content. Do NOT wrap it in markdown code blocks (no \`\`\` backticks).

Please respond with a JSON object exclusively containing these EXACT keys:
- "explanation": Clear explanation of what went wrong
- "severity": "low", "medium", "high", or "critical"
- "category": "syntax", "dependency", "test", "configuration", "runtime", or "other"
- "fixSuggestion": Step-by-step instructions or terminal commands to fix the issue
- "codeFix": The actual actionable code change or file content (RAW text, no triple backticks). Do NOT leave this null.
- "confidence": Number from 0-100 indicating confidence in the analysis

Respond ONLY with the JSON format requested. Do not wrap in markdown \`\`\`json blocks, just return the raw curly braces. Defaults for fields like codeFix should be empty string if no fix is possible, but strive to provide one.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert DevOps engineer specializing in CI/CD pipeline troubleshooting. Your output MUST be a strict, perfectly formed JSON object matching the requested schema. Do NOT include greeting text, conversational filler, or markdown code block formatting (like ```json).'
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

    let content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Groq AI')
    }

    // Defensive JSON extraction logic to prevent parsing crashes
    // If Groq ignored us and wrapped in markdown, rip it out
    content = content.replace(/^```json\s*/im, '').replace(/\s*```$/im, '').trim()
    
    // If there's still extra text, try to extract just the curly braces
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      content = jsonMatch[0]
    }

    let result: GroqAnalysisResult
    try {
      result = JSON.parse(content) as GroqAnalysisResult
    } catch (parseError) {
      console.error('Failed to parse Groq response JSON. Raw content:', content)
      throw new Error('Groq returned invalid JSON format')
    }
    
    // Validate and sanitize the result
    return {
      explanation: result.explanation || 'Unable to elaborate on the error logs.',
      severity: ['low', 'medium', 'high', 'critical'].includes(result.severity) ? result.severity : 'medium',
      category: ['syntax', 'dependency', 'test', 'configuration', 'runtime', 'other'].includes(result.category) ? result.category : 'other',
      fixSuggestion: result.fixSuggestion || 'Review the error logs manually.',
      codeFix: result.codeFix || result.fixSuggestion, // Prevent wasting the fix suggestion string if Groq leaves codeFix empty
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
