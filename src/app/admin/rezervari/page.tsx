'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Reservation } from '@/types'

const S = {
  bg: '#080808', card: '#111111', card2: '#161616',
  border: 'rgba(255,255,255,0.05)', border2: 'rgba(255,255,255,0.03)',
  text: '#E8E5E0', muted: '#4A4744', dim: '#2A2724', gold: '#C89B5B',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Așteptare',
  confirmed: 'Confirmată',
  cancelled: 'Anulată',
  completed: 'Finalizată',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg:'rgba(245,158,11,0.1)',  text:'#F59E0B', border:'rgba(245,158,11,0.25)' },
  confirmed: { bg:'rgba(52,211,153,0.08)', text:'#34D399', border:'rgba(52,211,153,0.2)'  },
  cancelled: { bg:'rgba(248,113,113,0.08)',text:'#F87171', border:'rgba(248,113,113,0.2)' },
  completed: { bg:'rgba(255,255,255,0.04)',text:'#6B7280', border:'rgba(255,255,255,0.08)'},
}
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-sans font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
      {STATUS_LABELS[status]}
    </span>
  )
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
    <div className="p-6 lg:p-8" style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light" style={{ color: S.text }}>Rezervări</h1>
          <p className="text-sm font-sans mt-1" style={{ color: S.muted }}>{reservations.length} rezervări totale</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Caută după nume, cod sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs font-sans text-sm px-4 py-2.5 outline-none transition-colors duration-150"
          style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            color: S.text,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = S.gold)}
          onBlur={e => (e.currentTarget.style.borderColor = S.border)}
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-2 text-xs font-sans transition-colors duration-150"
              style={{
                background: filter === s ? S.gold : 'transparent',
                color: filter === s ? '#ffffff' : S.muted,
                border: `1px solid ${filter === s ? S.gold : S.border}`,
              }}
            >
              {s === 'all' ? 'Toate' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* List */}
        <div style={{ background: S.card, border: `1px solid ${S.border}` }}>
          {loading ? (
            <div className="p-6 text-sm font-sans" style={{ color: S.muted }}>Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm font-sans" style={{ color: S.muted }}>Nicio rezervare găsită.</div>
          ) : (
            <div>
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full text-left px-5 py-4 transition-colors duration-150"
                  style={{
                    borderBottom: `1px solid ${S.border}`,
                    background: selected?.id === r.id ? 'rgba(200,155,91,0.06)' : 'transparent',
                    borderLeft: selected?.id === r.id ? `2px solid ${S.gold}` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (selected?.id !== r.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (selected?.id !== r.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm font-sans" style={{ color: S.text }}>{r.guest_name}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs font-sans mt-0.5" style={{ color: S.muted }}>
                        {formatDate(r.check_in, 'ro-RO')} → {formatDate(r.check_out, 'ro-RO')} · {r.guests_count} pers.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-xs" style={{ color: S.gold }}>{r.code}</p>
                      {r.total_price && (
                        <p className="text-xs font-sans mt-0.5" style={{ color: S.muted }}>{formatPrice(r.total_price)}</p>
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
          <div className="h-fit sticky top-6" style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${S.border}` }}>
              <span className="font-mono text-sm font-bold" style={{ color: S.gold }}>{selected.code}</span>
              <button
                onClick={() => setSelected(null)}
                className="text-lg transition-colors duration-150"
                style={{ color: S.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
              >×</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Client</p>
                <p className="font-medium font-sans text-sm mt-1" style={{ color: S.text }}>{selected.guest_name}</p>
                {selected.guest_phone && <p className="text-sm font-sans" style={{ color: S.muted }}>{selected.guest_phone}</p>}
                {selected.guest_email && <p className="text-sm font-sans" style={{ color: S.muted }}>{selected.guest_email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Check-in</p>
                  <p className="text-sm font-medium font-sans mt-0.5" style={{ color: S.text }}>{formatDate(selected.check_in)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Check-out</p>
                  <p className="text-sm font-medium font-sans mt-0.5" style={{ color: S.text }}>{formatDate(selected.check_out)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Persoane</p>
                  <p className="text-sm font-medium font-sans mt-0.5" style={{ color: S.text }}>{selected.guests_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Total</p>
                  <p className="text-sm font-medium font-sans mt-0.5" style={{ color: S.gold }}>
                    {selected.total_price ? formatPrice(selected.total_price) : '—'}
                  </p>
                </div>
              </div>

              {selected.extras && selected.extras.length > 0 && (
                <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <p className="text-[10px] uppercase tracking-widest font-sans mb-2" style={{ color: S.muted }}>Extras</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.extras.map((e: string) => (
                      <span key={e} className="text-xs px-2 py-0.5 font-sans" style={{ border: `1px solid ${S.border}`, color: S.text }}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <p className="text-[10px] uppercase tracking-widest font-sans mb-1" style={{ color: S.muted }}>Note</p>
                  <p className="text-sm font-sans leading-relaxed" style={{ color: S.text }}>{selected.notes}</p>
                </div>
              )}

              {/* Status actions */}
              <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                <p className="text-[10px] uppercase tracking-widest font-sans mb-2" style={{ color: S.muted }}>Schimbă status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['confirmed', 'pending', 'completed', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={selected.status === s || updating}
                      className="py-2 text-xs font-sans transition-colors duration-150 disabled:opacity-40"
                      style={{
                        background: selected.status === s ? S.gold : 'transparent',
                        color: selected.status === s ? '#ffffff' : S.muted,
                        border: `1px solid ${selected.status === s ? S.gold : S.border}`,
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                <a
                  href={`/portal/${selected.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans hover:underline"
                  style={{ color: S.gold }}
                >
                  Deschide portal client ↗
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center text-sm font-sans"
            style={{ border: `1px dashed ${S.border}`, color: S.dim }}>
            Selectează o rezervare
          </div>
        )}
      </div>
    </div>
  )
}
