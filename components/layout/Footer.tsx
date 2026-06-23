import Link from 'next/link'
import { Cpu } from 'lucide-react'
import type { Category } from '@/types'

interface FooterProps {
  categories: Category[]
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Cpu className="h-5 w-5 text-primary" />
              Capa Cero
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu fuente de información sobre ingeniería, ciencia de datos, IA y más.
            </p>
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Categorías</h3>
            <nav className="flex flex-col gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              {categories.length > 6 && (
                <Link
                  href="/categorias"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Ver todas →
                </Link>
              )}
            </nav>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Blog</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inicio
              </Link>
              <Link href="/categorias" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Categorías
              </Link>
              <Link href="/buscar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Búsqueda
              </Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Capa Cero
        </div>
      </div>
    </footer>
  )
}
