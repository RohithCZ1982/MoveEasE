'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, FileText, Loader2, Eye, RefreshCw, CheckCircle, ArrowRight, XCircle, AlertCircle } from 'lucide-react'
import TruckLoader from '@/components/ui/TruckLoader'
import ConvertToInvoiceDialog from '@/components/admin/ConvertToInvoiceDialog'

interface Quotation {
  id: string
  quotationNumber: string
  status: string
  serviceType: string
  fromAddress: string
  toAddress: string
  shiftingDate?: string
  subtotal: number
  discountType: string
  discountValue: number
  discountAmount: number
  gstRate: number
  gstAmount: number
  grandTotal: number
  createdAt: string
  cancelReason?: string
  customer: { id: string; name: string; mobile: string }
  invoice?: { id: string; invoiceNumber: string }
}

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'SENT', 'APPROVED', 'CONVERTED', 'CLOSED', 'CANCELLED']

const CANCELLABLE = ['DRAFT', 'SENT', 'APPROVED']

export default function QuotationsPage() {
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Quotation | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [convertTarget, setConvertTarget] = useState<Quotation | null>(null)

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


  function openCancelDialog(q: Quotation) {
    setCancelTarget(q)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  async function handleCancel() {
    if (!cancelTarget) return
    if (!cancelReason.trim()) {
      toast({ title: 'Reason required', description: 'Please enter a cancellation reason', variant: 'destructive' })
      return
    }
    setCancelling(true)
    try {
      const res = await fetch(`/api/quotations/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Quotation cancelled' })
        setCancelDialogOpen(false)
        fetchQuotations()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setCancelling(false)
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
            {statusFilter === 'ALL' && (
              <Link href="/quotations/new">
                <Button className="mt-4">Create First Quotation</Button>
              </Link>
            )}
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
                        {q.status === 'CANCELLED' && q.cancelReason && (
                          <div className="flex items-start gap-1 mt-1.5">
                            <AlertCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-500 italic">{q.cancelReason}</p>
                          </div>
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
                            onClick={() => setConvertTarget(q)}
                          >
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

                        {CANCELLABLE.includes(q.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            disabled={actionLoading === q.id}
                            onClick={() => openCancelDialog(q)}
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Cancel
                          </Button>
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

      {/* Convert to Invoice Dialog */}
      {convertTarget && (
        <ConvertToInvoiceDialog
          open={!!convertTarget}
          onClose={() => setConvertTarget(null)}
          onSuccess={(_, invoiceNumber) => {
            toast({ title: 'Invoice created!', description: `Invoice #${invoiceNumber}` })
            setConvertTarget(null)
            fetchQuotations()
          }}
          quotation={{
            id: convertTarget.id,
            quotationNumber: convertTarget.quotationNumber,
            subtotal: Number(convertTarget.subtotal),
            discountType: convertTarget.discountType,
            discountValue: Number(convertTarget.discountValue),
            discountAmount: Number(convertTarget.discountAmount),
            gstRate: Number(convertTarget.gstRate),
            gstAmount: Number(convertTarget.gstAmount),
            grandTotal: Number(convertTarget.grandTotal),
          }}
        />
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Quotation {cancelTarget?.quotationNumber}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              This will permanently cancel the quotation for <strong>{cancelTarget?.customer.name}</strong>. Please provide a reason.
            </p>
            <div className="space-y-1">
              <Label htmlFor="cancelReason">Cancellation Reason *</Label>
              <textarea
                id="cancelReason"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="e.g. Customer changed plans, Budget constraints..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Quotation</Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
