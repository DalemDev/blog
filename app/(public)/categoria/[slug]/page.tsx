import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostGrid } from '@/components/blog/PostGrid'
import { Pagination } from '@/components/blog/Pagination'
import { getCategoryBySlug, getPosts } from '@/lib/queries'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return { title: category.name, description: category.description ?? undefined }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [category, result] = await Promise.all([
    getCategoryBySlug(slug),
    getPosts({ page, categorySlug: slug }),
  ])

  if (!category) notFound()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {category.name}
        </div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground">{result.total} artículo{result.total !== 1 ? 's' : ''}</p>
      </div>

      <PostGrid posts={result.data} emptyMessage="No hay artículos en esta categoría aún." />
      <Pagination page={page} totalPages={result.totalPages} basePath={`/categoria/${slug}`} />
    </div>
  )
}
