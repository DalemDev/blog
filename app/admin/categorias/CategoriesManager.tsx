'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

const COLOR_OPTIONS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

interface FormState {
  name: string
  description: string
  color: string
  icon: string
}

const emptyForm: FormState = { name: '', description: '', color: '#6366f1', icon: 'folder' }

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description ?? '', color: cat.color, icon: cat.icon })
    setEditingId(cat.id)
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const data = {
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description.trim() || null,
      color: form.color,
      icon: form.icon,
    }

    const { error } = editingId
      ? await supabase.from('categories').update(data).eq('id', editingId)
      : await supabase.from('categories').insert(data)

    setSaving(false)
    if (error) { setError(error.message); return }
    cancel()
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los posts vinculados quedarán sin categoría.')) return
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Button onClick={startCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva categoría
      </Button>

      {showForm && (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Programación"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={slugify(form.name)} readOnly className="text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="ghost" onClick={cancel}><X className="h-4 w-4 mr-2" />Cancelar</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Color</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{cat.slug}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted-foreground">{cat.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
