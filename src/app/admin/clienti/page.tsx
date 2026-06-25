'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Guest } from '@/types'

const S = {
  bg: '#080808', card: '#111111',
  border: 'rgba(255,255,255,0.05)',
  text: '#E8E5E0', muted: '#4A4744', dim: '#2A2724', gold: '#C89B5B',
}

export default function ClientiPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Guest | null>(null)

  useEffect(() => { loadGuests() }, [])

  async function loadGuests() {
    setLoading(true)
    const { data } = await supabase
      .from('h_guests')
      .select('*')
      .order('last_visit', { ascending: false })
    setGuests((data as Guest[]) || [])
    setLoading(false)
  }

  const filtered = guests.filter((g) =>
    !search ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.phone || '').includes(search)
  )

  return (
    <div className="p-6 lg:p-8" style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light" style={{ color: S.text }}>Clienți CRM</h1>
        <p className="text-sm font-sans mt-1" style={{ color: S.muted }}>{guests.length} contacte</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută după nume, email sau telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm font-sans text-sm px-4 py-2.5 outline-none transition-colors duration-150"
          style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            color: S.text,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = S.gold)}
          onBlur={e => (e.currentTarget.style.borderColor = S.border)}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Guest list */}
        <div style={{ background: S.card, border: `1px solid ${S.border}` }}>
          {loading ? (
            <div className="p-6 text-sm font-sans" style={{ color: S.muted }}>Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm font-sans" style={{ color: S.muted }}>
              {guests.length === 0
                ? 'Niciun client încă. Clienții apar automat la prima rezervare.'
                : 'Niciun rezultat.'}
            </div>
          ) : (
            <div>
              {filtered.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className="w-full text-left px-5 py-4 transition-colors duration-150"
                  style={{
                    borderBottom: `1px solid ${S.border}`,
                    background: selected?.id === g.id ? 'rgba(200,155,91,0.06)' : 'transparent',
                    borderLeft: selected?.id === g.id ? `2px solid ${S.gold}` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (selected?.id !== g.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (selected?.id !== g.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm font-sans" style={{ color: S.text }}>{g.name}</p>
                      <p className="text-xs font-sans mt-0.5" style={{ color: S.muted }}>
                        {g.email || g.phone || '—'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium font-sans" style={{ color: S.text }}>
                        {g.visits_count} {g.visits_count === 1 ? 'vizită' : 'vizite'}
                      </p>
                      {g.last_visit && (
                        <p className="text-xs font-sans mt-0.5" style={{ color: S.muted }}>
                          Ultima: {formatDate(g.last_visit)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="h-fit sticky top-6" style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${S.border}` }}>
              <p className="font-serif text-base" style={{ color: S.text }}>{selected.name}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-lg transition-colors duration-150"
                style={{ color: S.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = S.text)}
                onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
              >×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-sans w-16" style={{ color: S.muted }}>Tel</span>
                    <a href={`tel:${selected.phone}`} className="text-sm font-sans transition-colors"
                      style={{ color: S.text }}
                      onMouseEnter={e => (e.currentTarget.style.color = S.gold)}
                      onMouseLeave={e => (e.currentTarget.style.color = S.text)}
                    >{selected.phone}</a>
                  </div>
                )}
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-sans w-16" style={{ color: S.muted }}>Email</span>
                    <a href={`mailto:${selected.email}`} className="text-sm font-sans transition-colors"
                      style={{ color: S.text }}
                      onMouseEnter={e => (e.currentTarget.style.color = S.gold)}
                      onMouseLeave={e => (e.currentTarget.style.color = S.text)}
                    >{selected.email}</a>
                  </div>
                )}
              </div>

              <div className="pt-3 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${S.border}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Vizite</p>
                  <p className="text-2xl font-serif font-light mt-1" style={{ color: S.text }}>{selected.visits_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Client din</p>
                  <p className="text-sm font-sans mt-1" style={{ color: S.text }}>
                    {selected.first_visit ? formatDate(selected.first_visit) : '—'}
                  </p>
                </div>
              </div>

              {selected.last_visit && (
                <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.muted }}>Ultima vizită</p>
                  <p className="text-sm font-sans mt-1" style={{ color: S.text }}>{formatDate(selected.last_visit)}</p>
                </div>
              )}

              {selected.notes && (
                <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <p className="text-[10px] uppercase tracking-widest font-sans mb-1" style={{ color: S.muted }}>Note</p>
                  <p className="text-sm font-sans leading-relaxed" style={{ color: S.text }}>{selected.notes}</p>
                </div>
              )}

              {selected.preferences && Object.keys(selected.preferences).length > 0 && (
                <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                  <p className="text-[10px] uppercase tracking-widest font-sans mb-2" style={{ color: S.muted }}>Preferințe</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selected.preferences).map(([k, v]) => (
                      <span key={k} className="text-xs px-2 py-0.5 font-sans"
                        style={{ border: `1px solid ${S.border}`, color: S.text }}>
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
                <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: S.gold }}>
                  {selected.visits_count >= 3 ? '★ Client fidel' : selected.visits_count >= 2 ? '◈ Client recurent' : '◎ Client nou'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center text-sm font-sans"
            style={{ border: `1px dashed ${S.border}`, color: S.dim }}>
            Selectează un client
          </div>
        )}
      </div>
    </div>
  )
}
