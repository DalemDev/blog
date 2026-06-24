import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Clock, Calendar, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { getPostBySlug, getCommentsByPost, getRelatedPosts } from '@/lib/queries'
import { CategoryBadge } from '@/components/blog/CategoryBadge'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentSection } from '@/components/blog/CommentSection'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ViewTracker } from '@/components/blog/ViewTracker'
import { formatDate, slugifyHeading } from '@/lib/utils'

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

function getHeadingText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(getHeadingText).join('')
  return ''
}

const mdComponents: Components = {
  pre: (props) => <CodeBlock {...props} />,
  h2: ({ children, node: _node, ...props }) => {
    const id = slugifyHeading(getHeadingText(children))
    return <h2 id={id} {...props}>{children}</h2>
  },
  h3: ({ children, node: _node, ...props }) => {
    const id = slugifyHeading(getHeadingText(children))
    return <h3 id={id} {...props}>{children}</h3>
  },
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [approvedComments, relatedPosts] = await Promise.all([
    getCommentsByPost(post.id),
    getRelatedPosts(post.id, post.category_id, post.tags.map((t) => t.id)),
  ])

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={post.slug} />
      <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12 items-start">

        <article>
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
              {post.views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {post.views.toLocaleString('es-ES')} lecturas
                </span>
              )}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={mdComponents}
            >
              {post.content ?? ''}
            </ReactMarkdown>
          </div>

          {/* Share */}
          <ShareButtons title={post.title} />

          {/* Related posts */}
          <RelatedPosts posts={relatedPosts} />

          {/* Comments */}
          <CommentSection postId={post.id} comments={approvedComments} />
        </article>

        {/* TOC sidebar — only on xl screens */}
        <aside className="hidden xl:block sticky top-8">
          <TableOfContents content={post.content ?? ''} />
        </aside>

      </div>
    </>
  )
}
