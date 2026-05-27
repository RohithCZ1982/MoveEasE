'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Loader2, ArrowLeft, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const InvoicePDFButton = dynamic(() => import('@/components/pdf/InvoicePDFButton'), { ssr: false })

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [payment, setPayment] = useState({
    status: '',
    paidAmount: '',
    paymentMode: '',
    paymentDate: '',
    dueDate: '',
    notes: '',
  })

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(r => r.json())
      .then(data => {
        setInvoice(data)
        setPayment({
          status: data.status,
          paidAmount: data.paidAmount?.toString() || '0',
          paymentMode: data.paymentMode || '',
          paymentDate: data.paymentDate ? data.paymentDate.split('T')[0] : '',
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
          notes: data.notes || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!confirm('Cancel this invoice? This action marks it as CANCELLED.')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const data = await res.json()
      if (res.ok) {
        setInvoice(data)
        setPayment(p => ({ ...p, status: 'CANCELLED' }))
        toast({ title: 'Invoice cancelled' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setCancelling(false)
    }
  }

  async function handleUpdate() {
    setSaving(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: payment.status,
          paidAmount: parseFloat(payment.paidAmount) || 0,
          paymentMode: payment.paymentMode,
          paymentDate: payment.paymentDate || null,
          dueDate: payment.dueDate || null,
          notes: payment.notes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setInvoice(data)
        toast({ title: 'Invoice updated successfully' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!invoice || invoice.error) {
    return <div className="p-6 text-red-500">Invoice not found</div>
  }

  const customer = invoice.quotation?.customer || {}
  const quotation = invoice.quotation || {}

  return (
    <div>
      <Header title={`Invoice ${invoice.invoiceNumber}`} subtitle={`Customer: ${customer.name}`} />

      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <InvoicePDFButton invoice={invoice} />
            {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Cancel Invoice
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', getStatusColor(invoice.status))}>
            {invoice.status}
          </span>
          <span className="text-sm text-gray-500">Created: {formatDate(invoice.createdAt)}</span>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Customer</CardTitle></CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{customer.name}</p>
              <p className="text-gray-600">{customer.mobile}</p>
              {customer.email && <p className="text-gray-600">{customer.email}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Shift Details</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><span className="text-gray-500">Quotation:</span> {quotation.quotationNumber}</p>
              <p><span className="text-gray-500">Service:</span> {quotation.serviceType?.replace('_', ' ')}</p>
              {quotation.fromAddress && <p><span className="text-gray-500">From:</span> {quotation.fromAddress}</p>}
              {quotation.toAddress && <p><span className="text-gray-500">To:</span> {quotation.toAddress}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Items</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Unit</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, i: number) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2">{item.customName}</td>
                    <td className="py-2 text-center text-gray-500">{item.unit}</td>
                    <td className="py-2 text-center">{Number(item.quantity)}</td>
                    <td className="py-2 text-right">{formatCurrency(Number(item.rate))}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(Number(item.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Totals + Payment Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Financial Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(Number(invoice.subtotal))}</span>
              </div>
              {Number(invoice.discountAmount) > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(invoice.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">GST</span>
                <span>{formatCurrency(Number(invoice.gstAmount))}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-blue-700">{formatCurrency(Number(invoice.grandTotal))}</span>
              </div>
              {Number(invoice.paidAmount) > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(Number(invoice.paidAmount))}</span>
                  </div>
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(Number(invoice.dueAmount))}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Update */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Update Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Payment Status</Label>
                <Select value={payment.status} onValueChange={(v) => setPayment({ ...payment, status: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Amount Paid (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={payment.paidAmount}
                  onChange={(e) => setPayment({ ...payment, paidAmount: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Mode</Label>
                <Select value={payment.paymentMode} onValueChange={(v) => setPayment({ ...payment, paymentMode: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select mode..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Date</Label>
                <Input
                  type="date"
                  value={payment.paymentDate}
                  onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={payment.dueDate}
                  onChange={(e) => setPayment({ ...payment, dueDate: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input
                  value={payment.notes}
                  onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                  placeholder="Payment notes..."
                  className="h-9"
                />
              </div>

              <Button className="w-full" onClick={handleUpdate} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
