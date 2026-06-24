export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  category_id: string | null
  author_id: string | null
  status: 'draft' | 'published'
  read_time: number
  views: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface PostWithRelations extends Post {
  category: Category | null
  tags: Tag[]
  comments?: Comment[]
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
