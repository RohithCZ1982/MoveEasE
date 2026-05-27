import { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: UserRole
    customerId?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      customerId?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
    customerId?: string | null
  }
}
