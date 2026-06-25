export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ReservationType = 'weekend' | 'vacation'
export type GroupType = 'couple' | 'family' | 'friends'

export interface Property {
  id: string
  name: string
  slug: string
  tagline: string
  location: string
  description: string
  phone: string
  whatsapp: string
  address: string
  google_maps_url?: string
  arrival_instructions?: string
  images: string[]
  amenities: string[]
}

export interface Room {
  id: string
  property_id: string
  name: string
  capacity: number
  price_per_night: number
  amenities: string[]
  images: string[]
}

export interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  preferences: Record<string, unknown>
  notes?: string
  visits_count: number
  first_visit?: string
  last_visit?: string
  created_at: string
}

export interface Reservation {
  id: string
  code: string
  property_id: string
  room_id?: string
  guest_id?: string
  guest_name: string
  guest_email?: string
  guest_phone?: string
  check_in: string
  check_out: string
  guests_count: number
  extras: string[]
  total_price?: number
  status: ReservationStatus
  notes?: string
  source: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  reservation_id: string
  sender: 'guest' | 'admin' | 'system'
  content: string
  read: boolean
  created_at: string
}

export interface BookingFormData {
  checkIn: string
  checkOut: string
  guestsCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  extras: string[]
  notes?: string
  groupType?: GroupType
  experienceType?: string
}

export interface ExperienceAnswer {
  group?: string
  duration?: string
  vibe?: string
  extras?: string
}

export interface ExperienceRecommendation {
  title: string
  description: string
  duration: string
  highlight: string
  extras: string[]
}
