'use client'

import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(preRef.current?.textContent ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        aria-label="Copiar código"
        className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-muted/80 border border-border/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-muted"
      >
        {copied
          ? <Check className="h-3.5 w-3.5 text-green-500" />
          : <Copy className="h-3.5 w-3.5" />
        }
      </button>
    </div>
  )
}
