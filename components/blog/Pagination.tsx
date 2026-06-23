import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  basePath: string
  extraParams?: Record<string, string>
}

function buildHref(p: number, basePath: string, extraParams?: Record<string, string>) {
  const params = new URLSearchParams(extraParams)
  if (p > 1) params.set('page', String(p))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function Pagination({ page, totalPages, basePath, extraParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Paginación">
      <Link
        href={page > 1 ? buildHref(page - 1, basePath, extraParams) : '#'}
        aria-disabled={page <= 1}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          page <= 1
            ? 'pointer-events-none text-muted-foreground/40'
            : 'hover:bg-accent text-muted-foreground'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Link>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p as number, basePath, extraParams)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={page < totalPages ? buildHref(page + 1, basePath, extraParams) : '#'}
        aria-disabled={page >= totalPages}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          page >= totalPages
            ? 'pointer-events-none text-muted-foreground/40'
            : 'hover:bg-accent text-muted-foreground'
        )}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
