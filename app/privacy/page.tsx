import PolicyPage from '@/components/layout/PolicyPage'

export default function Privacy() {
  return (
    <PolicyPage 
      title="Privacy Policy."
      subtitle="We are committed to protecting your intellectual property and personal data. This policy outlines how we handle information across the Sentinel Engine."
      lastUpdated="April 12, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">01. Data Collection</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Fixr collect metadata necessary for the operational performance of the Sentinel Engine. We do not store, cache, or persist your source code on our infrastructure. All analysis is performed in volatile memory within isolated, ephemeral containers.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">02. Security Protocols</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            We employ end-to-end encryption for all data in transit. Our infrastructure is SOC 2 Type II compliant and subject to quarterly third-party penetration testing. 
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">03. Third-Party Integrations</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Our platform integrates directly with GitHub and other VCS providers via OAuth 2.0. We request only the minimum scope necessary to monitor webhooks and trigger recovery pipelines.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">04. Your Rights</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Under GDPR and CCPA, you have the right to access, rectify, or delete your account metadata. Requests can be initiated through the "Security Settings" in your dashboard or by contacting our engineering team directly.
          </p>
        </section>
      </div>
    </PolicyPage>
  )
}
