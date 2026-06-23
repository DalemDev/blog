'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Tag } from '@/types'

export function TagsManager({ tags }: { tags: Tag[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('tags').insert({ name: name.trim(), slug: slugify(name) })
    setSaving(false)
    if (error) { setError(error.message); return }
    setName('')
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este tag?')) return
    await supabase.from('tags').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Nombre del tag"
          className="flex-1"
        />
        <Button type="submit" disabled={saving || !name.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">
            #{tag.name}
            <button
              onClick={() => handleDelete(tag.id)}
              className="ml-1 hover:text-destructive transition-colors"
              aria-label={`Eliminar ${tag.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-muted-foreground text-sm">No hay tags aún.</p>}
      </div>
    </div>
  )
}
