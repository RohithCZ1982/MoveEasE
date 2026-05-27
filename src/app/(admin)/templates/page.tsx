'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2, Layers, Loader2, X } from 'lucide-react'

interface ItemMaster { id: string; name: string; unit: string; defaultRate: number }
interface TemplateItem { itemId: string; quantity: number; rate: number; item?: ItemMaster }
interface Template {
  id: string
  name: string
  description?: string
  items: (TemplateItem & { item: ItemMaster })[]
}

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [items, setItems] = useState<TemplateItem[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tmpl, its] = await Promise.all([
        fetch('/api/templates').then(r => r.json()),
        fetch('/api/items').then(r => r.json()),
      ])
      setTemplates(Array.isArray(tmpl) ? tmpl : [])
      setItemMasters(Array.isArray(its) ? its : [])
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditTemplate(null)
    setForm({ name: '', description: '' })
    setItems([])
    setDialogOpen(true)
  }

  function openEdit(template: Template) {
    setEditTemplate(template)
    setForm({ name: template.name, description: template.description || '' })
    setItems(template.items.map(ti => ({
      itemId: ti.itemId,
      quantity: Number(ti.quantity),
      rate: Number(ti.rate),
    })))
    setDialogOpen(true)
  }

  function addItem() {
    if (itemMasters.length === 0) return
    const first = itemMasters[0]
    setItems([...items, { itemId: first.id, quantity: 1, rate: Number(first.defaultRate) }])
  }

  function updateTemplateItem(index: number, field: string, value: string | number) {
    const updated = [...items]
    if (field === 'itemId') {
      const master = itemMasters.find(i => i.id === value)
      updated[index] = { ...updated[index], itemId: value as string, rate: master ? Number(master.defaultRate) : 0 }
    } else {
      updated[index] = { ...updated[index], [field]: Number(value) }
    }
    setItems(updated)
  }

  function removeTemplateItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.name) {
      toast({ title: 'Error', description: 'Template name required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editTemplate ? `/api/templates/${editTemplate.id}` : '/api/templates'
      const method = editTemplate ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      if (res.ok) {
        toast({ title: editTemplate ? 'Template updated' : 'Template created' })
        setDialogOpen(false)
        fetchData()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    toast({ title: 'Template deleted' })
    fetchData()
  }

  return (
    <div>
      <Header title="Templates" subtitle="Manage packing templates for quick quotation creation" />

      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(template)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {template.items.map((ti, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span className="text-gray-700">{ti.item?.name}</span>
                        <span className="text-gray-500">
                          {Number(ti.quantity)} {ti.item?.unit} × {formatCurrency(Number(ti.rate))}
                        </span>
                      </div>
                    ))}
                    {template.items.length === 0 && (
                      <p className="text-xs text-gray-400">No items in template</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Template Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 2BHK Full Packing"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => {
                  const master = itemMasters.find(i => i.id === item.itemId)
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <Select
                        value={item.itemId}
                        onValueChange={(v) => updateTemplateItem(index, 'itemId', v)}
                      >
                        <SelectTrigger className="flex-1 h-9">
                          <SelectValue placeholder="Select item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {itemMasters.map(im => (
                            <SelectItem key={im.id} value={im.id}>{im.name} ({im.unit})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateTemplateItem(index, 'quantity', e.target.value)}
                        className="w-20 h-9 text-sm"
                        placeholder="Qty"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateTemplateItem(index, 'rate', e.target.value)}
                        className="w-24 h-9 text-sm"
                        placeholder="Rate"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-400 shrink-0"
                        onClick={() => removeTemplateItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-lg">
                    No items added. Click "Add Item" to begin.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
