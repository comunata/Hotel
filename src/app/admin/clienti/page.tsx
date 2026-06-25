'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Guest } from '@/types'

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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink font-light">Clienți CRM</h1>
        <p className="text-sm text-ink-muted font-sans mt-1">{guests.length} contacte</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută după nume, email sau telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Guest list */}
        <div className="bg-white border border-border">
          {loading ? (
            <div className="p-6 text-sm text-ink-muted font-sans">Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-ink-muted font-sans">
              {guests.length === 0
                ? 'Niciun client încă. Clienții apar automat la prima rezervare.'
                : 'Niciun rezultat.'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`w-full text-left px-5 py-4 hover:bg-sand transition-colors duration-150
                    ${selected?.id === g.id ? 'bg-gold/5 border-l-2 border-l-gold' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink font-sans">{g.name}</p>
                      <p className="text-xs text-ink-muted font-sans mt-0.5">
                        {g.email || g.phone || '—'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-ink font-sans">{g.visits_count} {g.visits_count === 1 ? 'vizită' : 'vizite'}</p>
                      {g.last_visit && (
                        <p className="text-xs text-ink-muted font-sans mt-0.5">
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
          <div className="bg-white border border-border h-fit sticky top-6">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="font-serif text-base text-ink">{selected.name}</p>
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-ink-muted font-sans w-16">Tel</span>
                    <a href={`tel:${selected.phone}`} className="text-sm text-ink font-sans hover:text-gold transition-colors">{selected.phone}</a>
                  </div>
                )}
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-ink-muted font-sans w-16">Email</span>
                    <a href={`mailto:${selected.email}`} className="text-sm text-ink font-sans hover:text-gold transition-colors">{selected.email}</a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Vizite</p>
                  <p className="text-2xl font-serif text-ink font-light mt-1">{selected.visits_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Client din</p>
                  <p className="text-sm font-sans text-ink mt-1">
                    {selected.first_visit ? formatDate(selected.first_visit) : '—'}
                  </p>
                </div>
              </div>

              {selected.last_visit && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">Ultima vizită</p>
                  <p className="text-sm font-sans text-ink mt-1">{formatDate(selected.last_visit)}</p>
                </div>
              )}

              {selected.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-1">Note</p>
                  <p className="text-sm text-ink font-sans leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {selected.preferences && Object.keys(selected.preferences).length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans mb-2">Preferințe</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selected.preferences).map(([k, v]) => (
                      <span key={k} className="text-xs border border-border px-2 py-0.5 font-sans text-ink">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-[10px] uppercase tracking-widest text-gold font-sans">
                  {selected.visits_count >= 3 ? '★ Client fidel' : selected.visits_count >= 2 ? '◈ Client recurent' : '◎ Client nou'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 flex items-center justify-center text-ink-muted/40 text-sm font-sans">
            Selectează un client
          </div>
        )}
      </div>
    </div>
  )
}
