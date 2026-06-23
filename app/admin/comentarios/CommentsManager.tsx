'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Comment } from '@/types'

const STATUS_LABEL: Record<Comment['status'], string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const STATUS_VARIANT: Record<Comment['status'], 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

export function CommentsManager({ comments }: { comments: Comment[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [processing, setProcessing] = useState<string | null>(null)

  async function updateStatus(id: string, status: Comment['status']) {
    setProcessing(id)
    await supabase.from('comments').update({ status }).eq('id', id)
    setProcessing(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este comentario?')) return
    await supabase.from('comments').delete().eq('id', id)
    router.refresh()
  }

  const pending = comments.filter((c) => c.status === 'pending')
  const rest = comments.filter((c) => c.status !== 'pending')

  if (comments.length === 0) {
    return <p className="text-muted-foreground">No hay comentarios aún.</p>
  }

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-amber-600 dark:text-amber-400">
            Pendientes de moderación ({pending.length})
          </h2>
          <CommentList comments={pending} processing={processing} onStatus={updateStatus} onDelete={handleDelete} />
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-muted-foreground">Historial</h2>
          <CommentList comments={rest} processing={processing} onStatus={updateStatus} onDelete={handleDelete} />
        </section>
      )}
    </div>
  )
}

function CommentList({
  comments,
  processing,
  onStatus,
  onDelete,
}: {
  comments: Comment[]
  processing: string | null
  onStatus: (id: string, status: Comment['status']) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.author_name}</span>
                <span className="text-xs text-muted-foreground">{comment.author_email}</span>
                <Badge variant={STATUS_VARIANT[comment.status]}>{STATUS_LABEL[comment.status]}</Badge>
              </div>
              <time className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</time>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-2">
            {comment.status !== 'approved' && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600/30 hover:bg-green-600/10"
                disabled={processing === comment.id}
                onClick={() => onStatus(comment.id, 'approved')}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Aprobar
              </Button>
            )}
            {comment.status !== 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
                disabled={processing === comment.id}
                onClick={() => onStatus(comment.id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Rechazar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="hover:text-destructive ml-auto"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
