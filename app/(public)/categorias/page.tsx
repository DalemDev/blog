import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { getCategoriesWithCount } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explora todos los temas del blog: ingeniería, datos, IA, redes y más.',
}

export default async function CategoriasPage() {
  const categories = await getCategoriesWithCount()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">
          {categories.length} tema{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''} en el blog.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="group relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-card hover:bg-accent/30 hover:border-border/80 transition-colors overflow-hidden"
          >
            {/* Barra de color superior */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: cat.color }}
            />

            <div className="flex items-start justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{cat.icon}</span>
                <h2 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{cat.post_count}</span>
              </div>
            </div>

            {cat.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            )}

            <p className="text-xs font-medium mt-auto" style={{ color: cat.color }}>
              {cat.post_count === 0
                ? 'Sin artículos aún'
                : `${cat.post_count} artículo${cat.post_count !== 1 ? 's' : ''}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
