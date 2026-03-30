/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'

// Utility function to escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

interface PipelineFailedEmailProps {
  repoName: string
  errorSummary: string
  repoUrl: string
}

export function PipelineFailedEmail({ repoName, errorSummary, repoUrl }: PipelineFailedEmailProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff; font-family: Arial, sans-serif;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ffffff;">Pipeline Failed: ${escapeHtml(repoName)}</h1>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                Your pipeline for <strong>${escapeHtml(repoName)}</strong> has failed.
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                <strong>Error Summary:</strong>
              </p>
              <div style="font-size: 14px; line-height: 1.5; color: #ef4444; background-color: #1f2937; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                ${escapeHtml(errorSummary)}
              </div>
              
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                Fixr AI is analyzing the failure and will attempt to fix it automatically.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${escapeHtml(repoUrl)}" style="background-color: #06b6d4; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                View Pipeline Details
              </a>
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 20px;">
              <p style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">
                You're receiving this email because you have pipeline failure notifications enabled.
              </p>
              <p style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">
                To manage your notification preferences, visit your{' '}
                <a href="https://fixr.ai/dashboard/settings/notifications" style="color: #06b6d4; text-decoration: underline;">
                  notification settings
                </a>.
              </p>
            </div>
          </div>
        `
      }}
    />
  )
}

interface AIAnalysisCompleteEmailProps {
  repoName: string
  result: string
  fixApplied: boolean
  repoUrl: string
}

export function AIAnalysisCompleteEmail({ 
  repoName, 
  result, 
  fixApplied, 
  repoUrl 
}: AIAnalysisCompleteEmailProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff; font-family: Arial, sans-serif;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ffffff;">
              AI Analysis Complete: ${escapeHtml(repoName)}
            </h1>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                Fixr AI has completed analysis of your pipeline failure for <strong>${escapeHtml(repoName)}</strong>.
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                <strong>Result:</strong>
              </p>
              <div style="font-size: 14px; line-height: 1.5; color: #10b981; background-color: #1f2937; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                ${escapeHtml(result)}
              </div>
              
              ${fixApplied ? `
                <p style="font-size: 16px; line-height: 1.5; color: #10b981; margin-bottom: 16px;">
                  ✅ An automatic fix has been applied to your repository.
                </p>
              ` : ''}
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${escapeHtml(repoUrl)}" style="background-color: #06b6d4; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                ${fixApplied ? 'View Fix Details' : 'View Analysis Details'}
              </a>
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 20px;">
              <p style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">
                You're receiving this email because you have AI fix notifications enabled.
              </p>
            </div>
          </div>
        `
      }}
    />
  )
}

interface WeeklyDigestEmailProps {
  totalRuns: number
  successRate: number
  fixesApplied: number
  timeSaved: number
  topRepos: Array<{ name: string; runs: number; successRate: number }>
}

export function WeeklyDigestEmail({
  totalRuns,
  successRate,
  fixesApplied,
  timeSaved,
  topRepos
}: WeeklyDigestEmailProps) {
  const topReposHtml = topRepos.map((repo, index) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #374151;">
      <span style="font-size: 14px; font-weight: bold; color: #ffffff;">${escapeHtml(repo.name)}</span>
      <span style="font-size: 14px; color: #9ca3af;">
        ${repo.runs} runs • ${repo.successRate.toFixed(1)}% success
      </span>
    </div>
  `).join('')

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff; font-family: Arial, sans-serif;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ffffff;">Your Weekly Fixr Digest</h1>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; line-height: 1.5; color: #d1d5db; margin-bottom: 16px;">
                Here's your pipeline health summary for the past week:
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 4px;">${totalRuns}</div>
                  <div style="font-size: 14px; color: #9ca3af;">Total Runs</div>
                </div>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 4px;">${successRate.toFixed(1)}%</div>
                  <div style="font-size: 14px; color: #9ca3af;">Success Rate</div>
                </div>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 4px;">${fixesApplied}</div>
                  <div style="font-size: 14px; color: #9ca3af;">AI Fixes Applied</div>
                </div>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 4px;">${timeSaved.toFixed(1)}h</div>
                  <div style="font-size: 14px; color: #9ca3af;">Time Saved</div>
                </div>
              </div>
            </div>

            ${topRepos.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #ffffff;">Top Repositories</h2>
                ${topReposHtml}
              </div>
            ` : ''}

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://fixr.ai/dashboard/analytics" style="background-color: #06b6d4; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                View Full Analytics
              </a>
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 20px;">
              <p style="font-size: 14px; color: #9ca3af; margin-bottom: 8px;">
                You're receiving this email because you have weekly digest enabled.
              </p>
            </div>
          </div>
        `
      }}
    />
  )
}
