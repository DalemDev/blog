import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin usuario: renderizar solo el children (página de login).
  // El middleware ya redirige usuarios no autenticados que intentan
  // acceder a rutas protegidas (/admin/dashboard, etc.)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border/50 flex items-center justify-end px-6 gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
