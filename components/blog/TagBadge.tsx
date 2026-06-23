import Link from 'next/link'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  asLink?: boolean
}

export function TagBadge({ tag, asLink = true }: TagBadgeProps) {
  const badge = (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
      #{tag.name}
    </span>
  )

  if (!asLink) return badge

  return (
    <Link href={`/tag/${tag.slug}`}>
      {badge}
    </Link>
  )
}
