'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { href: '/admin/rezervari', label: 'Rezervări', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { href: '/admin/calendar', label: 'Timeline', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M2 5h12M2 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { href: '/admin/clienti', label: 'Clienți CRM', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 13c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M11 7l1.5 1.5L15 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: '#080808' }}>
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col sticky top-0 h-screen transition-all duration-300"
        style={{
          width: collapsed ? '56px' : '220px',
          background: '#0E0E0E',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between py-5 transition-all"
          style={{
            padding: collapsed ? '20px 16px' : '20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {!collapsed && (
            <div>
              <p className="font-serif text-sm leading-tight" style={{ color: '#E8E5E0' }}>
                Poiana Salcâmilor
              </p>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: '#3A3734' }}>
                Admin Panel
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="transition-colors duration-200 p-1 rounded"
            style={{ color: '#3A3734' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E8E5E0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#3A3734')}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 font-sans text-sm"
                style={{
                  background: active ? 'rgba(200,155,91,0.12)' : 'transparent',
                  color: active ? '#C89B5B' : '#4A4744',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#9A9490' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#4A4744' }}
              >
                <span className="flex-shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded font-sans text-xs transition-colors duration-150"
            style={{ color: '#2A2724' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4A4744')}
            onMouseLeave={e => (e.currentTarget.style.color = '#2A2724')}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M9 2h5v5M14 2L7 9M4 4H2v10h10v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && 'Vezi site-ul'}
          </Link>
          {!collapsed && (
            <p className="px-3 text-[10px] font-sans" style={{ color: '#2A2724' }}>
              BaecoDigital · v1.0
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto admin-scroll" style={{ background: '#080808' }}>
        {children}
      </main>
    </div>
  )
}
