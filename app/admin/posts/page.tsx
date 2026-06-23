import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getPosts } from '@/lib/queries'
import { buttonVariants } from '@/components/ui/button'
import { PostsTable } from './PostsTable'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Posts' }

export default async function AdminPostsPage() {
  const result = await getPosts({ status: 'all', pageSize: 50 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">{result.total} artículo{result.total !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/admin/posts/nuevo" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo post
        </Link>
      </div>

      <PostsTable posts={result.data} />
    </div>
  )
}
