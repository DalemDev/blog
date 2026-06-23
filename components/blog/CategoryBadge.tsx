import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryBadgeProps {
  category: Category
  asLink?: boolean
}

export function CategoryBadge({ category, asLink = true }: CategoryBadgeProps) {
  const badge = (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        border: `1px solid ${category.color}40`,
      }}
    >
      {category.name}
    </span>
  )

  if (!asLink) return badge

  return (
    <Link href={`/categoria/${category.slug}`} className="hover:opacity-80 transition-opacity">
      {badge}
    </Link>
  )
}
