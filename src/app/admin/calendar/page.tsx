'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reservation } from '@/types'

const CELL_W = 52
const VISIBLE_DAYS = 90
const MONTHS_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
const DAYS_MINI = ['L','M','M','J','V','S','D']

const S = {
  bg: '#080808', card: '#111111',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.03)',
  text: '#E8E5E0', muted: '#4A4744', dim: '#2A2724',
  gold: '#C89B5B',
}

function addDays(date: Date, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toStr(d: Date) { return d.toISOString().split('T')[0] }
function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000)
}
function getDow(d: Date) { const x = d.getDay(); return x === 0 ? 6 : x - 1 }

const STATUS_BAR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending:   { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.3)',  text:'#F59E0B', dot:'#F59E0B' },
  confirmed: { bg:'rgba(52,211,153,0.09)', border:'rgba(52,211,153,0.25)', text:'#34D399', dot:'#34D399' },
  completed: { bg:'rgba(255,255,255,0.04)',border:'rgba(255,255,255,0.1)', text:'#6B7280', dot:'#6B7280' },
}

export default function CalendarPage() {
  const today = new Date(); today.setHours(0,0,0,0)
  const startDate = useRef(addDays(today, -7)).current

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ r: Reservation; x: number; y: number } | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Scroll to today on mount
  useEffect(() => {
    if (timelineRef.current) {
      const todayOff = daysBetween(startDate, today)
      timelineRef.current.scrollLeft = Math.max(0, (todayOff - 4) * CELL_W)
    }
  }, [])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const rangeStart = toStr(startDate)
    const rangeEnd = toStr(addDays(startDate, VISIBLE_DAYS + 1))
    const [{ data: res }, { data: avail }] = await Promise.all([
      supabase.from('h_reservations').select('*')
        .gte('check_out', rangeStart).lte('check_in', rangeEnd).neq('status','cancelled'),
      supabase.from('h_availability').select('date')
        .gte('date', rangeStart).lte('date', rangeEnd).eq('is_available', false),
    ])
    setReservations((res as Reservation[]) || [])
    setBlocked(new Set((avail || []).map((a: { date: string }) => a.date)))
    setLoading(false)
  }

  async function toggleBlock(dateStr: string) {
    if (toggling) return
    setToggling(dateStr)
    if (blocked.has(dateStr)) {
      await supabase.from('h_availability').delete().eq('date', dateStr)
      setBlocked(p => { const n = new Set(p); n.delete(dateStr); return n })
    } else {
      await supabase.from('h_availability').upsert({ date: dateStr, is_available: false, property_id: null, room_id: null })
      setBlocked(p => new Set([...p, dateStr]))
    }
    setToggling(null)
  }

  const days = Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(startDate, i))
  const todayOff = daysBetween(startDate, today)

  // Month groups for header
  const monthGroups: { label: string; count: number }[] = []
  days.forEach(d => {
    const label = `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    const last = monthGroups[monthGroups.length - 1]
    if (!last || last.label !== label) monthGroups.push({ label, count: 1 })
    else last.count++
  })

  // Bar positions for each reservation
  function getBar(r: Reservation) {
    const ci = new Date(r.check_in); ci.setHours(0,0,0,0)
    const co = new Date(r.check_out); co.setHours(0,0,0,0)
    const oStart = daysBetween(startDate, ci)
    const oEnd = daysBetween(startDate, co)
    const cStart = Math.max(0, oStart)
    const cEnd = Math.min(VISIBLE_DAYS, oEnd)
    if (cStart >= cEnd) return null
    return {
      left: cStart * CELL_W, width: (cEnd - cStart) * CELL_W - 2,
      cutLeft: oStart < 0, cutRight: oEnd > VISIBLE_DAYS,
    }
  }

  const bars = reservations
    .map(r => ({ ...r, bar: getBar(r) }))
    .filter(r => r.bar !== null)

  // Check if a day has a reservation
  function dayHasRes(i: number) {
    const d = days[i]; if (!d) return false
    const ds = toStr(d)
    return bars.some(r => {
      const ci = new Date(r.check_in); ci.setHours(0,0,0,0)
      const co = new Date(r.check_out); co.setHours(0,0,0,0)
      return d >= ci && d < co
    })
  }

  const totalW = VISIBLE_DAYS * CELL_W
  const trackH = Math.max(80, bars.length * 52 + 24)

  return (
    <div className="p-6 lg:p-8" style={{ background: S.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] mb-2" style={{ color: S.gold }}>Timeline</p>
          <h1 className="font-serif text-4xl font-light" style={{ color: S.text }}>Calendar</h1>
          <p className="font-sans text-sm mt-1" style={{ color: S.muted }}>
            {VISIBLE_DAYS} zile · rezervări vizibile ca bare · click mic pătrat = blocare
          </p>
        </div>
        <div className="flex items-center gap-5 pt-2">
          {Object.entries(STATUS_BAR).filter(([k]) => k !== 'completed').map(([key, s]) => (
            <span key={key} className="flex items-center gap-2 font-sans text-xs" style={{ color: S.muted }}>
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: s.bg, border: `1px solid ${s.border}` }} />
              {key === 'pending' ? 'Așteptare' : 'Confirmat'}
            </span>
          ))}
          <span className="flex items-center gap-2 font-sans text-xs" style={{ color: S.muted }}>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(200,155,91,0.2)', border: '1px solid rgba(200,155,91,0.35)' }} />
            Blocat
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3" style={{ color: S.muted }}>
          <div className="w-4 h-4 rounded-full border border-[#C89B5B] border-t-transparent animate-spin" />
          <span className="font-sans text-sm">Se încarcă timeline-ul...</span>
        </div>
      ) : (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
          {/* Scrollable timeline */}
          <div ref={timelineRef} className="overflow-x-auto scrollbar-hide" style={{ position: 'relative' }}>
            <div style={{ width: `${totalW}px` }}>

              {/* Month row */}
              <div className="flex" style={{ borderBottom: `1px solid ${S.border}` }}>
                {monthGroups.map((g, i) => (
                  <div key={i}
                    style={{ width: `${g.count * CELL_W}px`, borderRight: `1px solid ${S.border}`, flexShrink: 0 }}
                    className="px-3 py-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: S.gold }}>
                      {g.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day header row */}
              <div className="flex" style={{ borderBottom: `1px solid ${S.border}` }}>
                {days.map((d, i) => {
                  const isToday = i === todayOff
                  const isPast = i < todayOff
                  const isWE = getDow(d) >= 5
                  return (
                    <div key={i}
                      className="flex flex-col items-center py-2 relative"
                      style={{
                        width: `${CELL_W}px`, flexShrink: 0,
                        borderRight: `1px solid ${S.border2}`,
                        background: isToday ? 'rgba(200,155,91,0.08)' : isWE ? 'rgba(255,255,255,0.01)' : 'transparent',
                        opacity: isPast ? 0.35 : 1,
                      }}>
                      <span className="font-sans text-[9px] uppercase"
                        style={{ color: isToday ? S.gold : S.dim, letterSpacing: '0.1em' }}>
                        {DAYS_MINI[getDow(d)]}
                      </span>
                      <span className="font-sans text-sm font-medium mt-0.5"
                        style={{ color: isToday ? S.gold : S.muted }}>
                        {d.getDate()}
                      </span>
                      {isToday && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: S.gold }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Reservation track */}
              <div className="relative" style={{ height: `${trackH}px` }}>
                {/* Column backgrounds */}
                <div className="absolute inset-0 flex pointer-events-none" style={{ zIndex: 0 }}>
                  {days.map((d, i) => {
                    const isToday = i === todayOff
                    const isBlocked = blocked.has(toStr(d))
                    const isWE = getDow(d) >= 5
                    return (
                      <div key={i} style={{
                        width: `${CELL_W}px`, flexShrink: 0, height: '100%',
                        borderRight: `1px solid ${S.border2}`,
                        background: isBlocked ? 'rgba(200,155,91,0.06)'
                          : isToday ? 'rgba(200,155,91,0.04)'
                          : isWE ? 'rgba(255,255,255,0.005)' : 'transparent',
                      }} />
                    )
                  })}
                </div>

                {/* Today line */}
                <div className="absolute top-0 bottom-0 pointer-events-none" style={{
                  left: `${todayOff * CELL_W + CELL_W / 2}px`,
                  width: '1px', background: 'rgba(200,155,91,0.35)', zIndex: 5,
                }} />

                {/* Reservation bars */}
                {bars.map((r, idx) => {
                  const bar = r.bar!
                  const st = STATUS_BAR[r.status] || STATUS_BAR.pending
                  const nights = Math.round(
                    (new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 86400000
                  )
                  return (
                    <div key={r.id}
                      className="absolute flex items-center cursor-pointer transition-all duration-150"
                      style={{
                        left: `${bar.left + 2}px`, width: `${bar.width}px`,
                        top: `${idx * 52 + 14}px`, height: '36px',
                        background: st.bg, border: `1px solid ${st.border}`,
                        borderRadius: !bar.cutLeft && !bar.cutRight ? '3px'
                          : bar.cutLeft ? '0 3px 3px 0' : '3px 0 0 3px',
                        zIndex: 10, paddingLeft: '10px', paddingRight: '8px',
                      }}
                      onMouseEnter={e => setTooltip({ r, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-2" style={{ background: st.dot }} />
                      <span className="font-sans text-xs font-medium truncate" style={{ color: st.text }}>
                        {r.guest_name}
                      </span>
                      {bar.width > 120 && (
                        <span className="font-mono text-[10px] ml-2 flex-shrink-0 opacity-50" style={{ color: st.text }}>
                          {nights}n
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Blocked markers */}
                {days.map((d, i) => {
                  const ds = toStr(d)
                  if (!blocked.has(ds) || dayHasRes(i)) return null
                  return (
                    <div key={ds} className="absolute bottom-3 font-sans text-center pointer-events-none"
                      style={{ left: `${i * CELL_W}px`, width: `${CELL_W}px`, fontSize: '11px', color: 'rgba(200,155,91,0.4)' }}>
                      ×
                    </div>
                  )
                })}

                {bars.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-sans text-sm" style={{ color: S.dim }}>
                      Nicio rezervare în această perioadă
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mini availability strip */}
          <div style={{ borderTop: `1px solid ${S.border}`, padding: '16px 20px 20px' }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: S.dim }}>
              Disponibilitate · click pentru blocare / deblocare
            </p>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-0.5" style={{ width: `${VISIBLE_DAYS * 20}px` }}>
                {days.map((d, i) => {
                  const ds = toStr(d)
                  const isBlocked = blocked.has(ds)
                  const isPast = i < todayOff
                  const isToday = i === todayOff
                  const hasRes = dayHasRes(i)
                  const tog = toggling === ds
                  return (
                    <button key={i}
                      disabled={isPast || tog}
                      onClick={() => !isPast && !hasRes && toggleBlock(ds)}
                      title={ds}
                      style={{
                        width: '18px', height: '18px', flexShrink: 0,
                        borderRadius: '2px', cursor: isPast ? 'default' : hasRes ? 'not-allowed' : 'pointer',
                        opacity: isPast ? 0.2 : 1,
                        outline: isToday ? `1.5px solid ${S.gold}` : 'none',
                        outlineOffset: '1px',
                        background: hasRes ? 'rgba(52,211,153,0.35)'
                          : isBlocked ? 'rgba(200,155,91,0.45)'
                          : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.1s',
                        transform: tog ? 'scale(0.8)' : 'scale(1)',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none font-sans"
          style={{
            left: tooltip.x + 12, top: tooltip.y - 8,
            background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 14px', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}>
          <p className="text-xs font-medium mb-1" style={{ color: S.text }}>{tooltip.r.guest_name}</p>
          <p className="text-[11px] font-mono" style={{ color: S.gold }}>{tooltip.r.code}</p>
          <p className="text-[11px] mt-1" style={{ color: S.muted }}>
            {tooltip.r.check_in} → {tooltip.r.check_out}
          </p>
          <p className="text-[11px]" style={{ color: S.muted }}>{tooltip.r.guests_count} persoane</p>
          {tooltip.r.total_price && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: S.gold }}>
              {tooltip.r.total_price.toLocaleString('ro-RO')} RON
            </p>
          )}
        </div>
      )}
    </div>
  )
}
