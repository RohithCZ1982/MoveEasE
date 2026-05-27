import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQuotationNumber } from '@/lib/utils'
import { ItemUnit } from '@prisma/client'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (status) where.status = status
  if (customerId) where.customerId = customerId

  // Customers can only see their own quotations
  if (session.user.role === 'CUSTOMER') {
    where.customerId = session.user.customerId
  }

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, invoice: true },
    }),
    prisma.quotation.count({ where }),
  ])

  return NextResponse.json({ quotations, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      customerId,
      serviceType,
      fromAddress,
      toAddress,
      shiftingDate,
      items,
      laborCharges,
      truckCharges,
      insuranceAmount,
      packingCharges,
      discountType,
      discountValue,
      discountAmount,
      gstRate,
      gstAmount,
      subtotal,
      grandTotal,
      notes,
      terms,
      validUntil,
      status,
    } = body

    if (!customerId) return NextResponse.json({ error: 'Customer is required' }, { status: 400 })
    if (!items?.length) return NextResponse.json({ error: 'At least one item is required' }, { status: 400 })

    const quotationNumber = generateQuotationNumber()

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId,
          serviceType,
          fromAddress,
          toAddress,
          shiftingDate: shiftingDate ? new Date(shiftingDate) : null,
          laborCharges: laborCharges || 0,
          truckCharges: truckCharges || 0,
          insuranceAmount: insuranceAmount || 0,
          packingCharges: packingCharges || 0,
          discountType: discountType || 'amount',
          discountValue: discountValue || 0,
          discountAmount: discountAmount || 0,
          gstRate: gstRate || 18,
          gstAmount: gstAmount || 0,
          subtotal: subtotal || 0,
          grandTotal: grandTotal || 0,
          notes,
          terms,
          validUntil: validUntil ? new Date(validUntil) : null,
          status: status || 'DRAFT',
        },
      })

      await tx.quotationItem.createMany({
        data: items.map((item: {
          itemId?: string
          customName?: string
          unit: ItemUnit
          quantity: number
          rate: number
          amount: number
        }) => ({
          quotationId: q.id,
          itemId: item.itemId || null,
          customName: item.customName || null,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      })

      return tx.quotation.findUnique({
        where: { id: q.id },
        include: { customer: true, items: { include: { item: true } } },
      })
    })

    return NextResponse.json(quotation, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
