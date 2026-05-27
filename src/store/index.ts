import { create } from 'zustand'
import { ItemUnit } from '@prisma/client'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export interface QuotationItem {
  id: string
  itemId?: string
  customName?: string
  unit: ItemUnit
  quantity: number
  rate: number
  amount: number
}

export interface QuotationFormState {
  customerId: string
  customerName: string
  serviceType: string
  fromAddress: string
  toAddress: string
  shiftingDate: string
  items: QuotationItem[]
  laborCharges: number
  truckCharges: number
  insuranceAmount: number
  packingCharges: number
  discountType: 'percentage' | 'amount'
  discountValue: number
  gstRate: number
  notes: string
  terms: string
  validUntil: string
  // Calculated
  subtotal: number
  discountAmount: number
  gstAmount: number
  grandTotal: number
}

interface QuotationStore {
  form: QuotationFormState
  setField: <K extends keyof QuotationFormState>(key: K, value: QuotationFormState[K]) => void
  setCustomer: (id: string, name: string) => void
  addItem: (item: Omit<QuotationItem, 'id' | 'amount'>) => void
  updateItem: (id: string, updates: Partial<QuotationItem>) => void
  removeItem: (id: string) => void
  setTemplateItems: (items: Omit<QuotationItem, 'id' | 'amount'>[]) => void
  recalculate: () => void
  reset: () => void
}

const defaultForm: QuotationFormState = {
  customerId: '',
  customerName: '',
  serviceType: 'LOCAL_SHIFT',
  fromAddress: '',
  toAddress: '',
  shiftingDate: '',
  items: [],
  laborCharges: 0,
  truckCharges: 0,
  insuranceAmount: 0,
  packingCharges: 0,
  discountType: 'amount',
  discountValue: 0,
  gstRate: 18,
  notes: '',
  terms: 'Payment due within 7 days of invoice date.\nGoods damaged during transit covered by insurance.',
  validUntil: '',
  subtotal: 0,
  discountAmount: 0,
  gstAmount: 0,
  grandTotal: 0,
}

function recalculateTotals(form: QuotationFormState): Partial<QuotationFormState> {
  const itemsTotal = form.items.reduce((sum, item) => sum + item.amount, 0)
  const subtotal =
    itemsTotal +
    form.laborCharges +
    form.truckCharges +
    form.insuranceAmount +
    form.packingCharges

  const discountAmount =
    form.discountType === 'percentage'
      ? (subtotal * form.discountValue) / 100
      : form.discountValue

  const taxable = subtotal - discountAmount
  const gstAmount = (taxable * form.gstRate) / 100
  const grandTotal = taxable + gstAmount

  return { subtotal, discountAmount, gstAmount, grandTotal }
}

export const useQuotationStore = create<QuotationStore>((set, get) => ({
  form: { ...defaultForm },

  setField: (key, value) => {
    set((state) => {
      const newForm = { ...state.form, [key]: value }
      const totals = recalculateTotals(newForm)
      return { form: { ...newForm, ...totals } }
    })
  },

  setCustomer: (id, name) => {
    set((state) => ({ form: { ...state.form, customerId: id, customerName: name } }))
  },

  addItem: (item) => {
    const id = randomId()
    const amount = item.quantity * item.rate
    set((state) => {
      const newForm = {
        ...state.form,
        items: [...state.form.items, { ...item, id, amount }],
      }
      return { form: { ...newForm, ...recalculateTotals(newForm) } }
    })
  },

  updateItem: (id, updates) => {
    set((state) => {
      const items = state.form.items.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, ...updates }
        updated.amount = updated.quantity * updated.rate
        return updated
      })
      const newForm = { ...state.form, items }
      return { form: { ...newForm, ...recalculateTotals(newForm) } }
    })
  },

  removeItem: (id) => {
    set((state) => {
      const newForm = {
        ...state.form,
        items: state.form.items.filter((item) => item.id !== id),
      }
      return { form: { ...newForm, ...recalculateTotals(newForm) } }
    })
  },

  setTemplateItems: (items) => {
    const newItems = items.map((item) => ({
      ...item,
      id: randomId(),
      amount: item.quantity * item.rate,
    }))
    set((state) => {
      const newForm = { ...state.form, items: newItems }
      return { form: { ...newForm, ...recalculateTotals(newForm) } }
    })
  },

  recalculate: () => {
    set((state) => ({
      form: { ...state.form, ...recalculateTotals(state.form) },
    }))
  },

  reset: () => set({ form: { ...defaultForm } }),
}))
