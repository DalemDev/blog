import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostGrid } from '@/components/blog/PostGrid'
import { Pagination } from '@/components/blog/Pagination'
import { getTagBySlug, getPosts } from '@/lib/queries'

interface TagPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return {}
  return { title: `#${tag.name}` }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [tag, result] = await Promise.all([
    getTagBySlug(slug),
    getPosts({ page, tagSlug: slug }),
  ])

  if (!tag) notFound()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Etiqueta</span>
        <h1 className="text-3xl font-bold">#{tag.name}</h1>
        <p className="text-sm text-muted-foreground">{result.total} artículo{result.total !== 1 ? 's' : ''}</p>
      </div>

      <PostGrid posts={result.data} emptyMessage="No hay artículos con esta etiqueta aún." />
      <Pagination page={page} totalPages={result.totalPages} basePath={`/tag/${slug}`} />
    </div>
  )
}
