import { TableOfContents } from '@/components/legal/TableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import Link from 'next/link'

const tocItems = [
  { id: 'cookie-overview', title: 'Cookie Overview' },
  { id: 'essential-cookies', title: 'Essential Cookies' },
  { id: 'no-tracking', title: 'No Tracking or Advertising' },
  { id: 'cookie-table', title: 'Cookie Details' },
  { id: 'managing-cookies', title: 'Managing Cookies' },
  { id: 'updates', title: 'Cookie Policy Updates' },
]

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          
          <p className="text-gray-400 text-lg">
            Fixr uses minimal cookies necessary for providing our AI-powered CI/CD monitoring service. 
            We do not use tracking or advertising cookies.
          </p>
          
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <LegalSection id="cookie-overview" title="Cookie Overview">
          <p className="mb-4">
            Cookies are small text files stored on your device when you visit websites. 
            At Fixr, we use cookies only to provide essential functionality for our service.
          </p>
          
          <p className="mb-4">
            Our cookie philosophy:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Minimal Usage:</strong> Only cookies necessary for service operation</li>
            <li><strong>No Tracking:</strong> We do not track you across other websites</li>
            <li><strong>No Advertising:</strong> We do not use cookies for advertising purposes</li>
            <li><strong>Transparency:</strong> Clear disclosure of all cookies we use</li>
          </ul>
          
          <p className="text-gray-400">
            You can control cookie usage through your browser settings.
          </p>
        </LegalSection>

        <LegalSection id="essential-cookies" title="Essential Cookies">
          <p className="mb-4">
            We use only essential cookies that are necessary for Fixr to function:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Authentication Cookies:</strong> Maintain your login session</li>
            <li><strong>Security Cookies:</strong> Protect against CSRF and other attacks</li>
            <li><strong>Preference Cookies:</strong> Remember your UI preferences</li>
            <li><strong>Session Cookies:</strong> Temporary cookies for current session</li>
          </ul>
          
          <p className="mb-4">
            These cookies are provided by our authentication provider, Firebase:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>__session: Maintains your authenticated session</li>
            <li>__client_uat: User authentication token</li>
            <li>__session_token: Secure session identifier</li>
          </ul>
          
          <p className="text-gray-400">
            Without these cookies, Fixr cannot function properly and you would need to log in repeatedly.
          </p>
        </LegalSection>

        <LegalSection id="no-tracking" title="No Tracking or Advertising">
          <p className="mb-4">
            Fixr does NOT use the following types of cookies:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Analytics Cookies:</strong> We do not use Google Analytics or similar tracking</li>
            <li><strong>Advertising Cookies:</strong> We do not serve ads or track for marketing</li>
            <li><strong>Social Media Cookies:</strong> No social media tracking or sharing</li>
            <li><strong>Cross-site Tracking:</strong> We do not track you across other websites</li>
            <li><strong>Profiling Cookies:</strong> We do not build user profiles for advertising</li>
          </ul>
          
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
            <p className="text-green-400">
              <strong>Privacy Commitment:</strong> Your browsing behavior on Fixr is not tracked, 
              sold, or shared with third parties for advertising purposes.
            </p>
          </div>
          
          <p className="text-gray-400">
            We believe in privacy by design and only collect data necessary to provide our service.
          </p>
        </LegalSection>

        <LegalSection id="cookie-table" title="Cookie Details">
          <p className="mb-4">
            Here are all the cookies used by Fixr:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">__session</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Maintains user authentication session</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Session</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">__client_uat</td>
                  <td className="px-4 py-3 text-sm text-gray-300">User authentication token</td>
                  <td className="px-4 py-3 text-sm text-gray-300">30 days</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">__session_token</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Secure session identifier</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Session</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-300">fixr_preferences</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Remember UI preferences (theme, etc.)</td>
                  <td className="px-4 py-3 text-sm text-gray-300">1 year</td>
                  <td className="px-4 py-3 text-sm text-gray-300">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-gray-400 mt-4">
            All cookies are set with secure, HttpOnly flags where appropriate.
          </p>
        </LegalSection>

        <LegalSection id="managing-cookies" title="Managing Cookies">
          <p className="mb-4">
            You have several options to manage cookies:
          </p>
          
          <h4 className="text-lg font-semibold text-white mb-3">Browser Settings</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
          </ul>
          
          <h4 className="text-lg font-semibold text-white mb-3">Cookie Control Options</h4>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Block All Cookies:</strong> May prevent Fixr from functioning properly</li>
            <li><strong>Block Third-Party:</strong> Recommended - does not affect Fixr functionality</li>
            <li><strong>Clear on Exit:</strong> Remove all cookies when closing browser</li>
            <li><strong>Site-Specific:</strong> Allow/block cookies for specific websites</li>
          </ul>
          
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-400">
              <strong>Important:</strong> Blocking essential cookies will prevent you from using Fixr's features, 
              including login and repository management.
            </p>
          </div>
          
          <p className="text-gray-400">
            Disabling cookies may require you to log in each time you visit Fixr.
          </p>
        </LegalSection>

        <LegalSection id="updates" title="Cookie Policy Updates">
          <p className="mb-4">
            We may update this cookie policy as our service evolves:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Notification:</strong> Material changes will be communicated via email</li>
            <li><strong>Review:</strong> Policy reviewed regularly for accuracy</li>
            <li><strong>Compliance:</strong> Updated to comply with regulations</li>
            <li><strong>Effective Date:</strong> Changes take effect immediately upon posting</li>
          </ul>
          
          <p className="mb-4">
            We will notify you of significant changes such as:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Adding new types of cookies</li>
            <li>Changes to cookie purposes or duration</li>
            <li>New third-party services that use cookies</li>
            <li>Changes to how you can manage cookies</li>
          </ul>
          
          <p className="text-gray-400">
            Minor updates for clarity or accuracy may not trigger notification.
          </p>
        </LegalSection>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            Questions about our cookie policy? Contact us at [YOUR_EMAIL]@fixr.ai
          </p>
        </div>
      </div>
    </div>
  )
}
