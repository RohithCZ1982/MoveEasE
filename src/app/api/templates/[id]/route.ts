import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function PUT(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { name, description, items } = body

    const template = await prisma.$transaction(async (tx) => {
      await tx.template.update({ where: { id }, data: { name, description } })
      await tx.templateItem.deleteMany({ where: { templateId: id } })

      if (items?.length) {
        await tx.templateItem.createMany({
          data: items.map((item: { itemId: string; quantity: number; rate: number }) => ({
            templateId: id,
            itemId: item.itemId,
            quantity: item.quantity,
            rate: item.rate,
          })),
        })
      }

      return tx.template.findUnique({
        where: { id },
        include: { items: { include: { item: true } } },
      })
    })

    return NextResponse.json(template)
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
    await prisma.template.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ message: 'Template deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
