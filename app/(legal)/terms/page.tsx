import { TableOfContents } from '@/components/legal/TableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import Link from 'next/link'

const tocItems = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'service-description', title: 'What Fixr Does' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'github-tokens', title: 'GitHub Token Usage' },
  { id: 'ai-disclaimer', title: 'AI Analysis Disclaimer' },
  { id: 'service-availability', title: 'Service Availability' },
  { id: 'account-termination', title: 'Account Termination' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'changes', title: 'Changes to Terms' },
]

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          
          <p className="text-gray-400 text-lg">
            These terms govern your use of Fixr's AI-powered CI/CD monitoring service. 
            By using Fixr, you agree to these terms.
          </p>
          
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <LegalSection id="acceptance" title="Acceptance of Terms">
          <p className="mb-4">
            By accessing or using Fixr, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree to these terms, please do not use our service.
          </p>
          
          <p className="mb-4">
            These terms apply to all users of Fixr, including free and paid tiers. 
            You must be at least 18 years old or have parental consent to use this service.
          </p>
          
          <p className="text-gray-400">
            We may update these terms periodically. Continued use of the service constitutes acceptance of any changes.
          </p>
        </LegalSection>

        <LegalSection id="service-description" title="What Fixr Does">
          <p className="mb-4">
            Fixr provides AI-powered monitoring and analysis of CI/CD pipelines for GitHub repositories:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Monitoring:</strong> Tracks pipeline runs and detects failures</li>
            <li><strong>AI Analysis:</strong> Analyzes failure patterns and suggests fixes</li>
            <li><strong>Webhook Integration:</strong> Receives real-time GitHub webhook events</li>
            <li><strong>Dashboard:</strong> Provides visual insights and statistics</li>
            <li><strong>Auto-fixing:</strong> Automatically applies certain types of fixes (when enabled)</li>
          </ul>
          
          <p className="text-gray-400">
            Fixr only analyzes repositories that you explicitly connect and authorize.
          </p>
        </LegalSection>

        <LegalSection id="acceptable-use" title="Acceptable Use">
          <p className="mb-4">
            You agree to use Fixr responsibly and in accordance with these guidelines:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Use Fixr only for your own repositories or repositories you have permission to monitor</li>
            <li>Do not attempt to reverse engineer or extract our AI analysis algorithms</li>
            <li>Do not use Fixr for competitive analysis or scraping of other users' data</li>
            <li>Do not attempt to circumvent rate limits or service restrictions</li>
            <li>Do not upload malicious code or attempt to exploit vulnerabilities</li>
            <li>Comply with all applicable laws and GitHub's Terms of Service</li>
          </ul>
          
          <p className="text-gray-400">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </LegalSection>

        <LegalSection id="github-tokens" title="GitHub Token Usage">
          <p className="mb-4">
            Your GitHub OAuth tokens are used strictly for the purposes you authorize:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Repository Access:</strong> Read access to repositories you connect</li>
            <li><strong>Webhook Management:</strong> Create and manage webhooks for pipeline monitoring</li>
            <li><strong>Status Updates:</strong> Update commit statuses with analysis results</li>
            <li><strong>Pull Requests:</strong> Create pull requests for auto-fixes (when enabled)</li>
          </ul>
          
          <p className="mb-4">
            We will never:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access repositories you haven't explicitly connected</li>
            <li>Share your tokens with third parties</li>
            <li>Use tokens for purposes beyond what Fixr requires</li>
            <li>Store your GitHub password or other credentials</li>
          </ul>
          
          <p className="text-gray-400">
            You can revoke GitHub access at any time through your GitHub account settings.
          </p>
        </LegalSection>

        <LegalSection id="ai-disclaimer" title="AI Analysis Disclaimer">
          <p className="mb-4">
            Our AI analysis is provided as-is with the following understandings:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>AI suggestions may not be 100% accurate and should be reviewed before application</li>
            <li>Auto-fixes are applied at your own risk and responsibility</li>
            <li>We are not liable for any damage caused by AI-generated fixes</li>
            <li>AI capabilities may evolve and change over time</li>
            <li>Complex issues may require manual intervention and expertise</li>
          </ul>
          
          <p className="text-gray-400">
            Always test AI-generated fixes in a development environment before applying to production code.
          </p>
        </LegalSection>

        <LegalSection id="service-availability" title="Service Availability">
          <p className="mb-4">
            Fixr is provided on a "best effort" basis with the following terms:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Free Tier:</strong> No service level agreement (SLA) or uptime guarantee</li>
            <li><strong>Paid Tiers:</strong> Reasonable effort to maintain high availability</li>
            <li><strong>Maintenance:</strong> Scheduled maintenance may cause temporary downtime</li>
            <li><strong>Third-party Dependencies:</strong> Service depends on GitHub API and other external services</li>
          </ul>
          
          <p className="text-gray-400">
            We are not liable for losses resulting from service unavailability or interruptions.
          </p>
        </LegalSection>

        <LegalSection id="account-termination" title="Account Termination">
          <p className="mb-4">
            We reserve the right to terminate accounts under these circumstances:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Violation of these Terms of Service</li>
            <li>Suspicious or fraudulent activity</li>
            <li>Abuse of the service or API</li>
            <li>Non-payment for paid tiers</li>
            <li>Request by the account holder</li>
          </ul>
          
          <p className="mb-4">
            Upon termination:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>All data will be permanently deleted within 30 days</li>
            <li>GitHub webhooks will be removed</li>
            <li>No refund will be provided for partial months of service</li>
          </ul>
          
          <p className="text-gray-400">
            You may terminate your account at any time through your account settings.
          </p>
        </LegalSection>

        <LegalSection id="liability" title="Limitation of Liability">
          <p className="mb-4">
            To the fullest extent permitted by law:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Fixr is provided "as-is" without warranties of any kind</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the amount paid for the service in the preceding 3 months</li>
            <li>We are not responsible for data loss, code corruption, or system downtime</li>
            <li>Users assume all risk for using AI-generated fixes and suggestions</li>
          </ul>
          
          <p className="text-gray-400">
            Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="Changes to Terms">
          <p className="mb-4">
            We may modify these terms at any time. Changes will be effective immediately upon posting.
          </p>
          
          <p className="mb-4">
            Material changes will be communicated through:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Email notification to registered users</li>
            <li>In-app notifications</li>
            <li>Updated "Last modified" date at the top of this document</li>
          </ul>
          
          <p className="text-gray-400">
            Your continued use of Fixr after changes constitutes acceptance of the modified terms.
          </p>
        </LegalSection>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            If you have questions about these terms, please contact us at [YOUR_EMAIL]@fixr.ai
          </p>
        </div>
      </div>
    </div>
  )
}
