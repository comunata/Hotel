'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice, formatDateShort } from '@/lib/utils'
import type { Reservation } from '@/types'

const S = {
  bg: '#080808',
  surface: '#0F0F0F',
  card: '#111111',
  border: 'rgba(255,255,255,0.05)',
  text: '#E8E5E0',
  muted: '#4A4744',
  dim: '#2A2724',
  gold: '#C89B5B',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Așteptare', confirmed: 'Confirmată',
  cancelled: 'Anulată', completed: 'Finalizată',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.1)',  text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  confirmed: { bg: 'rgba(52,211,153,0.08)', text: '#34D399', border: 'rgba(52,211,153,0.2)'  },
  cancelled: { bg: 'rgba(248,113,113,0.08)',text: '#F87171', border: 'rgba(248,113,113,0.2)' },
  completed: { bg: 'rgba(255,255,255,0.04)',text: '#6B7280', border: 'rgba(255,255,255,0.08)'},
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-sans font-medium rounded-sm"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.text }} />
      {STATUS_LABELS[status]}
    </span>
  )
}

interface Stats {
  total: number; pending: number; confirmed: number
  revenue: number; guestsCount: number
  upcoming: Reservation[]; recent: Reservation[]
  occupancyRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0, pending: 0, confirmed: 0, revenue: 0, guestsCount: 0,
    upcoming: [], recent: [], occupancyRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 8) + '01'

    const [{ data: reservations }, { count: guestsCount }] = await Promise.all([
      supabase.from('h_reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('h_guests').select('*', { count: 'exact', head: true }),
    ])

    if (!reservations) { setLoading(false); return }

    const pending = reservations.filter(r => r.status === 'pending').length
    const confirmed = reservations.filter(r => r.status === 'confirmed').length
    const revenue = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((s, r) => s + (r.total_price || 0), 0)

    // Occupancy: nights booked this month / days in month
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const nightsBooked = reservations
      .filter(r => r.status !== 'cancelled' && r.check_in >= monthStart)
      .reduce((s, r) => {
        const ci = new Date(r.check_in), co = new Date(r.check_out)
        return s + Math.max(0, Math.round((co.getTime() - ci.getTime()) / 86400000))
      }, 0)
    const occupancyRate = Math.min(100, Math.round((nightsBooked / daysInMonth) * 100))

    const upcoming = reservations
      .filter(r => r.check_in >= today && r.status !== 'cancelled')
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
      .slice(0, 6)
    const recent = reservations.slice(0, 6)

    setStats({ total: reservations.length, pending, confirmed, revenue, guestsCount: guestsCount || 0, upcoming, recent, occupancyRate })
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await supabase.from('h_reservations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    await loadData()
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3" style={{ color: S.muted }}>
        <div className="w-4 h-4 rounded-full border border-[#C89B5B] border-t-transparent animate-spin" />
        <span className="font-sans text-sm">Se încarcă...</span>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8" style={{ background: S.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] mb-2" style={{ color: S.gold }}>
            Poiana Salcâmilor
          </p>
          <h1 className="font-serif text-4xl font-light" style={{ color: S.text }}>Dashboard</h1>
          <p className="font-sans text-sm mt-1" style={{ color: S.muted }}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/rezervare"
          target="_blank"
          className="flex items-center gap-2 font-sans text-sm px-5 py-2.5 transition-colors duration-200"
          style={{ background: 'rgba(200,155,91,0.12)', color: S.gold, border: '1px solid rgba(200,155,91,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,155,91,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,155,91,0.12)')}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Rezervare nouă
        </Link>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Rezervări totale', value: stats.total, sub: `${stats.pending} în așteptare` },
          { label: 'Confirmate', value: stats.confirmed, sub: 'rezervări active' },
          { label: 'Clienți CRM', value: stats.guestsCount, sub: 'contacte' },
          { label: 'Venit total', value: formatPrice(stats.revenue), sub: 'toate rezervările', gold: true },
        ].map((m, i) => (
          <div key={i} className="p-5" style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: S.muted }}>
              {m.label}
            </p>
            <p className="font-serif text-4xl font-light" style={{ color: m.gold ? S.gold : S.text }}>
              {m.value}
            </p>
            <p className="font-sans text-xs mt-2" style={{ color: S.dim }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="mb-8 p-5" style={{ background: S.card, border: `1px solid ${S.border}` }}>
        <div className="flex items-end justify-between mb-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: S.muted }}>
            Ocupare luna curentă
          </p>
          <p className="font-serif text-2xl font-light" style={{ color: S.gold }}>
            {stats.occupancyRate}%
          </p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${stats.occupancyRate}%`, background: `linear-gradient(90deg, #A8813E, #C89B5B, #D4AF7A)` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upcoming check-ins */}
        <div style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${S.border}` }}>
            <p className="font-serif text-base font-light" style={{ color: S.text }}>Check-in-uri viitoare</p>
            <Link href="/admin/rezervari" className="font-sans text-xs transition-colors duration-200" style={{ color: S.gold }}>
              Toate →
            </Link>
          </div>
          {stats.upcoming.length === 0 ? (
            <div className="p-5">
              <p className="font-sans text-sm" style={{ color: S.muted }}>Niciun check-in viitor.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {stats.upcoming.map(r => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3"
                  style={{ borderBottom: `1px solid ${S.border}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-sans font-medium text-sm truncate" style={{ color: S.text }}>
                        {r.guest_name}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="font-sans text-xs" style={{ color: S.muted }}>
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)} · {r.guests_count} pers.
                    </p>
                    <p className="font-mono text-xs mt-0.5" style={{ color: S.gold }}>{r.code}</p>
                  </div>
                  {r.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(r.id, 'confirmed')}
                      disabled={updating === r.id}
                      className="flex-shrink-0 font-sans text-xs px-3 py-1.5 transition-colors duration-150 disabled:opacity-40"
                      style={{ background: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}
                    >
                      {updating === r.id ? '...' : 'Confirmă'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reservations */}
        <div style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${S.border}` }}>
            <p className="font-serif text-base font-light" style={{ color: S.text }}>Rezervări recente</p>
          </div>
          {stats.recent.length === 0 ? (
            <div className="p-5">
              <p className="font-sans text-sm" style={{ color: S.muted }}>Nicio rezervare.</p>
            </div>
          ) : (
            <div>
              {stats.recent.map(r => (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-3"
                  style={{ borderBottom: `1px solid ${S.border}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-sm truncate" style={{ color: S.text }}>{r.guest_name}</p>
                    <p className="font-sans text-xs mt-0.5" style={{ color: S.muted }}>
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs" style={{ color: S.gold }}>{r.code}</p>
                    <div className="mt-1"><StatusBadge status={r.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline CTA */}
      <div className="mt-5 p-5 flex items-center justify-between"
        style={{ background: 'rgba(200,155,91,0.06)', border: '1px solid rgba(200,155,91,0.15)' }}>
        <div>
          <p className="font-serif text-lg font-light" style={{ color: S.text }}>Calendar Timeline</p>
          <p className="font-sans text-sm mt-0.5" style={{ color: S.muted }}>
            Vizualizare Gantt · 90 zile · blocare date cu un click
          </p>
        </div>
        <Link
          href="/admin/calendar"
          className="font-sans text-sm px-5 py-2.5 transition-colors duration-200"
          style={{ background: S.gold, color: '#ffffff' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#A8813E')}
          onMouseLeave={e => (e.currentTarget.style.background = S.gold)}
        >
          Deschide →
        </Link>
      </div>
    </div>
  )
}
