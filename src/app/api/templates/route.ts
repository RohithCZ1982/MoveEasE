import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.template.findMany({
    where: { isActive: true },
    include: {
      items: { include: { item: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, items } = body

    if (!name) return NextResponse.json({ error: 'Template name is required' }, { status: 400 })

    const template = await prisma.$transaction(async (tx) => {
      const t = await tx.template.create({ data: { name, description } })

      if (items?.length) {
        await tx.templateItem.createMany({
          data: items.map((item: { itemId: string; quantity: number; rate: number }) => ({
            templateId: t.id,
            itemId: item.itemId,
            quantity: item.quantity,
            rate: item.rate,
          })),
        })
      }

      return tx.template.findUnique({
        where: { id: t.id },
        include: { items: { include: { item: true } } },
      })
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
