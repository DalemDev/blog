import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Clock, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { getPostBySlug, getCommentsByPost } from '@/lib/queries'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentSection } from '@/components/blog/CommentSection'
import { formatDate } from '@/lib/utils'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const [post, comments] = await Promise.all([
    getPostBySlug(slug),
    (async () => {
      const p = await getPostBySlug(slug)
      return p ? getCommentsByPost(p.id) : []
    })(),
  ])

  if (!post) notFound()

  // Re-fetch comments without double-fetching post
  const approvedComments = await getCommentsByPost(post.id)

  return (
    <article className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Inicio
        </Link>
        {post.category && (
          <>
            <span>/</span>
            <Link href={`/categoria/${post.category.slug}`} className="hover:text-foreground transition-colors">
              {post.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="space-y-4 mb-8">
        {post.category && <CategoryBadge category={post.category} />}

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>

        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at ?? post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.read_time} min de lectura
          </span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-10">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border/50">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
          {post.content ?? ''}
        </ReactMarkdown>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} comments={approvedComments} />
    </article>
  )
}
