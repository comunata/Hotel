import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Poiana Salcâmilor — Negrești, Vaslui',
    template: '%s | Poiana Salcâmilor',
  },
  description: 'Două nopți de liniște. O proprietate ascunsă în inima naturii, unde liniștea se simte din primul moment.',
  keywords: ['cazare', 'pensiune', 'vacanță', 'Negrești', 'Vaslui', 'natură', 'ciubăr', 'relaxare'],
  authors: [{ name: 'BaecoDigital' }],
  creator: 'BaecoDigital',
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    title: 'Poiana Salcâmilor',
    description: 'Două nopți de liniște. Negrești, Vaslui.',
    siteName: 'Poiana Salcâmilor',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Poiana S.',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E293B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-sand antialiased">{children}</body>
    </html>
  )
}
