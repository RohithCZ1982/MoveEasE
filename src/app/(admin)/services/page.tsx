'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Plus, Briefcase, Loader2, Pencil, Trash2 } from 'lucide-react'
import TruckLoader from '@/components/ui/TruckLoader'

interface Service {
  id: string
  name: string
  type: string
  description?: string
  baseRate?: number
  isActive: boolean
}

const SERVICE_TYPES = [
  { value: 'LOCAL_SHIFT', label: 'Local Household Shifting' },
  { value: 'INTERSTATE', label: 'Interstate Shifting' },
  { value: 'INTERNATIONAL', label: 'International Relocation' },
  { value: 'CAR_TRANSPORT', label: 'Car Transportation' },
  { value: 'OFFICE_SHIFTING', label: 'Office Shifting' },
  { value: 'WAREHOUSE', label: 'Warehouse Storage' },
]

const emptyForm = { name: '', type: 'LOCAL_SHIFT', description: '', baseRate: '' }

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchServices() }, [fetchServices])

  function openAdd() {
    setEditingService(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setForm({
      name: service.name,
      type: service.type,
      description: service.description ?? '',
      baseRate: service.baseRate ? String(service.baseRate) : '',
    })
    setDialogOpen(true)
  }

  function openDelete(service: Service) {
    setDeletingService(service)
    setDeleteDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name) {
      toast({ title: 'Error', description: 'Service name required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, baseRate: form.baseRate ? Number(form.baseRate) : null }),
      })
      if (res.ok) {
        toast({ title: editingService ? 'Service updated' : 'Service added' })
        setDialogOpen(false)
        fetchServices()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingService) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/services/${deletingService.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Service deleted' })
        setDeleteDialogOpen(false)
        fetchServices()
      } else {
        toast({ title: 'Cannot delete', description: data.error, variant: 'destructive' })
        setDeleteDialogOpen(false)
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const typeColors: Record<string, string> = {
    LOCAL_SHIFT: 'bg-blue-50 text-blue-700',
    INTERSTATE: 'bg-purple-50 text-purple-700',
    INTERNATIONAL: 'bg-indigo-50 text-indigo-700',
    CAR_TRANSPORT: 'bg-orange-50 text-orange-700',
    OFFICE_SHIFTING: 'bg-teal-50 text-teal-700',
    WAREHOUSE: 'bg-gray-50 text-gray-700',
  }

  return (
    <div>
      <Header title="Services" subtitle="Manage available moving services" />

      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><TruckLoader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800">{service.name}</p>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(service)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDelete(service)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[service.type] || 'bg-gray-50 text-gray-700'}`}>
                        {service.type.replace(/_/g, ' ')}
                      </span>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                      )}
                      {service.baseRate && (
                        <p className="text-sm font-semibold text-blue-700 mt-2">
                          From {formatCurrency(Number(service.baseRate))}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Service Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Premium Interstate Shifting"
              />
            </div>
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-1">
              <Label>Base Rate (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.baseRate}
                onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
                placeholder="Starting price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to delete <strong>{deletingService?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
