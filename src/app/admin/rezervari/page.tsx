'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Reservation } from '@/types'

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

export default function RezervaPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadReservations() }, [])

  async function loadReservations() {
    setLoading(true)
    const { data } = await supabase
      .from('h_reservations')
      .select('*')
      .order('created_at', { ascending: false })
    setReservations((data as Reservation[]) || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await supabase.from('h_reservations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (selected?.id === id) setSelected((s) => s ? { ...s, status: status as Reservation['status'] } : null)
    setUpdating(false)
    await loadReservations()
  }

  const filtered = reservations.filter((r) => {
    const matchStatus = filter === 'all' || r.status === filter
    const matchSearch = !search ||
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      (r.guest_email || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink font-light">Rezervări</h1>
          <p className="text-sm text-ink-muted font-sans mt-1">{reservations.length} rezervări totale</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Caută după nume, cod sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-xs font-sans border transition-colors duration-150
                ${filter === s ? 'bg-slate text-white border-slate' : 'border-border text-ink-muted hover:border-ink'}`}
            >
              {s === 'all' ? 'Toate' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* List */}
        <div className="bg-white border border-border">
          {loading ? (
            <div className="p-6 text-sm text-ink-muted font-sans">Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-ink-muted font-sans">Nicio rezervare găsită.</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`w-full text-left px-5 py-4 hover:bg-sand transition-colors duration-150
                    ${selected?.id === r.id ? 'bg-gold/5 border-l-2 border-l-gold' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-ink font-sans">{r.guest_name}</p>
                        <span className={`status-badge ${STATUS_CLASSES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </div>
                      <p className="text-xs text-ink-muted font-sans mt-0.5">
                        {formatDate(r.check_in, 'ro-RO')} → {formatDate(r.check_out, 'ro-RO')} · {r.guests_count} pers.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-xs text-gold">{r.code}</p>
                      {r.total_price && (
                        <p className="text-xs text-ink-muted font-sans mt-0.5">{formatPrice(r.total_price)}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="bg-white border border-border h-fit sticky top-6">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-slate">{selected.code}</span>
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink text-lg">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Client</p>
                <p className="font-medium text-ink font-sans text-sm mt-1">{selected.guest_name}</p>
                {selected.guest_phone && <p className="text-sm text-ink-muted font-sans">{selected.guest_phone}</p>}
                {selected.guest_email && <p className="text-sm text-ink-muted font-sans">{selected.guest_email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Check-in</p>
                  <p className="text-sm font-medium text-ink font-sans mt-0.5">{formatDate(selected.check_in)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Check-out</p>
                  <p className="text-sm font-medium text-ink font-sans mt-0.5">{formatDate(selected.check_out)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Persoane</p>
                  <p className="text-sm font-medium text-ink font-sans mt-0.5">{selected.guests_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Total</p>
                  <p className="text-sm font-medium text-gold font-sans mt-0.5">
                    {selected.total_price ? formatPrice(selected.total_price) : '—'}
                  </p>
                </div>
              </div>

              {selected.extras && selected.extras.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-2">Extras</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.extras.map((e: string) => (
                      <span key={e} className="text-xs border border-border px-2 py-0.5 font-sans text-ink">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-1">Note</p>
                  <p className="text-sm text-ink font-sans leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Status actions */}
              <div className="pt-3 border-t border-border">
                <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-2">Schimbă status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['confirmed', 'pending', 'completed', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={selected.status === s || updating}
                      className={`py-2 text-xs font-sans border transition-colors duration-150 disabled:opacity-40
                        ${selected.status === s ? 'bg-slate text-white border-slate' : 'border-border text-ink-muted hover:border-ink'}`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <a
                  href={`/portal/${selected.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold font-sans hover:underline"
                >
                  Deschide portal client ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 flex items-center justify-center text-ink-muted/40 text-sm font-sans">
            Selectează o rezervare
          </div>
        )}
      </div>
    </div>
  )
}
