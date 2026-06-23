import type { Metadata } from 'next'
import { PostGrid } from '@/components/blog/PostGrid'
import { Pagination } from '@/components/blog/Pagination'
import { SearchBar } from '@/components/blog/SearchBar'
import { getPosts } from '@/lib/queries'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export const metadata: Metadata = { title: 'Búsqueda' }

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const query = q?.trim() ?? ''

  const result = query
    ? await getPosts({ page, search: query })
    : { data: [], total: 0, page: 1, pageSize: 9, totalPages: 0 }

  return (
    <div className="space-y-8">
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-bold">Búsqueda</h1>
        <SearchBar />
      </div>

      {query && (
        <p className="text-muted-foreground">
          {result.total} resultado{result.total !== 1 ? 's' : ''} para{' '}
          <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {!query ? (
        <p className="text-muted-foreground">Escribe algo para buscar artículos.</p>
      ) : (
        <>
          <PostGrid posts={result.data} emptyMessage={`No se encontraron artículos para "${query}".`} />
          <Pagination
            page={page}
            totalPages={result.totalPages}
            basePath="/buscar"
            extraParams={query ? { q: query } : undefined}
          />
        </>
      )}
    </div>
  )
}
