import { createClient } from './supabase/server'
import type { Category, Tag, Post, PostWithRelations, Comment, PaginatedResult } from '@/types'

const PAGE_SIZE = 9

// ── POSTS ────────────────────────────────────────────────────────────────────

export async function getPosts({
  page = 1,
  pageSize = PAGE_SIZE,
  categorySlug,
  tagSlug,
  search,
  status = 'published',
}: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlug?: string
  search?: string
  status?: 'published' | 'draft' | 'all'
} = {}): Promise<PaginatedResult<PostWithRelations>> {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('posts')
    .select(
      `*, category:categories(*), tags:post_tags(tag:tags(*))`,
      { count: 'exact' }
    )
    .order('published_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (tagSlug) {
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single()
    if (tag) {
      const { data: postIds } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', tag.id)
      const ids = postIds?.map((r) => r.post_id) ?? []
      query = query.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    }
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) throw error

  const posts = (data ?? []).map(normalizePost)
  const total = count ?? 0

  return {
    data: posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getPostBySlug(slug: string): Promise<PostWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return normalizePost(data)
}

export async function getPostById(id: string): Promise<PostWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return normalizePost(data)
}

// ── CATEGORÍAS ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getCategoriesWithCount(): Promise<(Category & { post_count: number })[]> {
  const supabase = await createClient()
  const [{ data: categories, error }, { data: postRows }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('posts').select('category_id').eq('status', 'published'),
  ])

  if (error) throw error

  const countMap: Record<string, number> = {}
  for (const row of postRows ?? []) {
    if (row.category_id) countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
  }

  return (categories ?? []).map((cat) => ({ ...cat, post_count: countMap[cat.id] ?? 0 }))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

// ── TAGS ─────────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

// ── COMENTARIOS ───────────────────────────────────────────────────────────────

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAllComments(): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── RELATED POSTS ─────────────────────────────────────────────────────────────

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  tagIds: string[],
  limit = 3,
): Promise<PostWithRelations[]> {
  const supabase = await createClient()

  // Try same category first
  if (categoryId) {
    const { data } = await supabase
      .from('posts')
      .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (data && data.length >= limit) return data.map(normalizePost)

    // Fill remaining slots with posts sharing tags
    if (tagIds.length > 0 && data && data.length < limit) {
      const existingIds = [postId, ...data.map((p) => p.id)]
      const { data: postIdRows } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds)
        .not('post_id', 'in', `(${existingIds.join(',')})`)

      const extraIds = [...new Set(postIdRows?.map((r) => r.post_id) ?? [])].slice(0, limit - data.length)
      if (extraIds.length > 0) {
        const { data: extra } = await supabase
          .from('posts')
          .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
          .eq('status', 'published')
          .in('id', extraIds)
          .limit(limit - data.length)
        return [...data, ...(extra ?? [])].map(normalizePost)
      }
      return data.map(normalizePost)
    }

    return (data ?? []).map(normalizePost)
  }

  // No category — use tags only
  if (tagIds.length > 0) {
    const { data: postIdRows } = await supabase
      .from('post_tags')
      .select('post_id')
      .in('tag_id', tagIds)
      .neq('post_id', postId)
    const ids = [...new Set(postIdRows?.map((r) => r.post_id) ?? [])].slice(0, limit)
    if (ids.length > 0) {
      const { data } = await supabase
        .from('posts')
        .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
        .eq('status', 'published')
        .in('id', ids)
        .limit(limit)
      return (data ?? []).map(normalizePost)
    }
  }

  // Fallback: latest posts
  const { data } = await supabase
    .from('posts')
    .select(`*, category:categories(*), tags:post_tags(tag:tags(*))`)
    .eq('status', 'published')
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(normalizePost)
}

// ── STATS (dashboard) ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: totalCategories },
    { count: pendingComments },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalPosts: totalPosts ?? 0,
    publishedPosts: publishedPosts ?? 0,
    draftPosts: draftPosts ?? 0,
    totalCategories: totalCategories ?? 0,
    pendingComments: pendingComments ?? 0,
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function normalizePost(raw: Record<string, unknown>): PostWithRelations {
  const tagRows = (raw.tags as Array<{ tag: Tag }> | null) ?? []
  return {
    ...(raw as unknown as Post),
    category: (raw.category as Category) ?? null,
    tags: tagRows.map((r) => r.tag).filter(Boolean),
  }
}
