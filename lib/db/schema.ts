import { pgTable, text, timestamp, boolean, integer, serial } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  githubUsername: text('github_username'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const repos = pgTable('repos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  githubId: text('github_id').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true),
  autoMode: boolean('auto_mode').default(false),
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
  createdAt: timestamp('created_at').defaultNow(),
})

export const githubTokens = pgTable('github_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  encryptedToken: text('encrypted_token').notNull(),
  tokenExpiry: timestamp('token_expiry'),
  scope: text('scope').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used'),
})

export type User = typeof users.$inferSelect
export type Repo = typeof repos.$inferSelect
export type PipelineRun = typeof pipelineRuns.$inferSelect
export type GitHubToken = typeof githubTokens.$inferSelect
export type NewGitHubToken = typeof githubTokens.$inferInsert
