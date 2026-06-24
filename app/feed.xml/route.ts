import { getPosts } from '@/lib/queries'
import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

export async function GET() {
  const { data: posts } = await getPosts({ pageSize: 50 })

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/posts/${post.slug}`
      const pubDate = new Date(post.published_at ?? post.created_at).toUTCString()
      const category = post.category ? `<category><![CDATA[${post.category.name}]]></category>` : ''
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.excerpt ?? ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${category}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Capa Cero</title>
    <link>${BASE_URL}</link>
    <description>Artículos de ingeniería, ciencia de datos e inteligencia artificial.</description>
    <language>es</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
