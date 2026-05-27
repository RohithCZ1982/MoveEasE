'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useQuotationStore, QuotationItem } from '@/store'
import AddCustomerModal from '@/components/admin/AddCustomerModal'
import { formatCurrency } from '@/lib/utils'
import {
  Plus, Trash2, Search, UserPlus, Loader2, ChevronDown, Package,
} from 'lucide-react'

interface Customer { id: string; name: string; mobile: string; email?: string }
interface ItemMaster { id: string; name: string; unit: string; defaultRate: number }
interface Template {
  id: string; name: string;
  items: { item: ItemMaster; quantity: number; rate: number }[]
}

const SERVICE_TYPES = [
  { value: 'LOCAL_SHIFT', label: 'Local Household Shifting' },
  { value: 'INTERSTATE', label: 'Interstate Shifting' },
  { value: 'INTERNATIONAL', label: 'International Relocation' },
  { value: 'CAR_TRANSPORT', label: 'Car Transportation' },
  { value: 'OFFICE_SHIFTING', label: 'Office Shifting' },
  { value: 'WAREHOUSE', label: 'Warehouse Storage' },
]

const UNITS = ['NOS', 'KG', 'METER', 'BOX', 'ROLL']

export default function NewQuotationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { form, setField, setCustomer, addItem, updateItem, removeItem, setTemplateItems, reset } = useQuotationStore()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('DRAFT')

  useEffect(() => {
    reset()
    Promise.all([
      fetch('/api/items').then(r => r.json()),
      fetch('/api/templates').then(r => r.json()),
    ]).then(([items, tmpl]) => {
      setItemMasters(Array.isArray(items) ? items : [])
      setTemplates(Array.isArray(tmpl) ? tmpl : [])
    })
  }, [reset])

  const searchCustomers = useCallback(async (q: string) => {
    if (!q) return setCustomers([])
    const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=10`)
    const data = await res.json()
    setCustomers(data.customers || [])
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(customerSearch), 250)
    return () => clearTimeout(t)
  }, [customerSearch, searchCustomers])

  function selectCustomer(c: Customer) {
    setCustomer(c.id, c.name)
    setCustomerSearch(c.name)
    setShowCustomerDropdown(false)
    setCustomers([])
  }

  function applyTemplate(template: Template) {
    const items = template.items.map(ti => ({
      itemId: ti.item.id,
      customName: ti.item.name,
      unit: ti.item.unit as 'NOS' | 'KG' | 'METER' | 'BOX' | 'ROLL',
      quantity: Number(ti.quantity),
      rate: Number(ti.rate),
    }))
    setTemplateItems(items)
    toast({ title: `Template "${template.name}" applied` })
  }

  function addBlankItem() {
    addItem({ unit: 'NOS', quantity: 1, rate: 0, customName: '' })
  }

  function addFromMaster(item: ItemMaster) {
    addItem({
      itemId: item.id,
      customName: item.name,
      unit: item.unit as 'NOS' | 'KG' | 'METER' | 'BOX' | 'ROLL',
      quantity: 1,
      rate: Number(item.defaultRate),
    })
  }

  async function handleSave(saveStatus: 'DRAFT' | 'SENT') {
    if (!form.customerId) {
      toast({ title: 'Error', description: 'Please select a customer', variant: 'destructive' })
      return
    }
    if (!form.fromAddress || !form.toAddress) {
      toast({ title: 'Error', description: 'From and To addresses are required', variant: 'destructive' })
      return
    }
    if (form.items.length === 0) {
      toast({ title: 'Error', description: 'Add at least one item', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: saveStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      } else {
        toast({ title: 'Quotation created!', description: `Status: ${saveStatus}` })
        reset()
        router.push('/quotations')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save quotation', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header title="New Quotation" subtitle="Create a packing and moving quotation" />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search customer by name or mobile..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                />
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white border rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b last:border-0"
                        onClick={() => selectCustomer(c)}
                      >
                        <p className="font-medium">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.mobile} {c.email ? `· ${c.email}` : ''}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setAddCustomerOpen(true)}
                className="shrink-0"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>

            {form.customerId && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Selected: <strong>{form.customerName}</strong>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shift Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Shift Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Service Type</Label>
                <Select
                  value={form.serviceType}
                  onValueChange={(v) => setField('serviceType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Shifting Date</Label>
                <Input
                  type="date"
                  value={form.shiftingDate}
                  onChange={(e) => setField('shiftingDate', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>From Address *</Label>
                <Input
                  value={form.fromAddress}
                  onChange={(e) => setField('fromAddress', e.target.value)}
                  placeholder="Pickup location"
                />
              </div>

              <div className="space-y-1">
                <Label>To Address *</Label>
                <Input
                  value={form.toAddress}
                  onChange={(e) => setField('toAddress', e.target.value)}
                  placeholder="Delivery location"
                />
              </div>

              <div className="space-y-1">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setField('validUntil', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template & Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Packing Items</CardTitle>
              <div className="flex gap-2">
                {/* Template selector */}
                <Select onValueChange={(id) => {
                  const t = templates.find(t => t.id === id)
                  if (t) applyTemplate(t)
                }}>
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Load template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Add from master */}
                <Select onValueChange={(id) => {
                  const item = itemMasters.find(i => i.id === id)
                  if (item) addFromMaster(item)
                }}>
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Add from master..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itemMasters.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button size="sm" onClick={addBlankItem} variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Row
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs">
                    <th className="text-left py-2 pr-2">Item Name</th>
                    <th className="text-left py-2 pr-2 w-24">Unit</th>
                    <th className="text-left py-2 pr-2 w-24">Qty</th>
                    <th className="text-left py-2 pr-2 w-28">Rate (₹)</th>
                    <th className="text-right py-2 pr-2 w-28">Amount (₹)</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        <Package className="mx-auto h-8 w-8 mb-2 opacity-30" />
                        <p>No items yet. Load a template or add items manually.</p>
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-1.5 pr-2">
                          <Input
                            value={item.customName || ''}
                            onChange={(e) => updateItem(item.id, { customName: e.target.value })}
                            placeholder="Item description"
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Select
                            value={item.unit}
                            onValueChange={(v) => updateItem(item.id, { unit: v as QuotationItem['unit'] })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="py-1.5 pr-2 text-right font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charges & Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Additional Charges */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'laborCharges', label: 'Labor Charges' },
                { key: 'truckCharges', label: 'Truck/Transportation Charges' },
                { key: 'insuranceAmount', label: 'Insurance Amount' },
                { key: 'packingCharges', label: 'Packing Material Charges' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <Label className="w-48 text-sm text-gray-600 shrink-0">{label}</Label>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form[key as keyof typeof form] as number}
                      onChange={(e) => setField(key as keyof typeof form, Number(e.target.value) as never)}
                      className="pl-7 h-9"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(form.subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0">Discount</span>
                  <Select
                    value={form.discountType}
                    onValueChange={(v) => setField('discountType', v as 'percentage' | 'amount')}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
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
                    value={form.discountValue}
                    onChange={(e) => setField('discountValue', Number(e.target.value))}
                    className="h-7 w-24 text-xs"
                  />
                </div>

                {form.discountAmount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount Applied</span>
                    <span>-{formatCurrency(form.discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0">GST Rate (%)</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.gstRate}
                    onChange={(e) => setField('gstRate', Number(e.target.value))}
                    className="h-7 w-20 text-xs"
                  />
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">GST ({form.gstRate}%)</span>
                  <span>{formatCurrency(form.gstAmount)}</span>
                </div>

                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Grand Total</span>
                  <span className="text-blue-700">{formatCurrency(form.grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes & Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={form.terms}
                onChange={(e) => setField('terms', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSave('DRAFT')} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('SENT')} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Quotation
          </Button>
        </div>
      </div>

      <AddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={(c) => {
          selectCustomer(c)
          toast({ title: `Customer "${c.name}" created and selected` })
        }}
      />
    </div>
  )
}
