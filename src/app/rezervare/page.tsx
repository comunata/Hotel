'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  calculateNights,
  formatDate,
  formatPrice,
  getExtrasPrice,
  EXTRAS_OPTIONS,
  buildWhatsAppUrl,
  buildWhatsAppMessage,
  generateReservationCode,
} from '@/lib/utils'

const PRICE_PER_NIGHT = 450

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30'}`}>
      <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium font-sans border
        ${active ? 'bg-slate text-white border-slate' : done ? 'bg-gold/20 text-gold border-gold/30' : 'border-border text-ink-muted'}`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-sm font-sans hidden md:block ${active ? 'text-ink font-medium' : 'text-ink-muted'}`}>{label}</span>
    </div>
  )
}

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestsCount, setGuestsCount] = useState(2)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const extras = searchParams.get('extras')
    if (extras) {
      setSelectedExtras(extras.split(',').filter((e) => EXTRAS_OPTIONS.includes(e)))
    }
  }, [searchParams])

  const nights = calculateNights(checkIn, checkOut)
  const accommodationPrice = nights * PRICE_PER_NIGHT
  const extrasPrice = getExtrasPrice(selectedExtras)
  const totalPrice = accommodationPrice + extrasPrice

  function toggleExtra(extra: string) {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    )
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch('/api/rezervare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn, checkOut, guestsCount,
          guestName, guestEmail, guestPhone,
          extras: selectedExtras, notes, totalPrice,
        }),
      })
      const data = await res.json()
      if (data.code) {
        setCode(data.code)
        setStep(5)
      } else {
        const fallbackCode = generateReservationCode()
        setCode(fallbackCode)
        setStep(5)
      }
    } catch {
      const fallbackCode = generateReservationCode()
      setCode(fallbackCode)
      setStep(5)
    } finally {
      setLoading(false)
    }
  }

  const whatsappUrl = code
    ? buildWhatsAppUrl(
        process.env.NEXT_PUBLIC_PROPERTY_WHATSAPP || '40700000000',
        buildWhatsAppMessage({ code, guestName, checkIn, checkOut, guestsCount, extras: selectedExtras, totalPrice })
      )
    : ''

  const minCheckIn = new Date().toISOString().split('T')[0]
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : minCheckIn

  return (
    <div className="min-h-screen bg-sand">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="section-padding py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M13 8H3M7 12L3 8l4-4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-serif text-base text-ink">Poiana Salcâmilor</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {[
              { n: 1, label: 'Date' },
              { n: 2, label: 'Extras' },
              { n: 3, label: 'Contact' },
              { n: 4, label: 'Sumar' },
            ].map(({ n, label }) => (
              <Step key={n} n={n} label={label} active={step === n} done={step > n} />
            ))}
          </div>
          <span className="text-xs text-ink-muted font-sans">
            {step < 5 ? `Pasul ${step} din 4` : 'Confirmat'}
          </span>
        </div>
      </nav>

      <div className="section-padding py-12">
        {/* Step 1 — Dates & Guests */}
        {step === 1 && (
          <div className="max-w-xl animate-fade-up">
            <span className="eyebrow">Pasul 1 din 4</span>
            <h1 className="mt-3 font-serif text-display-sm text-ink font-light">
              Alege datele.
            </h1>
            <p className="mt-3 text-ink-muted font-sans">
              Când doriți să ajungeți la Poiana Salcâmilor?
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Check-in</label>
                <input
                  type="date"
                  min={minCheckIn}
                  value={checkIn}
                  onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut('') }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Check-out</label>
                <input
                  type="date"
                  min={minCheckOut}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  disabled={!checkIn}
                  className="input-field disabled:opacity-40"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="mt-4 flex items-center gap-3 text-sm text-ink-muted font-sans">
                <span className="text-gold font-medium">{nights} {nights === 1 ? 'noapte' : 'nopți'}</span>
                <span>·</span>
                <span>{formatDate(checkIn, 'ro-RO')} → {formatDate(checkOut, 'ro-RO')}</span>
              </div>
            )}

            <div className="mt-6">
              <label className="label-field">Număr persoane</label>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="w-10 h-10 border border-border hover:border-ink flex items-center justify-center text-ink transition-colors duration-200 font-sans text-lg"
                >
                  −
                </button>
                <span className="text-xl font-medium text-ink font-sans w-8 text-center">{guestsCount}</span>
                <button
                  onClick={() => setGuestsCount(Math.min(8, guestsCount + 1))}
                  className="w-10 h-10 border border-border hover:border-ink flex items-center justify-center text-ink transition-colors duration-200 font-sans text-lg"
                >
                  +
                </button>
                <span className="text-sm text-ink-muted font-sans">persoane (max. 8)</span>
              </div>
            </div>

            {nights > 0 && (
              <div className="mt-6 bg-white border border-border p-4">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-ink-muted">{nights} {nights === 1 ? 'noapte' : 'nopți'} × {formatPrice(PRICE_PER_NIGHT)}</span>
                  <span className="text-ink font-medium">{formatPrice(accommodationPrice)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm font-sans text-ink-muted">
                  <span>Preț final (fără extras)</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!checkIn || !checkOut || nights < 1}
              className="mt-8 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuă
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 2 — Extras */}
        {step === 2 && (
          <div className="max-w-xl animate-fade-up">
            <span className="eyebrow">Pasul 2 din 4</span>
            <h1 className="mt-3 font-serif text-display-sm text-ink font-light">
              Personalizează<br />experiența.
            </h1>
            <p className="mt-3 text-ink-muted font-sans">Ce extras-uri dorești pentru sejurul tău?</p>

            <div className="mt-8 flex flex-col gap-3">
              {EXTRAS_OPTIONS.map((extra) => {
                const prices: Record<string, number> = { 'Ciubăr': 150, 'Grătar': 80, 'Coș de bun venit': 120, 'Petit dejun inclus': 60 }
                const isSelected = selectedExtras.includes(extra)
                return (
                  <button
                    key={extra}
                    onClick={() => toggleExtra(extra)}
                    className={`w-full text-left px-5 py-4 border transition-all duration-200 group
                      ${isSelected ? 'border-slate bg-slate text-white' : 'border-border bg-white text-ink hover:border-ink'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm font-sans">{extra}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-sans ${isSelected ? 'text-gold' : 'text-ink-muted'}`}>
                          +{formatPrice(prices[extra])}
                        </span>
                        <div className={`w-5 h-5 border flex items-center justify-center text-xs transition-colors duration-200
                          ${isSelected ? 'border-gold bg-gold text-white' : 'border-border group-hover:border-ink'}`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedExtras.length > 0 && (
              <div className="mt-4 bg-white border border-border p-4 space-y-1.5">
                <div className="flex justify-between text-sm font-sans text-ink-muted">
                  <span>Cazare ({nights} nopți)</span>
                  <span>{formatPrice(accommodationPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans text-ink-muted">
                  <span>Extras</span>
                  <span>+{formatPrice(extrasPrice)}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between text-sm font-sans font-medium text-ink">
                  <span>Total estimat</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline">← Înapoi</button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Continuă
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Contact */}
        {step === 3 && (
          <div className="max-w-xl animate-fade-up">
            <span className="eyebrow">Pasul 3 din 4</span>
            <h1 className="mt-3 font-serif text-display-sm text-ink font-light">
              Datele tale.
            </h1>
            <p className="mt-3 text-ink-muted font-sans">Cum te contactăm pentru confirmare?</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="label-field">Nume complet *</label>
                <input
                  type="text"
                  placeholder="Ion Ionescu"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Telefon *</label>
                <input
                  type="tel"
                  placeholder="+40 700 000 000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  placeholder="ion@exemplu.ro"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Cerințe speciale (opțional)</label>
                <textarea
                  rows={3}
                  placeholder="Orice detaliu important pentru sejurul tău..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline">← Înapoi</button>
              <button
                onClick={() => setStep(4)}
                disabled={!guestName || !guestPhone}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuă
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Summary */}
        {step === 4 && (
          <div className="max-w-xl animate-fade-up">
            <span className="eyebrow">Pasul 4 din 4</span>
            <h1 className="mt-3 font-serif text-display-sm text-ink font-light">
              Sumar rezervare.
            </h1>

            <div className="mt-8 bg-white border border-border divide-y divide-border">
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-3">Proprietate</p>
                <p className="font-serif text-lg text-ink">Poiana Salcâmilor</p>
                <p className="text-sm text-ink-muted font-sans">Negrești, Vaslui</p>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Check-in</p>
                  <p className="font-medium text-ink font-sans text-sm">{formatDate(checkIn)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Check-out</p>
                  <p className="font-medium text-ink font-sans text-sm">{formatDate(checkOut)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Persoane</p>
                  <p className="font-medium text-ink font-sans text-sm">{guestsCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Durata</p>
                  <p className="font-medium text-ink font-sans text-sm">{nights} {nights === 1 ? 'noapte' : 'nopți'}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-1">Client</p>
                <p className="font-medium text-ink font-sans text-sm">{guestName}</p>
                <p className="text-sm text-ink-muted font-sans">{guestPhone}</p>
                {guestEmail && <p className="text-sm text-ink-muted font-sans">{guestEmail}</p>}
              </div>
              {selectedExtras.length > 0 && (
                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-2">Extras</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedExtras.map((e) => (
                      <span key={e} className="text-xs border border-border px-2.5 py-1 text-ink font-sans">{e}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-5 bg-sand">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-sans text-ink-muted">
                    <span>Cazare {nights} nopți × {formatPrice(PRICE_PER_NIGHT)}</span>
                    <span>{formatPrice(accommodationPrice)}</span>
                  </div>
                  {extrasPrice > 0 && (
                    <div className="flex justify-between text-sm font-sans text-ink-muted">
                      <span>Extras</span>
                      <span>+{formatPrice(extrasPrice)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border flex justify-between font-medium font-sans text-ink">
                    <span>Total estimat</span>
                    <span className="text-gold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-ink-muted font-sans">
                  * Prețul final va fi confirmat de proprietar în 24h.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(3)} className="btn-outline">← Înapoi</button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-gold flex-1 justify-center"
              >
                {loading ? 'Se procesează...' : 'Trimite rezervarea'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Confirmation */}
        {step === 5 && code && (
          <div className="max-w-xl animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                ✓
              </div>
              <div>
                <span className="eyebrow text-emerald-600">Rezervare înregistrată</span>
                <p className="text-xs text-ink-muted font-sans">Veți fi contactat în mai puțin de 24h</p>
              </div>
            </div>

            <div className="bg-white border border-border p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-ink-muted font-sans mb-3">Codul tău de rezervare</p>
              <p className="font-mono text-4xl font-bold text-slate tracking-widest">{code}</p>
              <p className="mt-3 text-sm text-ink-muted font-sans">
                Salvează acest cod — îl vei folosi pentru a accesa rezervarea ta.
              </p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-sans text-ink-muted mb-4">
                  {guestName} · {nights} nopți · {formatDate(checkIn)} → {formatDate(checkOut)}
                </p>
                <p className="text-lg font-medium text-ink font-sans">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold justify-center text-center"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Confirmă pe WhatsApp
              </a>
              <Link href={`/portal/${code}`} className="btn-outline justify-center text-center">
                Accesează portalul rezervării
              </Link>
              <Link href="/" className="text-center text-sm text-ink-muted hover:text-ink font-sans transition-colors">
                Înapoi la pagina principală
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RezervePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand flex items-center justify-center"><span className="text-ink-muted font-sans text-sm">Se încarcă...</span></div>}>
      <BookingContent />
    </Suspense>
  )
}
