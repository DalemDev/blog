import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  await supabase.rpc('increment_post_views', { post_slug: slug })
  return NextResponse.json({ ok: true })
}
