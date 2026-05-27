import { prisma } from '@/lib/prisma'
import Header from '@/components/admin/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { FileText, Users, Receipt, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

async function getDashboardData() {
  const [
    totalCustomers,
    pendingQuotations,
    approvedQuotations,
    totalInvoices,
    paidInvoices,
    recentQuotations,
    recentInvoices,
    revenue,
    upcomingShifts,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.quotation.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
    prisma.quotation.count({ where: { status: 'APPROVED' } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: 'PAID' } }),
    prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { quotation: { include: { customer: true } } },
    }),
    prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { grandTotal: true },
    }),
    prisma.quotation.findMany({
      where: {
        shiftingDate: { gte: new Date() },
        status: { in: ['APPROVED', 'CONVERTED'] },
      },
      take: 5,
      orderBy: { shiftingDate: 'asc' },
      include: { customer: true },
    }),
  ])

  return {
    totalCustomers,
    pendingQuotations,
    approvedQuotations,
    totalInvoices,
    paidInvoices,
    recentQuotations,
    recentInvoices,
    revenue: Number(revenue._sum.grandTotal || 0),
    upcomingShifts,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: 'Total Customers',
      value: data.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/customers',
    },
    {
      title: 'Pending Quotations',
      value: data.pendingQuotations,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/quotations',
    },
    {
      title: 'Approved Quotations',
      value: data.approvedQuotations,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/quotations',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.revenue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/invoices',
    },
    {
      title: 'Total Invoices',
      value: data.totalInvoices,
      icon: Receipt,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      href: '/invoices',
    },
    {
      title: 'Paid Invoices',
      value: data.paidInvoices,
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      href: '/invoices',
    },
  ]

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome to SwiftShift Movers" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn('p-3 rounded-xl', stat.bg)}>
                      <Icon className={cn('h-6 w-6', stat.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quotations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Quotations</CardTitle>
              <Link href="/quotations" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentQuotations.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No quotations yet</p>
                ) : (
                  data.recentQuotations.map((q) => (
                    <Link key={q.id} href={`/quotations/${q.id}`}>
                      <div className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 px-2 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{q.customer.name}</p>
                          <p className="text-xs text-gray-400">{q.quotationNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(q.status))}>
                            {q.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(Number(q.grandTotal))}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Shifts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Upcoming Shifts</CardTitle>
              <Link href="/quotations" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingShifts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No upcoming shifts</p>
                ) : (
                  data.upcomingShifts.map((q) => (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{q.customer.name}</p>
                        <p className="text-xs text-gray-400">{q.fromAddress} → {q.toAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-orange-600">
                          {q.shiftingDate ? formatDate(q.shiftingDate) : 'TBD'}
                        </p>
                        <p className="text-xs text-gray-400">{q.serviceType.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
