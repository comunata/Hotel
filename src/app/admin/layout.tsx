'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/rezervari', label: 'Rezervări', icon: '◉' },
  { href: '/admin/clienti', label: 'Clienți CRM', icon: '◎' },
  { href: '/admin/calendar', label: 'Calendar', icon: '◇' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-sand flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-slate flex-shrink-0 flex flex-col transition-all duration-300 sticky top-0 h-screen`}>
        <div className={`flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-5'} py-5 border-b border-white/10`}>
          {!collapsed && (
            <div>
              <p className="text-white font-serif text-sm font-medium leading-tight">Poiana Salcâmilor</p>
              <p className="text-white/40 text-[10px] font-sans mt-0.5 uppercase tracking-widest">Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans transition-all duration-150
                  ${active
                    ? 'bg-gold/20 text-gold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={`p-3 border-t border-white/10`}>
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 text-xs text-white/30 hover:text-white/60 font-sans transition-colors`}
          >
            <span>↗</span>
            {!collapsed && <span>Vezi site-ul</span>}
          </Link>
        </div>

        {!collapsed && (
          <div className="p-4 border-t border-white/10">
            <p className="text-[10px] text-white/20 font-sans">BaecoDigital Smart Hospitality</p>
            <p className="text-[10px] text-white/20 font-sans">v1.0 · 2026</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto admin-scroll">
        {children}
      </main>
    </div>
  )
}
