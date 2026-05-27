import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Logo } from '@/components/shared/Logo'
import { signOut } from 'next-auth/react'
import CustomerNav from '@/components/shared/CustomerNav'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
