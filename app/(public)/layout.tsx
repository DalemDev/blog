import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getCategories } from '@/lib/queries'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <>
      <Navbar categories={categories} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer categories={categories} />
    </>
  )
}
