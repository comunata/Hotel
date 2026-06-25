'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice, formatDateShort } from '@/lib/utils'
import type { Reservation, Guest } from '@/types'

interface Stats {
  total: number
  pending: number
  confirmed: number
  completed: number
  revenue: number
  guestsCount: number
  upcoming: Reservation[]
  recent: Reservation[]
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-white border border-border p-5 ${accent ? 'border-gold/30 bg-gold/5' : ''}`}>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">{label}</p>
      <p className={`mt-2 text-3xl font-serif font-light ${accent ? 'text-gold' : 'text-ink'}`}>{value}</p>
      {sub && <p className="text-xs text-ink-muted font-sans mt-1">{sub}</p>}
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Așteptare',
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0, pending: 0, confirmed: 0, completed: 0,
    revenue: 0, guestsCount: 0, upcoming: [], recent: [],
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [{ data: reservations }, { count: guestsCount }] = await Promise.all([
      supabase.from('h_reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('h_guests').select('*', { count: 'exact', head: true }),
    ])

    if (!reservations) { setLoading(false); return }

    const pending = reservations.filter((r) => r.status === 'pending').length
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length
    const completed = reservations.filter((r) => r.status === 'completed').length
    const revenue = reservations
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.total_price || 0), 0)
    const upcoming = reservations
      .filter((r) => r.check_in >= today && r.status !== 'cancelled')
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
      .slice(0, 5)
    const recent = reservations.slice(0, 5)

    setStats({
      total: reservations.length,
      pending, confirmed, completed,
      revenue, guestsCount: guestsCount || 0,
      upcoming, recent,
    })
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
      <div className="p-8 flex items-center gap-3">
        <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-ink-muted font-sans text-sm">Se încarcă datele...</span>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink font-light">Dashboard</h1>
          <p className="text-sm text-ink-muted font-sans mt-1">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/rezervare" target="_blank" className="btn-gold text-xs px-4 py-2.5">
          + Rezervare nouă
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total rezervări" value={stats.total} sub={`${stats.pending} în așteptare`} />
        <StatCard label="Confirmate" value={stats.confirmed} sub="rezervări active" />
        <StatCard label="Clienți CRM" value={stats.guestsCount} sub="contacte totale" />
        <StatCard label="Venit total" value={formatPrice(stats.revenue)} sub="toate rezervările" accent />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming check-ins */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-base text-ink">Check-in-uri viitoare</h2>
            <Link href="/admin/rezervari" className="text-xs text-gold font-sans hover:underline">
              Vezi toate →
            </Link>
          </div>
          {stats.upcoming.length === 0 ? (
            <div className="p-5 text-sm text-ink-muted font-sans">Nicio rezervare viitoare.</div>
          ) : (
            <div className="divide-y divide-border">
              {stats.upcoming.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-ink font-sans truncate">{r.guest_name}</p>
                      <span className={`status-badge ${STATUS_CLASSES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                    </div>
                    <p className="text-xs text-ink-muted font-sans mt-0.5">
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)} · {r.guests_count} pers.
                    </p>
                    <p className="font-mono text-xs text-gold mt-0.5">{r.code}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(r.id, 'confirmed')}
                        disabled={updating === r.id}
                        className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-sans disabled:opacity-50"
                      >
                        {updating === r.id ? '...' : 'Confirmă'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reservations */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-serif text-base text-ink">Rezervări recente</h2>
          </div>
          {stats.recent.length === 0 ? (
            <div className="p-5 text-sm text-ink-muted font-sans">Nicio rezervare.</div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recent.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-ink font-sans truncate">{r.guest_name}</p>
                    </div>
                    <p className="text-xs text-ink-muted font-sans mt-0.5">
                      {formatDateShort(r.check_in)} → {formatDateShort(r.check_out)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs text-gold">{r.code}</p>
                    <span className={`status-badge ${STATUS_CLASSES[r.status]} mt-1`}>{STATUS_LABELS[r.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mini calendar hint */}
      <div className="mt-6 bg-slate text-white p-6 flex items-center justify-between">
        <div>
          <p className="font-serif text-xl font-light">Calendar disponibilitate</p>
          <p className="text-white/60 text-sm font-sans mt-1">Gestionează perioadele blocate și disponibilitatea.</p>
        </div>
        <Link href="/admin/calendar" className="btn-gold text-xs">
          Deschide calendar →
        </Link>
      </div>
    </div>
  )
}
