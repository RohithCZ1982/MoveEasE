'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Receipt, Loader2, Eye, ArrowRight } from 'lucide-react'
import TruckLoader from '@/components/ui/TruckLoader'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  grandTotal: number
  paidAmount: number
  dueAmount: number
  createdAt: string
  dueDate?: string
  quotation: {
    quotationNumber: string
    customer: { name: string; mobile: string }
    serviceType: string
    fromAddress?: string
    toAddress?: string
  }
}

const STATUS_OPTIONS = ['ALL', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED']

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}&limit=50` : '?limit=50'
      const res = await fetch(`/api/invoices${params}`)
      const data = await res.json()
      setInvoices(data.invoices || [])
      setTotal(data.total || 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load invoices', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  return (
    <div>
      <Header title="Invoices" subtitle={`${total} total invoices`} />

      <div className="p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1 text-xs rounded-full font-medium transition-colors',
                statusFilter === s ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <TruckLoader />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">Convert approved quotations to create invoices</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{inv.invoiceNumber}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(inv.status))}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700">{inv.quotation.customer.name}</p>
                      <p className="text-xs text-gray-400">{inv.quotation.customer.mobile}</p>
                      {inv.quotation.fromAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          {inv.quotation.fromAddress} <ArrowRight className="inline h-3 w-3" /> {inv.quotation.toAddress}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(Number(inv.grandTotal))}</p>
                        {Number(inv.paidAmount) > 0 && (
                          <p className="text-xs text-green-600">Paid: {formatCurrency(Number(inv.paidAmount))}</p>
                        )}
                        {Number(inv.dueAmount) > 0 && (
                          <p className="text-xs text-red-500">Due: {formatCurrency(Number(inv.dueAmount))}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(inv.createdAt)}</p>
                      {inv.dueDate && (
                        <p className="text-xs text-orange-500">Due by: {formatDate(inv.dueDate)}</p>
                      )}

                      <Link href={`/invoices/${inv.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Eye className="mr-1 h-3 w-3" /> View & Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
