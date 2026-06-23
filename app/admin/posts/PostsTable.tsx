'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Eye, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import { formatDateShort, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { PostWithRelations } from '@/types'

export function PostsTable({ posts }: { posts: PostWithRelations[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    await supabase.from('posts').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <p>No hay posts aún.</p>
        <Link href="/admin/posts/nuevo" className={cn(buttonVariants(), 'mt-4 inline-flex')}>
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Categoría</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Estado</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Fecha</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium line-clamp-1">{post.title}</p>
                <p className="text-xs text-muted-foreground">/posts/{post.slug}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {post.category ? (
                  <CategoryBadge category={post.category} asLink={false} />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status === 'published' ? 'Publicado' : 'Borrador'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {formatDateShort(post.published_at ?? post.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  {post.status === 'published' && (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/editar`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    disabled={deleting === post.id}
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
