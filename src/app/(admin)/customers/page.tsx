'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import {
  Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Loader2, Users,
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  mobile: string
  alternatePhone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  gstNumber?: string
  notes?: string
  createdAt: string
  _count: { quotations: number }
}

const emptyForm = {
  name: '', mobile: '', alternatePhone: '', email: '',
  address: '', city: '', state: '', pincode: '', gstNumber: '', notes: '',
}

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&limit=50`)
      const data = await res.json()
      setCustomers(data.customers || [])
      setTotal(data.total || 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load customers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, toast])

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  function openCreate() {
    setEditCustomer(null)
    setForm(emptyForm)
    setErrors({})
    setDialogOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditCustomer(customer)
    setForm({
      name: customer.name,
      mobile: customer.mobile,
      alternatePhone: customer.alternatePhone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      gstNumber: customer.gstNumber || '',
      notes: customer.notes || '',
    })
    setErrors({})
    setDialogOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name || form.name.length < 2) e.name = 'Name is required'
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Valid 10-digit mobile required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'Invalid pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const url = editCustomer ? `/api/customers/${editCustomer.id}` : '/api/customers'
      const method = editCustomer ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      } else {
        toast({ title: editCustomer ? 'Customer updated' : 'Customer created' })
        setDialogOpen(false)
        fetchCustomers()
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Customer deleted' })
        fetchCustomers()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  return (
    <div>
      <Header title="Customers" subtitle={`${total} total customers`} />

      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, mobile, email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {c._count.quotations} quotations
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{c.mobile}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {(c.city || c.address) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{[c.city, c.state].filter(Boolean).join(', ') || c.address}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">Added {formatDate(c.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <Label>Mobile Number *</Label>
              <Input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="10-digit mobile"
                maxLength={10}
              />
              {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
            </div>

            <div className="space-y-1">
              <Label>Alternate Phone</Label>
              <Input
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                placeholder="Alternate number"
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-1">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div className="space-y-1">
              <Label>State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
              />
            </div>

            <div className="space-y-1">
              <Label>Pincode</Label>
              <Input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="6-digit pincode"
                maxLength={6}
              />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode}</p>}
            </div>

            <div className="space-y-1">
              <Label>GST Number</Label>
              <Input
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                placeholder="GST number (optional)"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editCustomer ? 'Update' : 'Create'} Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
