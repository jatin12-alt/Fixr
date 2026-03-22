import { Octokit } from '@octokit/rest'

export function createGitHubClient(accessToken: string) {
  return new Octokit({ auth: accessToken })
}

export async function getUserRepos(accessToken: string) {
  const octokit = createGitHubClient(accessToken)
  const response = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50,
  })
  return response.data
}

export async function createWebhook(accessToken: string, owner: string, repo: string) {
  const octokit = createGitHubClient(accessToken)
  
  try {
    const response = await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
        content_type: 'json',
        secret: process.env.GITHUB_WEBHOOK_SECRET,
      },
      events: ['workflow_run'],
    })
    return response.data.id.toString()
  } catch (error) {
    console.error('Webhook creation failed:', error)
    throw error
  }
}

export async function getWorkflowRunLogs(accessToken: string, owner: string, repo: string, runId: string) {
  const octokit = createGitHubClient(accessToken)
  const response = await octokit.actions.downloadWorkflowRunLogs({
    owner,
    repo,
    run_id: parseInt(runId),
  })
  return response.data as string
}
