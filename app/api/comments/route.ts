import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { post_id, author_name, author_email, content } = body

    if (!post_id || !author_name?.trim() || !author_email?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Campos requeridos faltantes.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('comments').insert({
      post_id,
      author_name: author_name.trim(),
      author_email: author_email.trim(),
      content: content.trim(),
      status: 'pending',
    })

    if (error) throw error

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Error creating comment:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
