'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LogoutButton } from './LogoutButton'
import { cn } from '@/lib/utils'

interface AdminShellProps {
  email: string
  children: React.ReactNode
}

export function AdminShell({ email, children }: AdminShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">

      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: fixed drawer en móvil, estático en desktop */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0 md:z-auto',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <AdminSidebar onClose={() => setOpen(false)} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/50 flex items-center px-4 gap-3">
          {/* Hamburger — solo móvil */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
            {email}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
