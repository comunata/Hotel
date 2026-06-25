'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice, buildWhatsAppUrl, buildWhatsAppMessage } from '@/lib/utils'
import type { Reservation } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  cancelled: 'Anulată',
  completed: 'Finalizată',
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  cancelled: 'status-cancelled',
  completed: 'status-completed',
}

function LookupForm({ onFound }: { onFound: (code: string) => void }) {
  const [input, setInput] = useState('')
  return (
    <div className="min-h-screen bg-sand flex items-center justify-center section-padding">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-muted text-sm font-sans mb-8 hover:text-ink transition-colors">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Acasă
        </Link>
        <span className="eyebrow">Portal Client</span>
        <h1 className="mt-3 font-serif text-display-sm font-light text-ink">
          Rezervarea ta.
        </h1>
        <p className="mt-3 text-ink-muted font-sans text-sm leading-relaxed">
          Introdu codul de rezervare primit pe email sau WhatsApp pentru a-ți vedea și gestiona rezervarea.
        </p>
        <div className="mt-8">
          <label className="label-field">Cod rezervare</label>
          <input
            type="text"
            placeholder="ex: PS-2026-AB34"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && input.length > 5 && onFound(input)}
            className="input-field font-mono tracking-widest text-lg"
          />
        </div>
        <button
          onClick={() => onFound(input)}
          disabled={input.length < 5}
          className="mt-4 btn-primary w-full justify-center disabled:opacity-40"
        >
          Accesează rezervarea
        </button>
      </div>
    </div>
  )
}

export default function PortalPage() {
  const params = useParams()
  const rawCode = params.code as string
  const isLookup = rawCode === 'lookup'

  const [lookupCode, setLookupCode] = useState('')
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(!isLookup)
  const [notFound, setNotFound] = useState(false)
  const [modifyRequest, setModifyRequest] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const code = isLookup ? lookupCode : rawCode

  useEffect(() => {
    if (!isLookup && rawCode) {
      fetchReservation(rawCode)
    }
  }, [rawCode, isLookup])

  async function fetchReservation(c: string) {
    setLoading(true)
    setNotFound(false)
    const { data, error } = await supabase
      .from('h_reservations')
      .select('*')
      .eq('code', c.toUpperCase())
      .single()

    if (error || !data) {
      setNotFound(true)
      setReservation(null)
    } else {
      setReservation(data as Reservation)
    }
    setLoading(false)
  }

  async function sendModificationRequest() {
    if (!modifyRequest.trim() || !reservation) return
    setSendingRequest(true)
    await supabase.from('h_messages').insert({
      reservation_id: reservation.id,
      sender: 'guest',
      content: `Cerere modificare: ${modifyRequest}`,
    })
    setSendingRequest(false)
    setModifyRequest('')
    setRequestSent(true)
    setTimeout(() => setRequestSent(false), 4000)
  }

  if (isLookup && !lookupCode) {
    return <LookupForm onFound={(c) => { setLookupCode(c); fetchReservation(c) }} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <p className="text-ink-muted font-sans text-sm">Se încarcă rezervarea...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center section-padding">
        <div className="max-w-md text-center">
          <span className="text-4xl">◌</span>
          <h2 className="mt-6 font-serif text-2xl text-ink font-light">Rezervarea nu a fost găsită</h2>
          <p className="mt-3 text-ink-muted font-sans text-sm">
            Verifică codul introdus sau contactează-ne direct.
          </p>
          <div className="mt-8 flex flex-col gap-3 items-center">
            <button onClick={() => { setNotFound(false); setLookupCode('') }} className="btn-outline">
              Încearcă din nou
            </button>
            <Link href="/" className="text-sm text-ink-muted hover:text-ink font-sans transition-colors">
              Pagina principală
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!reservation) return null

  const nights = reservation.check_in && reservation.check_out
    ? Math.round((new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / 86400000)
    : 0

  const whatsappUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_PROPERTY_WHATSAPP || '40700000000',
    buildWhatsAppMessage({
      code: reservation.code,
      guestName: reservation.guest_name,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      guestsCount: reservation.guests_count,
      extras: reservation.extras || [],
      totalPrice: reservation.total_price,
    })
  )

  return (
    <div className="min-h-screen bg-sand">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="section-padding py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-ink hover:text-gold transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-serif text-base">Poiana Salcâmilor</span>
          </Link>
          <span className="font-mono text-sm text-ink-muted">{reservation.code}</span>
        </div>
      </nav>

      <div className="section-padding py-12 max-w-2xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Portal Client</span>
            <h1 className="mt-2 font-serif text-display-sm font-light text-ink">
              Bun venit,<br />{reservation.guest_name.split(' ')[0]}.
            </h1>
          </div>
          <span className={`status-badge ${STATUS_CLASSES[reservation.status]} mt-4`}>
            {STATUS_LABELS[reservation.status]}
          </span>
        </div>

        {/* Reservation card */}
        <div className="bg-white border border-border divide-y divide-border">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans">Cod rezervare</p>
              <p className="font-mono text-xl font-bold text-slate mt-0.5">{reservation.code}</p>
            </div>
            <p className="text-xs text-ink-muted font-sans">
              {new Date(reservation.created_at).toLocaleDateString('ro-RO')}
            </p>
          </div>

          <div className="p-5 grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Check-in</p>
              <p className="font-medium text-ink font-sans text-sm">{formatDate(reservation.check_in)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Check-out</p>
              <p className="font-medium text-ink font-sans text-sm">{formatDate(reservation.check_out)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Persoane</p>
              <p className="font-medium text-ink font-sans text-sm">{reservation.guests_count}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Durata</p>
              <p className="font-medium text-ink font-sans text-sm">{nights} {nights === 1 ? 'noapte' : 'nopți'}</p>
            </div>
          </div>

          {reservation.extras && reservation.extras.length > 0 && (
            <div className="p-5">
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-2">Extras</p>
              <div className="flex flex-wrap gap-2">
                {reservation.extras.map((e: string) => (
                  <span key={e} className="text-xs border border-border px-2.5 py-1 text-ink font-sans">{e}</span>
                ))}
              </div>
            </div>
          )}

          {reservation.total_price && (
            <div className="p-5 bg-sand">
              <div className="flex justify-between items-center">
                <p className="text-sm font-sans text-ink-muted">Total rezervare</p>
                <p className="text-lg font-medium text-gold font-sans">{formatPrice(reservation.total_price)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactează proprietarul
          </a>
          <Link href={`/concierge/${reservation.code}`} className="btn-outline">
            Digital Concierge
          </Link>
        </div>

        {/* Modification request */}
        <div className="mt-8 bg-white border border-border p-6">
          <h3 className="font-serif text-lg text-ink font-light mb-1">Solicitare modificare</h3>
          <p className="text-xs text-ink-muted font-sans mb-4">
            Dorești să modifici datele, numărul de persoane sau să anulezi?
          </p>
          <textarea
            rows={3}
            placeholder="Descrie ce dorești să modifici..."
            value={modifyRequest}
            onChange={(e) => setModifyRequest(e.target.value)}
            className="input-field resize-none mb-3"
          />
          {requestSent ? (
            <p className="text-sm text-emerald-600 font-sans flex items-center gap-2">
              <span>✓</span> Cererea a fost trimisă. Te contactăm în curând.
            </p>
          ) : (
            <button
              onClick={sendModificationRequest}
              disabled={!modifyRequest.trim() || sendingRequest}
              className="btn-outline disabled:opacity-40"
            >
              {sendingRequest ? 'Se trimite...' : 'Trimite cererea'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
