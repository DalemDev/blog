import type { MetadataRoute } from 'next'
import { getPosts, getCategories } from '@/lib/queries'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: posts }, categories] = await Promise.all([
    getPosts({ pageSize: 1000 }),
    getCategories(),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categoria/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/categorias`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/buscar`, changeFrequency: 'monthly', priority: 0.4 },
    ...categoryEntries,
    ...postEntries,
  ]
}
