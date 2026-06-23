import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries'
import { CategoriesManager } from './CategoriesManager'

export const metadata: Metadata = { title: 'Categorías' }

export default async function AdminCategoriasPage() {
  const categories = await getCategories()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">Gestiona las categorías del blog</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  )
}
