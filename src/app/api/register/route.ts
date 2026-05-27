import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, mobile, password } = parsed.data

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Check if mobile exists
    const existingCustomer = await prisma.customer.findUnique({ where: { mobile } })
    if (existingCustomer) {
      return NextResponse.json({ error: 'Mobile number already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create customer and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: { name, mobile, email },
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CUSTOMER',
          customerId: customer.id,
        },
      })

      return { user, customer }
    })

    return NextResponse.json(
      { message: 'Account created successfully', userId: result.user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
