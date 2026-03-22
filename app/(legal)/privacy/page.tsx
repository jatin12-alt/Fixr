import { TableOfContents } from '@/components/legal/TableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import Link from 'next/link'

const tocItems = [
  { id: 'data-collection', title: 'What Data We Collect' },
  { id: 'data-usage', title: 'How We Use Your Data' },
  { id: 'data-storage', title: 'Data Storage & Security' },
  { id: 'third-parties', title: 'Third-Party Services' },
  { id: 'data-retention', title: 'Data Retention & Deletion' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'contact', title: 'Contact Information' },
]

export default function PrivacyPolicy() {
  const lastUpdated = 'March 21, 2026'

  return (
    <div className="lg:flex lg:gap-12">
      <TableOfContents items={tocItems} />
      
      <div className="flex-1">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          
          <p className="text-gray-400 text-lg">
            Your privacy is fundamental to how we build Fixr. This policy explains what data we collect, 
            how we use it, and your rights regarding your personal information.
          </p>
          
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <LegalSection id="data-collection" title="What Data We Collect">
          <p className="mb-4">
            We collect only the minimum data necessary to provide Fixr's AI-powered CI/CD monitoring service:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>GitHub OAuth Tokens:</strong> Encrypted access tokens to interact with your repositories</li>
            <li><strong>Repository Information:</strong> Names, descriptions, and basic metadata of repos you connect</li>
            <li><strong>Pipeline Data:</strong> Workflow run logs, failure messages, and analysis results</li>
            <li><strong>Account Information:</strong> Email address and basic profile data from your GitHub account</li>
            <li><strong>Usage Analytics:</strong> Anonymous usage data to improve our service</li>
          </ul>
          
          <p className="text-gray-400">
            We never store your GitHub password or any sensitive credentials beyond OAuth tokens.
          </p>
        </LegalSection>

        <LegalSection id="data-usage" title="How We Use Your Data">
          <p className="mb-4">
            Your data is used exclusively to provide and improve Fixr's services:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>AI Analysis:</strong> Analyze pipeline failures and suggest fixes</li>
            <li><strong>Dashboard Display:</strong> Show your repository status and analysis results</li>
            <li><strong>Webhook Processing:</strong> Receive and process GitHub webhook events</li>
            <li><strong>Service Improvement:</strong> Analyze anonymous usage patterns to enhance features</li>
            <li><strong>Customer Support:</strong> Assist you with troubleshooting and issues</li>
          </ul>
          
          <p className="text-gray-400">
            We never use your code or repository content for training AI models or sharing with third parties.
          </p>
        </LegalSection>

        <LegalSection id="data-storage" title="Data Storage & Security">
          <p className="mb-4">
            Your data is stored with enterprise-grade security:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Encryption:</strong> GitHub tokens are encrypted with AES-256-GCM at rest</li>
            <li><strong>Database:</strong> PostgreSQL hosted on Neon with encryption in transit</li>
            <li><strong>Authentication:</strong> Managed by Clerk, an industry-standard auth provider</li>
            <li><strong>HTTPS:</strong> All data transmitted over TLS 1.3</li>
            <li><strong>Access Controls:</strong> Strict internal access controls and audit logs</li>
          </ul>
          
          <p className="text-gray-400">
            We implement industry best practices for data security and regularly review our security measures.
          </p>
        </LegalSection>

        <LegalSection id="third-parties" title="Third-Party Services">
          <p className="mb-4">
            Fixr integrates with these trusted third-party services:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Clerk:</strong> User authentication and session management</li>
            <li><strong>GitHub API:</strong> Repository access and webhook delivery</li>
            <li><strong>Groq API:</strong> AI analysis for pipeline failure detection</li>
            <li><strong>Neon:</strong> PostgreSQL database hosting</li>
            <li><strong>Vercel:</strong> Application hosting and CDN</li>
          </ul>
          
          <p className="text-gray-400">
            Each service has been carefully vetted for security and privacy compliance.
          </p>
        </LegalSection>

        <LegalSection id="data-retention" title="Data Retention & Deletion">
          <p className="mb-4">
            We retain your data only as long as necessary:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
            <li><strong>Deleted Accounts:</strong> All data permanently deleted within 30 days</li>
            <li><strong>Pipeline Logs:</strong> Retained for 90 days (free tier) or 1 year (paid tiers)</li>
            <li><strong>Analytics Data:</strong> Anonymous usage data retained for 1 year</li>
          </ul>
          
          <p className="text-gray-400">
            You can request immediate data deletion at any time through your account settings.
          </p>
        </LegalSection>

        <LegalSection id="your-rights" title="Your Rights">
          <p className="mb-4">
            You have complete control over your data:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Access:</strong> View all data we have stored about you</li>
            <li><strong>Correction:</strong> Update or correct your personal information</li>
            <li><strong>Deletion:</strong> Delete your account and all associated data</li>
            <li><strong>Export:</strong> Download a copy of your data in JSON format</li>
            <li><strong>Revoke Access:</strong> Disconnect GitHub integration at any time</li>
          </ul>
          
          <p className="text-gray-400">
            Deleting your account removes all data from our systems, including encrypted tokens and analysis history.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact Information">
          <p className="mb-4">
            If you have questions about this privacy policy or your data, please contact us:
          </p>
          
          <div className="bg-gray-900 rounded-lg p-6 mb-4">
            <ul className="space-y-2">
              <li><strong>Email:</strong> [YOUR_EMAIL]@fixr.ai</li>
              <li><strong>Response Time:</strong> Within 48 hours for privacy inquiries</li>
              <li><strong>Data Protection Officer:</strong> [YOUR_NAME]</li>
            </ul>
          </div>
          
          <p className="text-gray-400">
            We are committed to protecting your privacy and will respond promptly to any privacy concerns.
          </p>
        </LegalSection>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            This privacy policy is part of our commitment to transparency and user privacy. 
            We will never sell your data to third parties.
          </p>
        </div>
      </div>
    </div>
  )
}
