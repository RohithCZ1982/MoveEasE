'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, Search, FileText, Loader2, Eye, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react'
import TruckLoader from '@/components/ui/TruckLoader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Quotation {
  id: string
  quotationNumber: string
  status: string
  serviceType: string
  fromAddress: string
  toAddress: string
  shiftingDate?: string
  grandTotal: number
  createdAt: string
  customer: { id: string; name: string; mobile: string }
  invoice?: { id: string; invoiceNumber: string }
}

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'SENT', 'APPROVED', 'CONVERTED', 'CLOSED']

export default function QuotationsPage() {
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchQuotations = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}&limit=50` : '?limit=50'
      const res = await fetch(`/api/quotations${params}`)
      const data = await res.json()
      setQuotations(data.quotations || [])
      setTotal(data.total || 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load quotations', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => { fetchQuotations() }, [fetchQuotations])

  async function updateStatus(id: string, newStatus: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status: newStatus }),
      })
      if (res.ok) {
        toast({ title: `Status updated to ${newStatus}` })
        fetchQuotations()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  async function convertToInvoice(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Invoice created!', description: `Invoice #${data.invoiceNumber}` })
        fetchQuotations()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to convert', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      <Header title="Quotations" subtitle={`${total} total quotations`} />

      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full font-medium transition-colors',
                  statusFilter === s
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Link href="/quotations/new">
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> New Quotation
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <TruckLoader />
          </div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No quotations found</p>
            <Link href="/quotations/new">
              <Button className="mt-4">Create First Quotation</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotations.map((q) => (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-800">{q.quotationNumber}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(q.status))}>
                            {q.status}
                          </span>
                        </div>
                        <p className="font-medium text-gray-700">{q.customer.name}</p>
                        <p className="text-xs text-gray-400">{q.customer.mobile}</p>
                        {q.fromAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            {q.fromAddress} <ArrowRight className="inline h-3 w-3" /> {q.toAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-lg font-bold text-blue-700">{formatCurrency(Number(q.grandTotal))}</p>
                      <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                      {q.shiftingDate && (
                        <p className="text-xs text-orange-600 font-medium">Shift: {formatDate(q.shiftingDate)}</p>
                      )}

                      <div className="flex gap-2 flex-wrap justify-end">
                        <Link href={`/quotations/${q.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Eye className="mr-1 h-3 w-3" /> View
                          </Button>
                        </Link>

                        {q.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={actionLoading === q.id}
                            onClick={() => updateStatus(q.id, 'SENT')}
                          >
                            {actionLoading === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                            Send
                          </Button>
                        )}

                        {q.status === 'SENT' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            disabled={actionLoading === q.id}
                            onClick={() => updateStatus(q.id, 'APPROVED')}
                          >
                            {actionLoading === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                            Approve
                          </Button>
                        )}

                        {q.status === 'APPROVED' && !q.invoice && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-purple-600 hover:bg-purple-700"
                            disabled={actionLoading === q.id}
                            onClick={() => convertToInvoice(q.id)}
                          >
                            {actionLoading === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Convert to Invoice
                          </Button>
                        )}

                        {q.invoice && (
                          <Link href={`/invoices/${q.invoice.id}`}>
                            <Button size="sm" className="h-7 text-xs">
                              View Invoice
                            </Button>
                          </Link>
                        )}
                      </div>
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
