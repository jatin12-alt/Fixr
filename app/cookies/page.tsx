import PolicyPage from '@/components/layout/PolicyPage'

export default function Cookies() {
  return (
    <PolicyPage 
      title="Cookie Policy."
      subtitle="How we utilize operational trackers to ensure the stability and security of your Sentinel dashboard session."
      lastUpdated="April 12, 2026"
    >
      <h2>01. Operational Cookies</h2>
      <p>
        These are essential for the core functionality of the Fixr dashboard. They manage your session authentication and ensure that the real-time WebSocket connection to the Sentinel Engine remains stable.
      </p>

      <h2>02. Analytic Identifiers</h2>
      <p>
        We use anonymous analytic trackers to monitor peak usage times and engine load. This allows us to scale our ephemeral worker clusters effectively before latency impacts your experience.
      </p>

      <h2>03. Preference Storage</h2>
      <p>
        If you customize your dashboard layout or toggle specific analysis notifications, a persistent cookie is stored to remember these settings across sessions.
      </p>

      <h2>04. Management</h2>
      <p>
        You can disable non-essential trackers in your browser settings. Note that disabling operational cookies will prevent you from accessing the dashboard to trigger autonomous resolutions.
      </p>
    </PolicyPage>
  )
}
