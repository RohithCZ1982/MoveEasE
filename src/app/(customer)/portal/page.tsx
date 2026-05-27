'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { FileText, Receipt, Loader2, Download, ArrowRight, Phone } from 'lucide-react'
import dynamic from 'next/dynamic'

const QuotationPDFButton = dynamic(() => import('@/components/pdf/QuotationPDFButton'), { ssr: false })
const InvoicePDFButton = dynamic(() => import('@/components/pdf/InvoicePDFButton'), { ssr: false })

export default function CustomerPortal() {
  const { data: session } = useSession()
  const [quotations, setQuotations] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'quotations' | 'invoices'>('quotations')

  useEffect(() => {
    if (!session?.user?.customerId) return
    Promise.all([
      fetch('/api/quotations?limit=50').then(r => r.json()),
      fetch('/api/invoices?limit=50').then(r => r.json()),
    ]).then(([qData, iData]) => {
      setQuotations(qData.quotations || [])
      setInvoices(iData.invoices || [])
      setLoading(false)
    })
  }, [session])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotations', value: quotations.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active Quotations', value: quotations.filter(q => ['SENT', 'APPROVED'].includes(q.status)).length, color: 'bg-green-50 text-green-700' },
          { label: 'Total Invoices', value: invoices.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Pending Payment', value: invoices.filter(i => ['UNPAID', 'PARTIAL'].includes(i.status)).length, color: 'bg-orange-50 text-orange-700' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={cn('text-2xl font-bold rounded-lg py-2', stat.color)}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['quotations', 'invoices'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2',
              tab === t ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tab === 'quotations' ? (
        <div className="space-y-3">
          {quotations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No quotations yet</p>
              <p className="text-sm text-gray-400 mt-1">Contact us to get a moving quote</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-blue-700">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 98765 43210</span>
              </div>
            </div>
          ) : (
            quotations.map((q) => (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-600">{q.quotationNumber}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(q.status))}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {q.serviceType?.replace('_', ' ')}
                      </p>
                      {q.fromAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          {q.fromAddress} <ArrowRight className="inline h-3 w-3" /> {q.toAddress}
                        </p>
                      )}
                      {q.shiftingDate && (
                        <p className="text-xs text-orange-600 mt-1">Shift Date: {formatDate(q.shiftingDate)}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(Number(q.grandTotal))}</p>
                      <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                      <QuotationPDFButton quotation={{ ...q, customer: q.customer }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No invoices yet</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <Card key={inv.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-600">{inv.invoiceNumber}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(inv.status))}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{inv.quotation?.serviceType?.replace('_', ' ')}</p>
                      {inv.dueDate && (
                        <p className="text-xs text-red-500 mt-1">Due: {formatDate(inv.dueDate)}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(Number(inv.grandTotal))}</p>
                      {Number(inv.paidAmount) > 0 && (
                        <p className="text-xs text-green-600">Paid: {formatCurrency(Number(inv.paidAmount))}</p>
                      )}
                      {Number(inv.dueAmount) > 0 && (
                        <p className="text-xs text-red-500">Balance: {formatCurrency(Number(inv.dueAmount))}</p>
                      )}
                      <InvoicePDFButton invoice={inv} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
