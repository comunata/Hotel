export function generateReservationCode(propertySlug = 'PS'): string {
  const prefix = propertySlug.toUpperCase().slice(0, 2)
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let random = ''
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${year}-${random}`
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

export function formatDate(dateStr: string, locale = 'ro-RO'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string, locale = 'ro-RO'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(amount)
}

const EXTRAS_PRICES: Record<string, number> = {
  'Ciubăr': 150,
  'Grătar': 80,
  'Coș de bun venit': 120,
  'Petit dejun inclus': 60,
}

export function getExtrasPrice(extras: string[]): number {
  return extras.reduce((sum, e) => sum + (EXTRAS_PRICES[e] ?? 0), 0)
}

export const EXTRAS_OPTIONS = Object.keys(EXTRAS_PRICES)
export const EXTRAS_PRICES_MAP = EXTRAS_PRICES

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppMessage(reservation: {
  code: string
  guestName: string
  checkIn: string
  checkOut: string
  guestsCount: number
  extras: string[]
  totalPrice?: number
}): string {
  const lines = [
    `Bună ziua! Doresc să confirm rezervarea mea la Poiana Salcâmilor.`,
    ``,
    `◦ Cod rezervare: ${reservation.code}`,
    `◦ Nume: ${reservation.guestName}`,
    `◦ Check-in: ${formatDate(reservation.checkIn)}`,
    `◦ Check-out: ${formatDate(reservation.checkOut)}`,
    `◦ Persoane: ${reservation.guestsCount}`,
  ]
  if (reservation.extras.length > 0) {
    lines.push(`◦ Extras: ${reservation.extras.join(', ')}`)
  }
  if (reservation.totalPrice) {
    lines.push(`◦ Total estimat: ${formatPrice(reservation.totalPrice)}`)
  }
  lines.push(``, `Vă mulțumesc!`)
  return lines.join('\n')
}

import type { ExperienceAnswer, ExperienceRecommendation } from '@/types'

export function generateRecommendation(answers: ExperienceAnswer): ExperienceRecommendation {
  const isCouple = answers.group === 'Cuplu'
  const isFamily = answers.group === 'Familie'
  const isWeekend = answers.duration?.includes('Weekend')
  const wantsRelax = answers.vibe?.includes('Liniște')
  const wantsCiubar = answers.extras === 'Ciubăr sub stele' || answers.extras === 'Ambele'
  const wantsGratar = answers.extras === 'Grătar cu prietenii' || answers.extras === 'Ambele'

  if (isCouple && wantsRelax) {
    return {
      title: 'Weekend Romantic',
      description: 'Două nopți de liniște totală. Ciubăr seara sub stele, cafea pe terasă la răsărit, apus lângă apă. Fără plan, fără grabă.',
      duration: isWeekend ? '2 nopți' : '4 nopți',
      highlight: wantsCiubar ? 'Ciubăr recomandat' : 'Terasa cu vedere',
      extras: wantsCiubar ? ['Ciubăr', 'Coș de bun venit'] : ['Coș de bun venit'],
    }
  }

  if (isFamily) {
    return {
      title: 'Vacanță în Familie',
      description: 'Spațiu, natură și amintiri care durează o viață. Grătar în aer liber, plimbări prin pădure, seri cu focarul aprins.',
      duration: isWeekend ? '2–3 nopți' : '5–7 nopți',
      highlight: 'Zona grătar privată',
      extras: ['Grătar', 'Petit dejun inclus'],
    }
  }

  if (!isCouple && !isFamily) {
    return {
      title: 'Escape cu Prietenii',
      description: 'O evadare din rutina zilnică. Grătar până seara târziu, povești la foc, dimineți leneșe și seri care nu se termină niciodată.',
      duration: isWeekend ? '2–3 nopți' : '5 nopți',
      highlight: 'Spațiu comun exclusiv',
      extras: wantsGratar ? ['Grătar', 'Ciubăr'] : ['Grătar'],
    }
  }

  return {
    title: 'Weekend de Reîncărcare',
    description: 'Natură, liniște și tot ce ai nevoie pentru a te deconecta complet. Câteva zile în care programul ești tu.',
    duration: isWeekend ? '2 nopți' : '5 nopți',
    highlight: wantsCiubar ? 'Ciubăr recomandat' : 'Natură și liniște',
    extras: wantsCiubar ? ['Ciubăr'] : [],
  }
}
