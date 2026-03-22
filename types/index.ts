export interface Repository {
  id: number
  userId: number
  githubId: string
  name: string
  fullName: string
  isActive: boolean
  autoMode: boolean
  webhookId: string | null
  createdAt: Date
}

export interface PipelineRun {
  id: number
  repoId: number
  githubRunId: string
  status: 'failed' | 'pending_fix' | 'fixed' | 'analysis_failed'
  errorMessage: string | null
  fixApplied: string | null
  confidence: number | null
  createdAt: Date
}

export interface DashboardStats {
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
