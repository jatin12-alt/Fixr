import { Html } from '@react-email/html'
import { Text } from '@react-email/text'
import { Section } from '@react-email/section'
import { Container } from '@react-email/container'
import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'

interface PipelineFailedEmailProps {
  repoName: string
  errorSummary: string
  repoUrl: string
}

export function PipelineFailedEmail({ repoName, errorSummary, repoUrl }: PipelineFailedEmailProps) {
  return (
    <Html>
      <Container style={container}>
        <Heading style={heading}>Pipeline Failed: {repoName}</Heading>
        
        <Section style={section}>
          <Text style={text}>
            Your pipeline for <strong>{repoName}</strong> has failed.
          </Text>
          
          <Text style={text}>
            <strong>Error Summary:</strong>
          </Text>
          <Text style={errorText}>{errorSummary}</Text>
          
          <Text style={text}>
            Fixr AI is analyzing the failure and will attempt to fix it automatically.
          </Text>
        </Section>

        <Section style={buttonSection}>
          <Button href={repoUrl} style={button}>
            View Pipeline Details
          </Button>
        </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            You're receiving this email because you have pipeline failure notifications enabled.
          </Text>
          <Text style={footerText}>
            To manage your notification preferences, visit your{' '}
            <a href="https://fixr.ai/dashboard/settings/notifications" style={link}>
              notification settings
            </a>.
          </Text>
        </Section>
      </Container>
    </Html>
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
    <Html>
      <Container style={container}>
        <Heading style={heading}>
          AI Analysis Complete: {repoName}
        </Heading>
        
        <Section style={section}>
          <Text style={text}>
            Fixr AI has completed analysis of your pipeline failure for <strong>{repoName}</strong>.
          </Text>
          
          <Text style={text}>
            <strong>Result:</strong>
          </Text>
          <Text style={resultText}>{result}</Text>
          
          {fixApplied && (
            <Text style={successText}>
              ✅ An automatic fix has been applied to your repository.
            </Text>
          )}
        </Section>

        <Section style={buttonSection}>
          <Button href={repoUrl} style={button}>
            {fixApplied ? 'View Fix Details' : 'View Analysis Details'}
          </Button>
        </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            You're receiving this email because you have AI fix notifications enabled.
          </Text>
        </Section>
      </Container>
    </Html>
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
  return (
    <Html>
      <Container style={container}>
        <Heading style={heading}>Your Weekly Fixr Digest</Heading>
        
        <Section style={section}>
          <Text style={text}>
            Here's your pipeline health summary for the past week:
          </Text>
          
          <div style={statsGrid}>
            <div style={statCard}>
              <Text style={statNumber}>{totalRuns}</Text>
              <Text style={statLabel}>Total Runs</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{successRate.toFixed(1)}%</Text>
              <Text style={statLabel}>Success Rate</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{fixesApplied}</Text>
              <Text style={statLabel}>AI Fixes Applied</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{timeSaved.toFixed(1)}h</Text>
              <Text style={statLabel}>Time Saved</Text>
            </div>
          </div>
        </Section>

        {topRepos.length > 0 && (
          <Section style={section}>
            <Text style={subheading}>Top Repositories</Text>
            {topRepos.map((repo, index) => (
              <div key={index} style={repoRow}>
                <Text style={repoName}>{repo.name}</Text>
                <Text style={repoStats}>
                  {repo.runs} runs • {repo.successRate.toFixed(1)}% success
                </Text>
              </div>
            ))}
          </Section>
        )}

        <Section style={buttonSection}>
          <Button href="https://fixr.ai/dashboard/analytics" style={button}>
            View Full Analytics
          </Button>
        </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            You're receiving this email because you have weekly digest enabled.
          </Text>
        </Section>
      </Container>
    </Html>
  )
}

// Styles
const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#000000',
  color: '#ffffff',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#ffffff',
}

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '10px',
  color: '#ffffff',
}

const section = {
  marginBottom: '30px',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#d1d5db',
  marginBottom: '16px',
}

const errorText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#ef4444',
  backgroundColor: '#1f2937',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
}

const resultText = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#10b981',
  backgroundColor: '#1f2937',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
}

const successText = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#10b981',
  marginBottom: '16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
}

const button = {
  backgroundColor: '#06b6d4',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 'bold',
}

const footerSection = {
  borderTop: '1px solid #374151',
  paddingTop: '20px',
}

const footerText = {
  fontSize: '14px',
  color: '#9ca3af',
  marginBottom: '8px',
}

const link = {
  color: '#06b6d4',
  textDecoration: 'underline',
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  marginBottom: '20px',
}

const statCard = {
  backgroundColor: '#1f2937',
  padding: '16px',
  borderRadius: '6px',
  textAlign: 'center' as const,
}

const statNumber = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#06b6d4',
  marginBottom: '4px',
}

const statLabel = {
  fontSize: '14px',
  color: '#9ca3af',
}

const repoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #374151',
}

const repoName = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#ffffff',
}

const repoStats = {
  fontSize: '14px',
  color: '#9ca3af',
}
