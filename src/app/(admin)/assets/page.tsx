'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/admin/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Plus, Truck, Users, Loader2 } from 'lucide-react'

interface TruckAsset { id: string; registrationNo: string; model: string; capacity?: string; isAvailable: boolean }
interface Loader { id: string; name: string; mobile: string; isAvailable: boolean; dailyRate?: number }

export default function AssetsPage() {
  const { toast } = useToast()
  const [trucks, setTrucks] = useState<TruckAsset[]>([])
  const [loaders, setLoaders] = useState<Loader[]>([])
  const [loading, setLoading] = useState(true)
  const [truckDialog, setTruckDialog] = useState(false)
  const [loaderDialog, setLoaderDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [truckForm, setTruckForm] = useState({ registrationNo: '', model: '', capacity: '', notes: '' })
  const [loaderForm, setLoaderForm] = useState({ name: '', mobile: '', dailyRate: '', notes: '' })

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      setTrucks(data.trucks || [])
      setLoaders(data.loaders || [])
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  async function saveTruck() {
    if (!truckForm.registrationNo || !truckForm.model) {
      toast({ title: 'Error', description: 'Registration and model required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'truck', ...truckForm }),
      })
      if (res.ok) {
        toast({ title: 'Truck added' })
        setTruckDialog(false)
        setTruckForm({ registrationNo: '', model: '', capacity: '', notes: '' })
        fetchAssets()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function saveLoader() {
    if (!loaderForm.name || !loaderForm.mobile) {
      toast({ title: 'Error', description: 'Name and mobile required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'loader',
          ...loaderForm,
          dailyRate: loaderForm.dailyRate ? Number(loaderForm.dailyRate) : undefined,
        }),
      })
      if (res.ok) {
        toast({ title: 'Loader added' })
        setLoaderDialog(false)
        setLoaderForm({ name: '', mobile: '', dailyRate: '', notes: '' })
        fetchAssets()
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Header title="Assets Management" subtitle="Manage trucks and loaders" />

      <div className="p-6 space-y-8">
        {/* Trucks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" /> Trucks ({trucks.length})
            </h2>
            <Button onClick={() => setTruckDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Truck
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trucks.map((truck) => (
                <Card key={truck.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{truck.registrationNo}</p>
                        <p className="text-sm text-gray-600">{truck.model}</p>
                        {truck.capacity && <p className="text-xs text-gray-400">{truck.capacity}</p>}
                      </div>
                      <Badge variant={truck.isAvailable ? 'default' : 'secondary'} className="text-xs">
                        {truck.isAvailable ? 'Available' : 'In Use'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {trucks.length === 0 && (
                <p className="text-gray-400 text-sm">No trucks added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Loaders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" /> Loaders ({loaders.length})
            </h2>
            <Button onClick={() => setLoaderDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Loader
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loaders.map((loader) => (
              <Card key={loader.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{loader.name}</p>
                      <p className="text-sm text-gray-600">{loader.mobile}</p>
                      {loader.dailyRate && (
                        <p className="text-xs text-gray-400">{formatCurrency(Number(loader.dailyRate))}/day</p>
                      )}
                    </div>
                    <Badge variant={loader.isAvailable ? 'default' : 'secondary'} className="text-xs">
                      {loader.isAvailable ? 'Available' : 'Assigned'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {loaders.length === 0 && !loading && (
              <p className="text-gray-400 text-sm">No loaders added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Truck Dialog */}
      <Dialog open={truckDialog} onOpenChange={setTruckDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Truck</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Registration Number *</Label>
              <Input
                value={truckForm.registrationNo}
                onChange={(e) => setTruckForm({ ...truckForm, registrationNo: e.target.value })}
                placeholder="KA-01-AB-1234"
              />
            </div>
            <div className="space-y-1">
              <Label>Model *</Label>
              <Input
                value={truckForm.model}
                onChange={(e) => setTruckForm({ ...truckForm, model: e.target.value })}
                placeholder="Tata 407"
              />
            </div>
            <div className="space-y-1">
              <Label>Capacity</Label>
              <Input
                value={truckForm.capacity}
                onChange={(e) => setTruckForm({ ...truckForm, capacity: e.target.value })}
                placeholder="e.g. 2 Ton"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTruckDialog(false)}>Cancel</Button>
            <Button onClick={saveTruck} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Truck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loader Dialog */}
      <Dialog open={loaderDialog} onOpenChange={setLoaderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Loader</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={loaderForm.name}
                onChange={(e) => setLoaderForm({ ...loaderForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1">
              <Label>Mobile *</Label>
              <Input
                value={loaderForm.mobile}
                onChange={(e) => setLoaderForm({ ...loaderForm, mobile: e.target.value })}
                placeholder="10-digit mobile"
                maxLength={10}
              />
            </div>
            <div className="space-y-1">
              <Label>Daily Rate (₹)</Label>
              <Input
                type="number"
                min="0"
                value={loaderForm.dailyRate}
                onChange={(e) => setLoaderForm({ ...loaderForm, dailyRate: e.target.value })}
                placeholder="e.g. 600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoaderDialog(false)}>Cancel</Button>
            <Button onClick={saveLoader} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Loader
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
