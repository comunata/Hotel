import Link from 'next/link'

const PROPERTY = {
  name: 'Poiana Salcâmilor',
  address: 'Negrești, Vaslui, România',
  phone: '+40 700 000 000',
  email: 'contact@poianasalcamilor.ro',
  googleMapsUrl: 'https://maps.google.com',
  arrivalTime: 'Check-in de la ora 15:00',
  departureTime: 'Check-out până la ora 12:00',
  wifi: 'PoianaSalcamilor2026',
  wifiPass: 'cazare@2026',
  rules: [
    'Fumatul este permis doar în spațiile exterioare desemnate.',
    'Animalele de companie sunt permise cu acordul prealabil.',
    'Muzica după ora 23:00 se reduce la volum mic.',
    'Gunoiul se separă în containere colorate la intrare.',
    'Accesul în proprietate este permis cu codul de rezervare.',
  ],
  recommendations: [
    { name: 'Pădurea Humosu', distance: '3 km', type: 'Natură' },
    { name: 'Lacul Roșu Negrești', distance: '5 km', type: 'Activitate' },
    { name: 'Restaurant Moldova', distance: '2 km', type: 'Mâncare' },
    { name: 'Piața Agroalimentară Negrești', distance: '1 km', type: 'Cumpărături' },
  ],
  arrivalInstructions: [
    'Pe DN24 spre Negrești.',
    'La intrarea în Negrești, la prima intersecție cu semafor, virați stânga.',
    'Urmați 2 km pe drumul neasfaltat.',
    'Proprietatea este semnalizată cu panoul „Poiana Salcâmilor".',
    'Apelați la sosire: +40 700 000 000.',
  ],
}

export default function ConciergePage({ params }: { params: { code: string } }) {
  return (
    <div className="min-h-screen bg-sand">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="section-padding py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-base text-ink hover:text-gold transition-colors">
            Poiana Salcâmilor
          </Link>
          <Link href={`/portal/${params.code}`} className="text-xs text-ink-muted font-sans hover:text-ink transition-colors">
            ← Rezervarea mea
          </Link>
        </div>
      </nav>

      <div className="section-padding py-12 max-w-2xl">
        <span className="eyebrow">Digital Concierge</span>
        <h1 className="mt-3 font-serif text-display-sm font-light text-ink">
          Tot ce ai nevoie<br />pentru sosire.
        </h1>
        <p className="mt-3 text-ink-muted font-sans text-sm">
          Cod rezervare: <span className="font-mono font-bold text-slate">{params.code}</span>
        </p>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <a
            href={PROPERTY.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-border p-5 hover:border-gold transition-colors duration-200 group"
          >
            <div className="text-gold text-xl mb-2">◉</div>
            <p className="font-medium text-ink font-sans text-sm">Google Maps</p>
            <p className="text-xs text-ink-muted font-sans mt-0.5">Deschide navigarea</p>
          </a>
          <a
            href={`tel:${PROPERTY.phone}`}
            className="bg-white border border-border p-5 hover:border-gold transition-colors duration-200"
          >
            <div className="text-gold text-xl mb-2">◎</div>
            <p className="font-medium text-ink font-sans text-sm">Telefon proprietar</p>
            <p className="text-xs text-ink-muted font-sans mt-0.5">{PROPERTY.phone}</p>
          </a>
          <div className="bg-white border border-border p-5">
            <div className="text-gold text-xl mb-2">◈</div>
            <p className="font-medium text-ink font-sans text-sm">Check-in</p>
            <p className="text-xs text-ink-muted font-sans mt-0.5">{PROPERTY.arrivalTime}</p>
          </div>
          <div className="bg-white border border-border p-5">
            <div className="text-gold text-xl mb-2">◇</div>
            <p className="font-medium text-ink font-sans text-sm">Check-out</p>
            <p className="text-xs text-ink-muted font-sans mt-0.5">{PROPERTY.departureTime}</p>
          </div>
        </div>

        {/* WiFi */}
        <div className="mt-4 bg-slate text-white p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50 font-sans mb-1">WiFi</p>
            <p className="font-medium font-sans text-sm">{PROPERTY.wifi}</p>
            <p className="font-mono text-gold text-sm mt-0.5">{PROPERTY.wifiPass}</p>
          </div>
          <span className="text-white/30 text-2xl">⌘</span>
        </div>

        {/* Arrival instructions */}
        <div className="mt-8">
          <h2 className="font-serif text-xl text-ink font-light mb-4">Cum ajungi</h2>
          <div className="bg-white border border-border divide-y divide-border">
            {PROPERTY.arrivalInstructions.map((step, i) => (
              <div key={i} className="p-4 flex items-start gap-4">
                <span className="w-6 h-6 border border-border text-xs font-medium text-ink-muted font-sans flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-ink font-sans leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="mt-8">
          <h2 className="font-serif text-xl text-ink font-light mb-4">Regulile locației</h2>
          <div className="bg-white border border-border divide-y divide-border">
            {PROPERTY.rules.map((rule, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <span className="text-gold text-xs mt-0.5">◦</span>
                <p className="text-sm text-ink font-sans leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Local recommendations */}
        <div className="mt-8">
          <h2 className="font-serif text-xl text-ink font-light mb-4">Recomandări locale</h2>
          <div className="grid grid-cols-2 gap-3">
            {PROPERTY.recommendations.map((rec) => (
              <div key={rec.name} className="bg-white border border-border p-4">
                <span className="text-[10px] uppercase tracking-widest text-gold font-sans">{rec.type}</span>
                <p className="font-medium text-ink font-sans text-sm mt-1">{rec.name}</p>
                <p className="text-xs text-ink-muted font-sans mt-0.5">{rec.distance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency contact */}
        <div className="mt-8 border border-gold/30 bg-gold/5 p-5">
          <p className="text-xs uppercase tracking-widest text-gold font-sans mb-2">Contact proprietar</p>
          <a href={`tel:${PROPERTY.phone}`} className="font-medium text-ink font-sans block hover:text-gold transition-colors">{PROPERTY.phone}</a>
          <a href={`mailto:${PROPERTY.email}`} className="text-sm text-ink-muted font-sans mt-0.5 block hover:text-gold transition-colors">{PROPERTY.email}</a>
          <p className="text-sm text-ink-muted font-sans mt-1">
            Disponibil zilnic, 08:00 – 22:00
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-ink-muted/60 font-sans">BaecoDigital Smart Hospitality — Digital Concierge</p>
        </div>
      </div>
    </div>
  )
}
