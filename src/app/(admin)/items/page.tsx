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
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react'

interface ItemMaster {
  id: string
  name: string
  unit: string
  defaultRate: number
  description?: string
  isActive: boolean
}

const emptyForm = { name: '', unit: 'NOS', defaultRate: 0, description: '', isActive: true }

export default function ItemsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<ItemMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<ItemMaster | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/items')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load items', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchItems() }, [fetchItems])

  function openCreate() {
    setEditItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(item: ItemMaster) {
    setEditItem(item)
    setForm({
      name: item.name,
      unit: item.unit,
      defaultRate: Number(item.defaultRate),
      description: item.description || '',
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.defaultRate) {
      toast({ title: 'Error', description: 'Name and rate are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editItem ? `/api/items/${editItem.id}` : '/api/items'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, defaultRate: Number(form.defaultRate) }),
      })
      if (res.ok) {
        toast({ title: editItem ? 'Item updated' : 'Item created' })
        setDialogOpen(false)
        fetchItems()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this item?')) return
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      toast({ title: 'Item deactivated' })
      fetchItems()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return (
    <div>
      <Header title="Items Master" subtitle="Manage packing materials and supplies" />

      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(Number(item.defaultRate))}</p>
                    <span className="text-xs text-gray-400">per {item.unit}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-2">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Item Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Carton Box Small"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['NOS', 'KG', 'METER', 'BOX', 'ROLL'].map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default Rate (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.defaultRate}
                  onChange={(e) => setForm({ ...form, defaultRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Item description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
