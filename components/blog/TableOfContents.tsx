'use client'

import { useState, useEffect } from 'react'
import { extractHeadings } from '@/lib/utils'

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content)
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (headings.length < 2) return null

  return (
    <nav aria-label="Tabla de contenidos">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Contenido
      </p>
      <ul className="space-y-1.5">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? '0.75rem' : '0' }}>
            <a
              href={`#${id}`}
              className={`text-sm leading-snug block transition-colors hover:text-foreground ${
                activeId === id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
