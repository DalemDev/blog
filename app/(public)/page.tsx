import type { Metadata } from 'next';
import { PostGrid } from '@/components/blog/PostGrid';
import { Pagination } from '@/components/blog/Pagination';
import { getPosts, getCategories } from '@/lib/queries';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HomePageProps {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}

export const metadata: Metadata = {
  title: 'Ingeniería desde la base',
  description: 'Artículos de ingeniería, ciencias de datos, redes e inteligencia artificial.',
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: pageParam, categoria } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [result, categories] = await Promise.all([
    getPosts({ page, categorySlug: categoria }),
    getCategories(),
  ]);

  const extraParams: Record<string, string> = {};
  if (categoria) extraParams.categoria = categoria;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Ingeniería desde la base</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Artículos sobre ingeniería, ciencia de datos e inteligencia artificial para estudiantes,
          desarrolladores y profesionales.
        </p>
      </section>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Link
          href="/"
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
            !categoria
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:bg-accent text-muted-foreground'
          )}
        >
          Todos
        </Link>
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            href={`/?categoria=${cat.slug}`}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
              categoria === cat.slug
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-accent text-muted-foreground'
            )}
          >
            {cat.name}
          </Link>
        ))}
        {categories.length > 6 && (
          <Link
            href="/categorias"
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-dashed border-border hover:bg-accent text-muted-foreground transition-colors"
          >
            Ver todas →
          </Link>
        )}
      </div>

      {/* Grid */}
      <PostGrid posts={result.data} />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={result.totalPages}
        basePath="/"
        extraParams={extraParams}
      />
    </div>
  );
}
