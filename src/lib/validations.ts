import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  alternatePhone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const itemMasterSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  unit: z.enum(['NOS', 'KG', 'METER', 'BOX', 'ROLL']).default('NOS'),
  defaultRate: z.coerce.number().positive('Rate must be positive'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const truckSchema = z.object({
  registrationNo: z.string().min(1, 'Registration number is required'),
  model: z.string().min(1, 'Model is required'),
  capacity: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  notes: z.string().optional().nullable(),
})

export const loaderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  isAvailable: z.boolean().default(true),
  dailyRate: z.coerce.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
})
