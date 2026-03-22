import { ReactNode } from 'react'

interface LegalSectionProps {
  id: string
  title: string
  children: ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        <a 
          href={`#${id}`}
          className="group inline-flex items-center"
        >
          {title}
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            #
          </span>
        </a>
      </h2>
      <div className="prose prose-invert max-w-none">
        {children}
      </div>
    </section>
  )
}
