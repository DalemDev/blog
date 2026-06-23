'use client'

import React, { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, CheckCircle } from 'lucide-react'
import type { Comment } from '@/types'

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' })
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, post_id: postId }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Hubo un error al enviar el comentario. Intenta de nuevo.')
      return
    }

    setSubmitted(true)
    setForm({ author_name: '', author_email: '', content: '' })
  }

  return (
    <section className="mt-12 pt-8 border-t border-border/50">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Comentarios
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-6 mb-10">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.author_name}</span>
                  <time className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-8">
          Sé el primero en comentar este artículo.
        </p>
      )}

      {submitted ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">¡Gracias! Tu comentario está pendiente de aprobación.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold">Deja un comentario</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author_name">Nombre *</Label>
              <Input
                id="author_name"
                required
                value={form.author_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author_email">Email *</Label>
              <Input
                id="author_email"
                type="email"
                required
                value={form.author_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, author_email: e.target.value }))}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Comentario *</Label>
            <Textarea
              id="content"
              required
              rows={4}
              value={form.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Escribe tu comentario..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Publicar comentario'}
          </Button>
        </form>
      )}
    </section>
  )
}
