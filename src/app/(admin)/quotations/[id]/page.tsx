'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Loader2, Download, ArrowLeft, FileText, CheckCircle, RefreshCw, Printer } from 'lucide-react'
import dynamic from 'next/dynamic'
import TruckLoader from '@/components/ui/TruckLoader'

const QuotationPDFButton = dynamic(() => import('@/components/pdf/QuotationPDFButton'), { ssr: false })

export default function QuotationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/quotations/${id}`)
      .then(r => r.json())
      .then(data => { setQuotation(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [id])

  async function updateStatus(newStatus: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status: newStatus }),
      })
      if (res.ok) {
        toast({ title: `Status updated to ${newStatus}` })
        const data = await fetch(`/api/quotations/${id}`).then(r => r.json())
        setQuotation(data)
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  async function convertToInvoice() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Invoice created!', description: `Invoice #${data.invoiceNumber}` })
        router.push(`/invoices/${data.id}`)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <TruckLoader />
      </div>
    )
  }

  if (!quotation || quotation.error) {
    return <div className="p-6 text-red-500">Quotation not found</div>
  }

  return (
    <div>
      <Header title={`Quotation ${quotation.quotationNumber}`} subtitle={`Customer: ${quotation.customer?.name}`} />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2 flex-wrap">
            {quotation.status === 'DRAFT' && (
              <Button
                variant="outline"
                onClick={() => updateStatus('SENT')}
                disabled={actionLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Mark as Sent
              </Button>
            )}
            {quotation.status === 'SENT' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus('APPROVED')}
                disabled={actionLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            )}
            {quotation.status === 'APPROVED' && !quotation.invoice && (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={convertToInvoice}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Convert to Invoice
              </Button>
            )}
            {quotation.invoice && (
              <Link href={`/invoices/${quotation.invoice.id}`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> View Invoice
                </Button>
              </Link>
            )}
            <QuotationPDFButton quotation={quotation} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', getStatusColor(quotation.status))}>
            {quotation.status}
          </span>
          {quotation.validUntil && (
            <span className="text-sm text-gray-500">Valid until: {formatDate(quotation.validUntil)}</span>
          )}
        </div>

        {/* Quotation Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Customer Details</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-lg">{quotation.customer?.name}</p>
              <p className="text-gray-600">{quotation.customer?.mobile}</p>
              {quotation.customer?.email && <p className="text-gray-600">{quotation.customer.email}</p>}
              {quotation.customer?.address && <p className="text-gray-500 text-sm">{quotation.customer.address}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Shift Information</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm"><span className="text-gray-500">Service:</span> {quotation.serviceType?.replace('_', ' ')}</p>
              <p className="text-sm"><span className="text-gray-500">From:</span> {quotation.fromAddress}</p>
              <p className="text-sm"><span className="text-gray-500">To:</span> {quotation.toAddress}</p>
              {quotation.shiftingDate && (
                <p className="text-sm"><span className="text-gray-500">Date:</span> {formatDate(quotation.shiftingDate)}</p>
              )}
              <p className="text-sm"><span className="text-gray-500">Created:</span> {formatDate(quotation.createdAt)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Packing Items</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Unit</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.map((item: any, i: number) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2">{item.customName || item.item?.name}</td>
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

        {/* Financial Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-sm">
                {[
                  { label: 'Subtotal', value: quotation.subtotal },
                  { label: 'Labor Charges', value: quotation.laborCharges },
                  { label: 'Truck Charges', value: quotation.truckCharges },
                  { label: 'Insurance', value: quotation.insuranceAmount },
                  { label: 'Packing Charges', value: quotation.packingCharges },
                ].filter(item => Number(item.value) > 0).map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span>{formatCurrency(Number(value))}</span>
                  </div>
                ))}
                {Number(quotation.discountAmount) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-{formatCurrency(Number(quotation.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">GST ({Number(quotation.gstRate)}%)</span>
                  <span>{formatCurrency(Number(quotation.gstAmount))}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Grand Total</span>
                  <span className="text-blue-700">{formatCurrency(Number(quotation.grandTotal))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {quotation.notes && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-gray-600">{quotation.notes}</p></CardContent>
          </Card>
        )}

        {quotation.terms && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Terms & Conditions</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-gray-600 whitespace-pre-line">{quotation.terms}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
