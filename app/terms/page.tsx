import PolicyPage from '@/components/layout/PolicyPage'

export default function Terms() {
  return (
    <PolicyPage 
      title="Terms of Service."
      subtitle="The structural agreement governing the use of the Fixr platform. By initializing the Sentinel Engine, you agree to these operating parameters."
      lastUpdated="April 12, 2026"
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">01. Service Provision</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Fixr provides an autonomous CI/CD monitoring and recovery service. While the Sentinel Engine is designed for high-precision resolutions, users maintain final authority over all merged code. Fixr is not liable for downstream effects of automated deployments.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">02. Account Integrity</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Users are responsible for maintaining the security of their VCS credentials and OAuth tokens. Any unauthorized activity resulting from compromised user-side credentials is the sole responsibility of the account holder.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">03. Usage Limits</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            Platform access is governed by the specific tier associated with your account. Excess usage beyond assigned limits may result in temporary throttling of the analysis engine to preserve overall system stability.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">04. Termination</h2>
          <p className="text-[17px] text-white/50 leading-relaxed font-medium italic border-l border-primary/20 pl-8">
            You may terminate your service at any time. Upon termination, all ephemeral worker instances associated with your account will be immediately purged, and active webhooks will be disconnected.
          </p>
        </section>
      </div>
    </PolicyPage>
  )
}
