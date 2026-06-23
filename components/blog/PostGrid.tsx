import { PostCard } from './PostCard'
import type { PostWithRelations } from '@/types'

interface PostGridProps {
  posts: PostWithRelations[]
  emptyMessage?: string
}

export function PostGrid({ posts, emptyMessage = 'No hay artículos disponibles.' }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
