import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { truckSchema, loaderSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [trucks, loaders] = await Promise.all([
    prisma.truck.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.loader.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return NextResponse.json({ trucks, loaders })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, ...data } = body

    if (type === 'truck') {
      const parsed = truckSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
      }
      const truck = await prisma.truck.create({ data: parsed.data })
      return NextResponse.json(truck, { status: 201 })
    }

    if (type === 'loader') {
      const parsed = loaderSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
      }
      const loader = await prisma.loader.create({ data: parsed.data })
      return NextResponse.json(loader, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
