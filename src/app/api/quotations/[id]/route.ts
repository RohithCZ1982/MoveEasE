import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'
import { ItemUnit } from '@prisma/client'

type Params = Promise<{ id: string }>

export async function GET(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { item: true } },
      invoice: true,
    },
  })

  if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role === 'CUSTOMER' && quotation.customerId !== session.user.customerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(quotation)
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { items, ...rest } = body

    const quotation = await prisma.$transaction(async (tx) => {
      await tx.quotation.update({
        where: { id },
        data: {
          ...rest,
          shiftingDate: rest.shiftingDate ? new Date(rest.shiftingDate) : null,
          validUntil: rest.validUntil ? new Date(rest.validUntil) : null,
        },
      })

      if (items) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } })
        await tx.quotationItem.createMany({
          data: items.map((item: {
            itemId?: string
            customName?: string
            unit: ItemUnit
            quantity: number
            rate: number
            amount: number
          }) => ({
            quotationId: id,
            itemId: item.itemId || null,
            customName: item.customName || null,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        })
      }

      return tx.quotation.findUnique({
        where: { id },
        include: { customer: true, items: { include: { item: true } } },
      })
    })

    return NextResponse.json(quotation)
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
    await prisma.quotation.delete({ where: { id } })
    return NextResponse.json({ message: 'Quotation deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'convert') {
      const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: { items: true, invoice: true },
      })

      if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (quotation.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Only approved quotations can be converted' }, { status: 400 })
      }
      if (quotation.invoice) {
        return NextResponse.json({ error: 'Invoice already exists' }, { status: 400 })
      }

      // Accept optional overrides from the pre-convert dialog
      const finalDiscountType = body.discountType ?? quotation.discountType
      const finalDiscountAmount = body.discountAmount !== undefined ? body.discountAmount : Number(quotation.discountAmount)
      const finalGstAmount = body.gstAmount !== undefined ? body.gstAmount : Number(quotation.gstAmount)
      const finalGrandTotal = body.grandTotal !== undefined ? body.grandTotal : Number(quotation.grandTotal)

      const invoiceNumber = generateInvoiceNumber()

      const invoice = await prisma.$transaction(async (tx) => {
        // Update quotation with final discount/total values
        await tx.quotation.update({
          where: { id },
          data: {
            discountType: finalDiscountType,
            discountValue: body.discountValue !== undefined ? body.discountValue : quotation.discountValue,
            discountAmount: finalDiscountAmount,
            gstAmount: finalGstAmount,
            grandTotal: finalGrandTotal,
            status: 'CONVERTED',
          },
        })

        const inv = await tx.invoice.create({
          data: {
            invoiceNumber,
            quotationId: quotation.id,
            status: 'UNPAID',
            laborCharges: quotation.laborCharges,
            truckCharges: quotation.truckCharges,
            insuranceAmount: quotation.insuranceAmount,
            packingCharges: quotation.packingCharges,
            subtotal: quotation.subtotal,
            discountAmount: finalDiscountAmount,
            gstAmount: finalGstAmount,
            grandTotal: finalGrandTotal,
            paidAmount: 0,
            dueAmount: finalGrandTotal,
          },
        })

        await tx.invoiceItem.createMany({
          data: quotation.items.map((item) => ({
            invoiceId: inv.id,
            customName: item.customName,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        })

        return inv
      })

      return NextResponse.json(invoice)
    }

    if (action === 'updateStatus') {
      const { status } = body
      const quotation = await prisma.quotation.update({
        where: { id },
        data: { status },
      })
      return NextResponse.json(quotation)
    }

    if (action === 'cancel') {
      const { cancelReason } = body
      if (!cancelReason?.trim()) {
        return NextResponse.json({ error: 'A cancellation reason is required' }, { status: 400 })
      }

      const quotation = await prisma.quotation.findUnique({ where: { id } })
      if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      if (['CONVERTED', 'CLOSED', 'CANCELLED'].includes(quotation.status)) {
        return NextResponse.json(
          { error: `Cannot cancel a quotation with status ${quotation.status}` },
          { status: 400 }
        )
      }

      const updated = await prisma.quotation.update({
        where: { id },
        data: { status: 'CANCELLED', cancelReason: cancelReason.trim() },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
