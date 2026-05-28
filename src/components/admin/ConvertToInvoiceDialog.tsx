'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Loader2, Pencil, Check, X, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (invoiceId: string, invoiceNumber: string) => void
  quotation: {
    id: string
    quotationNumber: string
    subtotal: number
    discountType: string
    discountValue: number
    discountAmount: number
    gstRate: number
    gstAmount: number
    grandTotal: number
  }
}

export default function ConvertToInvoiceDialog({ open, onClose, onSuccess, quotation }: Props) {
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount')
  const [discountValue, setDiscountValue] = useState('0')
  const [editingTotal, setEditingTotal] = useState(false)
  const [manualTotal, setManualTotal] = useState('')
  const [converting, setConverting] = useState(false)

  // Derived calculations
  const subtotal = Number(quotation.subtotal)
  const gstRate = Number(quotation.gstRate)

  const discountAmount =
    discountType === 'percentage'
      ? (subtotal * (parseFloat(discountValue) || 0)) / 100
      : parseFloat(discountValue) || 0

  const taxable = subtotal - discountAmount
  const gstAmount = (taxable * gstRate) / 100
  const calculatedTotal = taxable + gstAmount
  const finalTotal = manualTotal !== '' ? parseFloat(manualTotal) || 0 : calculatedTotal

  // Pre-fill from quotation when dialog opens
  useEffect(() => {
    if (open) {
      setDiscountType((quotation.discountType as 'amount' | 'percentage') || 'amount')
      setDiscountValue(String(quotation.discountValue || 0))
      setManualTotal('')
      setEditingTotal(false)
    }
  }, [open, quotation])

  async function handleConvert() {
    setConverting(true)
    try {
      const res = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert',
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount,
          gstAmount,
          grandTotal: finalTotal,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        onSuccess(data.id, data.invoiceNumber)
        onClose()
      } else {
        alert(data.error || 'Failed to convert')
      }
    } catch {
      alert('Failed to convert')
    } finally {
      setConverting(false)
    }
  }

  const diff = Math.abs(finalTotal - calculatedTotal)
  const isModified = diff > 0.01

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Convert to Invoice — {quotation.quotationNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Subtotal (read-only) */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Adjustable Discount */}
          <div className="space-y-1.5">
            <Label className="text-sm">Adjust Discount</Label>
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'amount' | 'percentage')}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => { setDiscountValue(e.target.value); setManualTotal('') }}
                className="h-9 flex-1"
                placeholder={discountType === 'percentage' ? '0%' : '₹0'}
              />
            </div>
          </div>

          {/* Calculated breakdown */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>GST ({gstRate}%)</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-700 border-t pt-1.5">
              <span>Calculated Total</span>
              <span>{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>

          {/* Editable Grand Total */}
          <div className="border rounded-lg p-3 space-y-1">
            <Label className="text-sm font-semibold">Final Grand Total</Label>
            {editingTotal ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400">₹</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  className="h-9 font-bold text-blue-700 flex-1"
                  autoFocus
                />
                <button
                  onClick={() => setEditingTotal(false)}
                  className="p-1.5 rounded hover:bg-green-50 text-green-600"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setManualTotal(''); setEditingTotal(false) }}
                  className="p-1.5 rounded hover:bg-red-50 text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold text-blue-700">{formatCurrency(finalTotal)}</span>
                <button
                  onClick={() => { setManualTotal(String(Math.round(finalTotal))); setEditingTotal(true) }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
            )}
            {isModified && (
              <p className="text-xs text-orange-500 mt-1">
                Manual override: differs from calculated total by {formatCurrency(Math.abs(finalTotal - calculatedTotal))}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConvert}
            disabled={converting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {converting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
