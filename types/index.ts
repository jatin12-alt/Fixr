export interface Repository {
  id: number
  userId: string
  githubId: string
  name: string
  fullName: string
  isActive: boolean
  autoMode: boolean
  autoFixEnabled: boolean
  webhookId: string | null
  createdAt: Date
}

export interface PipelineRun {
  id: number
  repoId: number
  githubRunId: string
  status: 'failed' | 'pending_fix' | 'fixed' | 'analysis_failed' | 'FIXED_AND_MERGED' | 'PR_CREATED_WAITING_REVIEW' | 'DIAGNOSTIC_REPORT_READY'
  errorMessage: string | null
  fixApplied: string | null
  confidence: number | null
  aiConfidence?: number | null
  createdAt: Date
  aiExplanation?: string | null
  aiFixSuggestion?: string | null
  aiCodeFix?: string | null
}

export interface DashboardStats {
  savings: string | number
  activeRepos: number
  fixesApplied: number
  timeSaved: number
  totalRuns: number
}

export interface GitHubWebhookEvent {
  action: string
  workflow_run?: {
    id: number
    conclusion: string
  }
  repository?: {
    full_name: string
  }
}

export interface DashboardData {
  repos: Repository[]
  recentRuns: Array<PipelineRun & {
    repo?: {
      name: string
      fullName: string
    }
  }>
  stats: DashboardStats
}
