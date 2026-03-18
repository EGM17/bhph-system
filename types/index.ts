// ─── Vehicle ─────────────────────────────────────────────────────────────────

export type VehicleStatus = 'available' | 'sold' | 'reserved' | 'maintenance'
export type FinancingType = 'in-house' | 'cash-only'
export type VehicleCondition = 'excellent' | 'good' | 'fair'

export interface VehicleImage {
  url: string
  isPrimary: boolean
  order: number
}

export interface BilingualField {
  en: string
  es: string
}

export interface Vehicle {
  id: string
  // Bilingual content
  title: BilingualField
  description: BilingualField
  slug: string
  // Vehicle specs
  year: number
  make: string
  model: string
  trim?: string
  vin?: string
  mileage: number
  bodyClass?: string
  fuelType?: string
  engine?: string
  mpg?: string
  color?: string
  condition?: VehicleCondition
  // Extended specs from VIN decode
  transmission?: string
  drivetrain?: string
  cylinders?: string
  doors?: string
  displacement?: string
  series?: string
  // Pricing
  price?: number
  monthlyPaymentFrom?: number
  downPaymentFrom?: number
  financingType: FinancingType
  showMonthlyPayment?: boolean
  // Publishing
  status: VehicleStatus
  isPublished: boolean
  isFeatured: boolean
  // Images
  images: VehicleImage[]
  // SEO
  views: number
  // Timestamps
  createdAt: string
  updatedAt: string
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export type LeadSource = 'vehicle_detail' | 'contact_page' | 'financing_page' | 'hero'
export type LeadStatus = 'new' | 'contacted' | 'closed'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message?: string
  // Vehicle context
  vehicleId?: string
  vehicleTitle?: string
  vehicleSlug?: string
  // Metadata
  source: LeadSource
  language: 'en' | 'es'
  status: LeadStatus
  createdAt: string
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: BilingualField
  slug: string
  excerpt: BilingualField
  content: BilingualField
  coverImage?: string
  author?: string
  category?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface SiteSettings {
  heroImage?: string
  heroTitle?: BilingualField
  heroSubtitle?: BilingualField
  gtmId?: string
  metaPixelId?: string
  hotjarId?: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}