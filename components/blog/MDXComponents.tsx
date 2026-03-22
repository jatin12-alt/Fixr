import { ReactNode } from 'react'

interface CalloutProps {
  children: ReactNode
  type?: 'info' | 'warning' | 'tip' | 'success'
}

export function Callout({ children, type = 'info' }: CalloutProps) {
  const styles = {
    info: 'bg-blue-900/20 border-blue-800 text-blue-400',
    warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
    tip: 'bg-green-900/20 border-green-800 text-green-400',
    success: 'bg-cyan-900/20 border-cyan-800 text-cyan-400',
  }

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    tip: '💡',
    success: '✅',
  }

  return (
    <div className={`my-6 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start">
        <span className="mr-3 text-lg">{icons[type]}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}

interface CodeBlockProps {
  children: string
  language?: string
}

export function CodeBlock({ children, language = 'bash' }: CodeBlockProps) {
  return (
    <div className="my-6 bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 uppercase">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(children)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{children}</code>
      </pre>
    </div>
  )
}

interface ImageProps {
  src: string
  alt: string
  caption?: string
}

export function BlogImage({ src, alt, caption }: ImageProps) {
  return (
    <figure className="my-8">
      <div className="rounded-lg overflow-hidden bg-gray-800">
        <img src={src} alt={alt} className="w-full" />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Export all MDX components
export const MDXComponents = {
  Callout,
  CodeBlock,
  BlogImage,
}
