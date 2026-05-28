import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function GET(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      quotation: { include: { customer: true } },
      items: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CUSTOMER' &&
      invoice.quotation.customerId !== session.user.customerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(invoice)
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { status, paidAmount, paymentMode, paymentDate, dueDate, notes } = body

    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newPaidAmount = paidAmount !== undefined ? paidAmount : Number(invoice.paidAmount)
    const dueAmount = Number(invoice.grandTotal) - newPaidAmount
    const newStatus = status || invoice.status

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: {
          status: newStatus,
          paidAmount: newPaidAmount,
          dueAmount: Math.max(0, dueAmount),
          paymentMode,
          paymentDate: paymentDate ? new Date(paymentDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
        },
        include: {
          quotation: { include: { customer: true } },
          items: true,
        },
      })

      // Auto-close the quotation when invoice is fully paid
      if (newStatus === 'PAID') {
        await tx.quotation.update({
          where: { id: inv.quotation.id },
          data: { status: 'CLOSED' },
        })
      }

      return inv
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
