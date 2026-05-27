import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { customerSchema } from '@/lib/validations'

type Params = Promise<{ id: string }>

export async function GET(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      quotations: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { invoice: true },
      },
    },
  })

  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CUSTOMER' && session.user.customerId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(customer)
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = customerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const existing = await prisma.customer.findFirst({
      where: { mobile: parsed.data.mobile, NOT: { id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Mobile number already exists' }, { status: 409 })
    }

    const customer = await prisma.customer.update({ where: { id }, data: parsed.data })
    return NextResponse.json(customer)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ message: 'Customer deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
