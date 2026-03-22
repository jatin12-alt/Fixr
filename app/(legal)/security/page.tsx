import { TableOfContents } from '@/components/legal/TableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import Link from 'next/link'

const tocItems = [
  { id: 'encryption-at-rest', title: 'Encryption at Rest' },
  { id: 'encryption-in-transit', title: 'Encryption in Transit' },
  { id: 'authentication', title: 'Authentication' },
  { id: 'rate-limiting', title: 'Rate Limiting & DDoS Protection' },
  { id: 'token-security', title: 'GitHub Token Security' },
  { id: 'security-headers', title: 'Security Headers' },
  { id: 'responsible-disclosure', title: 'Responsible Disclosure' },
  { id: 'security-reviews', title: 'Security Reviews' },
]

export default function SecurityPage() {
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
            Security
          </h1>
          
          <p className="text-gray-400 text-lg">
            Security is fundamental to Fixr. We implement industry-standard security measures 
            to protect your data and ensure the reliability of our service.
          </p>
          
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <LegalSection id="encryption-at-rest" title="Encryption at Rest">
          <p className="mb-4">
            All sensitive data is encrypted at rest using industry-standard algorithms:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>GitHub Tokens:</strong> Encrypted with AES-256-GCM with unique IVs</li>
            <li><strong>Database:</strong> PostgreSQL with transparent data encryption (TDE)</li>
            <li><strong>Encryption Keys:</strong> 32-byte keys with secure key rotation</li>
            <li><strong>Backups:</strong> Encrypted backups with secure key management</li>
          </ul>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400">
              <strong>Technical Details:</strong> We use the Web Crypto API with AES-256-GCM for token encryption, 
              providing both confidentiality and integrity protection.
            </p>
          </div>
          
          <p className="text-gray-400">
            Even if our database were compromised, your GitHub tokens would remain encrypted and unusable.
          </p>
        </LegalSection>

        <LegalSection id="encryption-in-transit" title="Encryption in Transit">
          <p className="mb-4">
            All data transmitted between your browser and our servers is encrypted:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>TLS 1.3:</strong> Latest encryption protocol for all HTTPS connections</li>
            <li><strong>HSTS:</strong> HTTP Strict Transport Security enforced</li>
            <li><strong>Certificate Pinning:</strong> SSL certificates automatically renewed</li>
            <li><strong>API Communications:</strong> All API calls use encrypted connections</li>
          </ul>
          
          <p className="text-gray-400">
            We disable outdated protocols like SSLv2, SSLv3, and TLS 1.0/1.1 to ensure only secure connections.
          </p>
        </LegalSection>

        <LegalSection id="authentication" title="Authentication">
          <p className="mb-4">
            User authentication is handled by industry-leading providers:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Clerk:</strong> Enterprise-grade authentication and session management</li>
            <li><strong>OAuth 2.0:</strong> Secure GitHub integration using standard OAuth flow</li>
            <li><strong>Session Security:</strong> Secure, HTTP-only session cookies</li>
            <li><strong>Multi-factor:</strong> Support for 2FA through GitHub accounts</li>
          </ul>
          
          <p className="mb-4">
            Authentication security features:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Automatic session timeout after inactivity</li>
            <li>Secure session regeneration on login</li>
            <li>Protection against session fixation attacks</li>
            <li>Cross-site request forgery (CSRF) protection</li>
          </ul>
          
          <p className="text-gray-400">
            We never store passwords - authentication is handled entirely through secure OAuth flows.
          </p>
        </LegalSection>

        <LegalSection id="rate-limiting" title="Rate Limiting & DDoS Protection">
          <p className="mb-4">
            We implement comprehensive rate limiting to prevent abuse:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>API Endpoints:</strong> 100 requests per 15 minutes per user</li>
            <li><strong>Webhooks:</strong> 50 requests per 5 minutes per repository</li>
            <li><strong>Authentication:</strong> 5 attempts per 15 minutes to prevent brute force</li>
            <li><strong>IP-based Limits:</strong> Additional restrictions by IP address</li>
          </ul>
          
          <p className="mb-4">
            DDoS protection measures:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Cloudflare DDoS protection at the edge</li>
            <li>Automatic traffic shaping during attacks</li>
            <li>Rate limit headers for client-side throttling</li>
            <li>Request validation and filtering</li>
          </ul>
          
          <p className="text-gray-400">
            Our rate limiting automatically adapts to traffic patterns and threat levels.
          </p>
        </LegalSection>

        <LegalSection id="token-security" title="GitHub Token Security">
          <p className="mb-4">
            GitHub OAuth tokens are handled with maximum security:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Minimal Scope:</strong> Request only necessary permissions (repo, admin:repo_hook)</li>
            <li><strong>No Password Storage:</strong> Never store GitHub passwords or credentials</li>
            <li><strong>Token Expiry:</strong> Regular token refresh and secure lifecycle management</li>
            <li><strong>Access Control:</strong> Tokens accessible only to authorized services</li>
          </ul>
          
          <p className="mb-4">
            Token usage restrictions:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Used only for repositories you explicitly connect</li>
            <li>Never shared with third parties</li>
            <li>Automatically revoked on account deletion</li>
            <li>Activity logged and monitored for anomalies</li>
          </ul>
          
          <p className="text-gray-400">
            You can revoke access at any time through your GitHub account settings.
          </p>
        </LegalSection>

        <LegalSection id="security-headers" title="Security Headers">
          <p className="mb-4">
            We implement comprehensive security headers:
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains`}
            </pre>
          </div>
          
          <p className="mb-4">
            These headers protect against:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Clickjacking attacks</li>
            <li>Cross-site scripting (XSS)</li>
            <li>MIME-type sniffing</li>
            <li>Content injection attacks</li>
          </ul>
          
          <p className="text-gray-400">
            Our CSP is carefully balanced to allow necessary functionality while maintaining security.
          </p>
        </LegalSection>

        <LegalSection id="responsible-disclosure" title="Responsible Disclosure">
          <p className="mb-4">
            We welcome security researchers to help us improve our security:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Report To:</strong> security@fixr.ai</li>
            <li><strong>Response Time:</strong> Within 48 hours for security reports</li>
            <li><strong>Bug Bounty:</strong> Up to $500 for valid security vulnerabilities</li>
            <li><strong>Safe Harbor:</strong> We will not take legal action against good-faith research</li>
          </ul>
          
          <p className="mb-4">
            What to include in your report:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Detailed description of the vulnerability</li>
            <li>Steps to reproduce the issue</li>
            <li>Potential impact assessment</li>
            <li>Suggested remediation (if applicable)</li>
          </ul>
          
          <p className="text-gray-400">
            Please do not exploit vulnerabilities or access other users' data during testing.
          </p>
        </LegalSection>

        <LegalSection id="security-reviews" title="Security Reviews">
          <p className="mb-4">
            We regularly review and improve our security:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Code Reviews:</strong> All code changes undergo security review</li>
            <li><strong>Dependency Scanning:</strong> Automated scanning for vulnerable dependencies</li>
            <li><strong>Penetration Testing:</strong> Regular security assessments</li>
            <li><strong>Compliance:</strong> Adherence to security best practices and standards</li>
          </ul>
          
          <p className="mb-4">
            Our security practices include:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Regular security updates and patching</li>
            <li>Employee security training and awareness</li>
            <li>Incident response procedures</li>
            <li>Security monitoring and alerting</li>
          </ul>
          
          <p className="text-gray-400">
            Security is an ongoing process, and we continuously improve our practices.
          </p>
        </LegalSection>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            Security is our top priority. If you discover a security issue, please report it responsibly 
            to security@fixr.ai
          </p>
        </div>
      </div>
    </div>
  )
}
