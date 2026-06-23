import type { Metadata } from 'next'
import { getAllComments } from '@/lib/queries'
import { CommentsManager } from './CommentsManager'

export const metadata: Metadata = { title: 'Comentarios' }

export default async function AdminComentariosPage() {
  const comments = await getAllComments()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comentarios</h1>
        <p className="text-muted-foreground">Modera los comentarios del blog</p>
      </div>
      <CommentsManager comments={comments} />
    </div>
  )
}
