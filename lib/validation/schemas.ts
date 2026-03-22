import { z } from 'zod'

// Repository validation
export const repoConfigSchema = z.object({
  autoMode: z.boolean().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

export const connectRepoSchema = z.object({
  githubId: z.string().regex(/^\d+$/, 'Invalid GitHub ID'),
  name: z.string().min(1, 'Repository name required').max(100),
  fullName: z.string().min(1).max(200).regex(/^[^\/]+\/[^\/]+$/, 'Invalid repository format'),
})

// Webhook validation
export const githubWebhookSchema = z.object({
  action: z.string(),
  workflow_run: z.object({
    id: z.number(),
    name: z.string().optional(),
    conclusion: z.string(),
    head_sha: z.string().optional(),
  }).optional(),
  repository: z.object({
    full_name: z.string(),
    id: z.number(),
  }).optional(),
})

// Dashboard query validation
export const dashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['failed', 'pending_fix', 'fixed', 'analysis_failed']).optional(),
})

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Sanitization functions
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: URLs
}

export function sanitizeRepoName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '') // Only allow alphanumeric, dash, underscore, dot
    .slice(0, 100)
}
