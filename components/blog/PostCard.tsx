import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import { TagBadge } from './TagBadge'
import { formatDateShort } from '@/lib/utils'
import type { PostWithRelations } from '@/types'

interface PostCardProps {
  post: PostWithRelations
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Cover image */}
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden aspect-video bg-muted relative">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl font-bold text-primary/20">
              {post.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category */}
        {post.category && <CategoryBadge category={post.category} />}

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDateShort(post.published_at ?? post.created_at)}
          </time>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.read_time} min
          </span>
        </div>
      </div>
    </article>
  )
}
