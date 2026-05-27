'use client'

import { signOut, useSession } from 'next-auth/react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export default function CustomerNav() {
  const { data: session } = useSession()

  return (
    <header className="bg-[#1e3a5f] text-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Logo size="md" className="[&_span]:text-white [&_span.text-orange-500]:text-orange-400" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm hidden sm:block">{session?.user?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-100 hover:text-white hover:bg-blue-800"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
