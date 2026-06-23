import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, FolderOpen, MessageSquare, TrendingUp, Plus } from 'lucide-react'
import { getDashboardStats } from '@/lib/queries'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      label: 'Posts publicados',
      value: stats.publishedPosts,
      total: stats.totalPosts,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Borradores',
      value: stats.draftPosts,
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Categorías',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Comentarios pendientes',
      value: stats.pendingComments,
      icon: MessageSquare,
      color: stats.pendingComments > 0 ? 'text-red-500' : 'text-muted-foreground',
      bg: stats.pendingComments > 0 ? 'bg-red-500/10' : 'bg-muted',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del blog</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.total !== undefined && (
                <p className="text-xs text-muted-foreground mt-0.5">de {card.total} totales</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/nuevo"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo post
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Gestionar categorías
          </Link>
          {stats.pendingComments > 0 && (
            <Link
              href="/admin/comentarios"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Moderar {stats.pendingComments} comentario{stats.pendingComments !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
