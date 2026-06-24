'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader } from './ImageUploader'
import { createClient } from '@/lib/supabase/client'
import { slugify, calcReadTime } from '@/lib/utils'
import type { Category, Tag, PostWithRelations } from '@/types'
import { ImageIcon, Loader2 } from 'lucide-react'
import { commands as mdCommands } from '@uiw/react-md-editor'
import type { ICommand } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostEditorProps {
  categories: Category[]
  tags: Tag[]
  post?: PostWithRelations
}

export function PostEditor({ categories, tags, post }: PostEditorProps) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags?.map((t) => t.id) ?? [])
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingInline, setUploadingInline] = useState(false)

  const inlineFileRef = useRef<HTMLInputElement>(null)
  const editorApiRef = useRef<{ replaceSelection: (text: string) => void } | null>(null)

  const insertImageCommand = useMemo<ICommand>(() => ({
    name: 'insert-inline-image',
    keyCommand: 'insertInlineImage',
    buttonProps: { 'aria-label': 'Subir e insertar imagen', title: 'Subir imagen al contenido' },
    icon: <ImageIcon size={12} />,
    execute: (_state, api) => {
      editorApiRef.current = api as { replaceSelection: (text: string) => void }
      inlineFileRef.current?.click()
    },
  }), [])

  async function handleInlineImage(file: File) {
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen no puede superar 5MB.'); return }

    setUploadingInline(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, file, { upsert: false })

    if (uploadError) { setError('Error al subir la imagen.'); setUploadingInline(false); return }

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    editorApiRef.current?.replaceSelection(`\n![imagen](${data.publicUrl})\n`)
    setUploadingInline(false)
  }

  // Auto-generate slug from title (only when creating)
  useEffect(() => {
    if (!post && title) setSlug(slugify(title))
  }, [title, post])

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSave(saveStatus: 'draft' | 'published') {
    setSaving(true)
    setError(null)

    const readTime = calcReadTime(content)
    const { data: { user } } = await supabase.auth.getUser()

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      author_id: user?.id ?? null,
      status: saveStatus,
      read_time: readTime,
      published_at: saveStatus === 'published' ? (post?.published_at ?? new Date().toISOString()) : null,
    }

    let postId = post?.id

    if (post) {
      const { error } = await supabase.from('posts').update(postData).eq('id', post.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('posts').insert(postData).select('id').single()
      if (error) { setError(error.message); setSaving(false); return }
      postId = data.id
    }

    // Sync tags
    await supabase.from('post_tags').delete().eq('post_id', postId)
    if (selectedTags.length > 0) {
      await supabase.from('post_tags').insert(
        selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId }))
      )
    }

    setSaving(false)
    setStatus(saveStatus)
    router.push('/admin/posts')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <input
        ref={inlineFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleInlineImage(file)
          e.target.value = ''
        }}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Título del artículo"
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(slugify(e.target.value))}
              placeholder="url-del-articulo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Breve descripción del artículo (aparece en la grilla y SEO)"
            />
          </div>

          {/* Markdown editor */}
          <div className="space-y-1.5">
            <Label>Contenido *</Label>
            <div data-color-mode="auto">
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? '')}
                height={500}
                preview="live"
                commands={[...mdCommands.getCommands(), mdCommands.divider, insertImageCommand]}
              />
            </div>
            {uploadingInline && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Subiendo imagen...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Cover image */}
          <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} />

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger>
                <SelectValue>
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name
                    : <span className="text-muted-foreground">Seleccionar categoría</span>}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent text-muted-foreground'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
        <Button onClick={() => handleSave('published')} disabled={saving || !title.trim() || !content.trim()}>
          {saving ? 'Guardando...' : status === 'published' ? 'Actualizar' : 'Publicar'}
        </Button>
        <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving || !title.trim()}>
          Guardar borrador
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
