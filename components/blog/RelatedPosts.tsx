import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import type { PostWithRelations } from '@/types'
import { formatDateShort } from '@/lib/utils'

interface RelatedPostsProps {
  posts: PostWithRelations[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="py-8 border-t border-border/50">
      <h2 className="text-lg font-semibold mb-4">Artículos relacionados</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition-colors"
          >
            {post.cover_image_url && (
              <div className="relative aspect-video rounded-md overflow-hidden">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
              <Calendar className="h-3 w-3" />
              {formatDateShort(post.published_at ?? post.created_at)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
