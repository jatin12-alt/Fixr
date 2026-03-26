import { pgTable, text, timestamp, boolean, integer, serial, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const teamRoleEnum = pgEnum('team_role', ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
export const notificationTypeEnum = pgEnum('notification_type', [
  'PIPELINE_FAILED',
  'PIPELINE_RECOVERED', 
  'AI_ANALYSIS_COMPLETE',
  'AUTO_FIX_APPLIED',
  'REPO_CONNECTED'
])
export const healthStatusEnum = pgEnum('health_status', ['healthy', 'failed', 'pending'])

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  githubUsername: text('github_username'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const repos = pgTable('repos', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.clerkId),
  teamId: integer('team_id').references(() => teams.id),
  githubId: text('github_id').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true),
  autoMode: boolean('auto_mode').default(false),
  autoFixEnabled: boolean('auto_fix_enabled').default(false),
  healthStatus: healthStatusEnum('health_status').default('pending'),
  lastScanAt: timestamp('last_scan_at'),
  webhookId: text('webhook_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pipelineRuns = pgTable('pipeline_runs', {
  id: serial('id').primaryKey(),
  repoId: integer('repo_id').references(() => repos.id),
  githubRunId: text('github_run_id').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  fixApplied: text('fix_applied'),
  confidence: integer('confidence'),
  aiExplanation: text('ai_explanation'),
  aiFixSuggestion: text('ai_fix_suggestion'),
  aiCodeFix: text('ai_code_fix'),
  aiSeverity: text('ai_severity'),
  aiCategory: text('ai_category'),
  aiConfidence: integer('ai_confidence'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const githubTokens = pgTable('github_tokens', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.clerkId),
  encryptedToken: text('encrypted_token').notNull(),
  tokenExpiry: timestamp('token_expiry'),
  scope: text('scope').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used'),
})

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  avatarUrl: text('avatar_url'),
  createdBy: text('created_by').references(() => users.clerkId),
  createdAt: timestamp('created_at').defaultNow(),
})

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  userId: text('user_id').references(() => users.clerkId),
  role: teamRoleEnum('role').notNull().default('MEMBER'),
  joinedAt: timestamp('joined_at').defaultNow(),
})

export const teamInvites = pgTable('team_invites', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  email: text('email').notNull(),
  role: teamRoleEnum('role').notNull().default('MEMBER'),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.clerkId),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  repoName: text('repo_name'),
  repoId: integer('repo_id').references(() => repos.id),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  userId: text('user_id').references(() => users.clerkId),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: text('metadata'), // JSON string
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Repo = typeof repos.$inferSelect
export type NewRepo = typeof repos.$inferInsert
export type PipelineRun = typeof pipelineRuns.$inferSelect
export type NewPipelineRun = typeof pipelineRuns.$inferInsert
export type GitHubToken = typeof githubTokens.$inferSelect
export type NewGitHubToken = typeof githubTokens.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type TeamMember = typeof teamMembers.$inferSelect
export type NewTeamMember = typeof teamMembers.$inferInsert
export type TeamInvite = typeof teamInvites.$inferSelect
export type NewTeamInvite = typeof teamInvites.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert

// Enum types
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export type NotificationType = 'PIPELINE_FAILED' | 'PIPELINE_RECOVERED' | 'AI_ANALYSIS_COMPLETE' | 'AUTO_FIX_APPLIED' | 'REPO_CONNECTED'
