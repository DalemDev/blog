import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostById, getCategories, getTags } from '@/lib/queries'
import { PostEditor } from '@/components/admin/PostEditor'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Editar post' }

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
  ])

  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar post</h1>
        <p className="text-muted-foreground line-clamp-1">{post.title}</p>
      </div>
      <PostEditor categories={categories} tags={tags} post={post} />
    </div>
  )
}
