'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reservation } from '@/types'

const DAYS_RO = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']
const MONTHS_RO = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [year, month])

  async function loadData() {
    setLoading(true)
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`

    const { data } = await supabase
      .from('h_reservations')
      .select('*')
      .gte('check_in', start)
      .lte('check_in', end)
      .neq('status', 'cancelled')

    const { data: avail } = await supabase
      .from('h_availability')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .eq('is_available', false)

    setReservations((data as Reservation[]) || [])
    setBlocked(new Set((avail || []).map((a: { date: string }) => a.date)))
    setLoading(false)
  }

  async function toggleBlock(dateStr: string) {
    if (blocked.has(dateStr)) {
      await supabase.from('h_availability').delete().eq('date', dateStr)
      setBlocked((prev) => { const n = new Set(prev); n.delete(dateStr); return n })
    } else {
      await supabase.from('h_availability').upsert({ date: dateStr, is_available: false, property_id: null, room_id: null })
      setBlocked((prev) => new Set([...prev, dateStr]))
    }
  }

  const daysCount = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getReservationsForDay(day: number): Reservation[] {
    const dateStr = getDateStr(day)
    return reservations.filter((r) => {
      const ci = new Date(r.check_in)
      const co = new Date(r.check_out)
      const d = new Date(dateStr)
      return d >= ci && d < co
    })
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink font-light">Calendar</h1>
          <p className="text-sm text-ink-muted font-sans mt-1">Disponibilitate și rezervări</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-sans">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-100 border border-emerald-200 inline-block" /> Rezervat</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-50 border border-red-200 inline-block" /> Blocat</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border">
        {/* Month nav */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 hover:bg-sand transition-colors rounded">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="font-serif text-xl text-ink font-light">
            {MONTHS_RO[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1 hover:bg-sand transition-colors rounded">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12l4-4-4-4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS_RO.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] uppercase tracking-widest text-ink-muted font-sans font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-border min-h-[80px] bg-sand/40" />
          ))}
          {Array.from({ length: daysCount }, (_, i) => {
            const day = i + 1
            const dateStr = getDateStr(day)
            const isToday = dateStr === todayStr
            const isPast = dateStr < todayStr
            const isBlocked = blocked.has(dateStr)
            const dayReservations = getReservationsForDay(day)
            const hasReservation = dayReservations.length > 0

            return (
              <div
                key={day}
                className={`border-b border-r border-border min-h-[80px] p-2 relative transition-colors duration-150
                  ${hasReservation ? 'bg-emerald-50' : ''}
                  ${isBlocked && !hasReservation ? 'bg-red-50' : ''}
                  ${isPast ? 'opacity-50' : ''}
                  ${!isPast && !hasReservation ? 'hover:bg-sand/60 cursor-pointer' : ''}`}
                onClick={() => !isPast && !hasReservation && toggleBlock(dateStr)}
              >
                <span className={`text-sm font-sans font-medium inline-flex items-center justify-center w-6 h-6
                  ${isToday ? 'bg-slate text-white rounded-full' : 'text-ink'}`}>
                  {day}
                </span>
                {dayReservations.map((r, idx) => (
                  <div key={r.id} className="mt-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-sans truncate">
                    {r.guest_name.split(' ')[0]} · {r.code.split('-').pop()}
                  </div>
                ))}
                {isBlocked && !hasReservation && (
                  <div className="mt-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-sans border border-red-200">
                    Blocat
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted font-sans">
        Click pe o zi liberă pentru a o bloca sau debloca.
      </p>
    </div>
  )
}
