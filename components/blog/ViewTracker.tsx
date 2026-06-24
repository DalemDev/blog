'use client'

import { useEffect, useRef } from 'react'

export function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch(`/api/views/${slug}`, { method: 'POST' })
  }, [slug])
  return null
}
