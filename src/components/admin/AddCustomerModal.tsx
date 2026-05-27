'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, UserPlus } from 'lucide-react'

interface Customer {
  id: string
  name: string
  mobile: string
  email?: string
  address?: string
}

interface AddCustomerModalProps {
  open: boolean
  onClose: () => void
  onCreated: (customer: Customer) => void
}

export default function AddCustomerModal({ open, onClose, onCreated }: AddCustomerModalProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name || form.name.length < 2) e.name = 'Name is required (min 2 chars)'
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Valid 10-digit mobile required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create customer', variant: 'destructive' })
      } else {
        toast({ title: 'Customer created successfully!' })
        onCreated(data)
        setForm({ name: '', mobile: '', email: '', address: '' })
        setErrors({})
        onClose()
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setForm({ name: '', mobile: '', email: '', address: '' })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Customer Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label>Mobile Number *</Label>
            <Input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
          </div>

          <div className="space-y-1">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <Label>Address (optional)</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
