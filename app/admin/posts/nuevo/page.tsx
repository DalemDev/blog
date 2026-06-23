import type { Metadata } from 'next'
import { getCategories, getTags } from '@/lib/queries'
import { PostEditor } from '@/components/admin/PostEditor'

export const metadata: Metadata = { title: 'Nuevo post' }

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo post</h1>
        <p className="text-muted-foreground">Crea un nuevo artículo para el blog</p>
      </div>
      <PostEditor categories={categories} tags={tags} />
    </div>
  )
}
