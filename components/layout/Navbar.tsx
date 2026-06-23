'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Cpu, Search } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface NavbarProps {
  categories: Category[]
}

export function Navbar({ categories }: NavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value.trim()
    if (q) {
      setOpen(false)
      window.location.href = `/buscar?q=${encodeURIComponent(q)}`
    }
  }

  return (
    // El sticky envuelve tanto el header como el menú móvil
    <div className="sticky top-0 z-50">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Capa Cero</span>
          </Link>

          {/* Búsqueda — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              name="q"
              placeholder="Buscar artículos..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-muted/50 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </form>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent',
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Inicio
            </Link>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent',
                  pathname === `/categoria/${cat.slug}` ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              className="md:hidden p-2 rounded-md hover:bg-accent active:bg-accent transition-colors"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil — dentro del mismo sticky, en flujo normal (no absolute/fixed) */}
      {open && (
        <div className="md:hidden bg-background border-b border-border/50 shadow-md px-4 py-4 flex flex-col gap-4">

          {/* Búsqueda mobile */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              name="q"
              placeholder="Buscar artículos..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-muted/50 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </form>

          {/* Links */}
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={cn(
                'px-3 py-3 rounded-md text-sm font-medium transition-colors active:bg-accent',
                pathname === '/' ? 'text-primary' : 'text-foreground'
              )}
            >
              Inicio
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-3 rounded-md text-sm font-medium transition-colors active:bg-accent',
                  pathname === `/categoria/${cat.slug}` ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
