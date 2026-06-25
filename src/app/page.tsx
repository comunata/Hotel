import Link from 'next/link'
import Image from 'next/image'
import ExperiencePlanner from '@/components/ExperiencePlanner'

const MOOD = [
  {
    title: 'Cafea pe terasă la răsărit',
    time: '07:00',
    src: '/images/poiana/FB_IMG_1782372639460.jpg',
  },
  {
    title: 'Liniște în natură',
    time: '11:00',
    src: '/images/poiana/FB_IMG_1782372624528.jpg',
  },
  {
    title: 'Confort cald în interior',
    time: '14:00',
    src: '/images/poiana/FB_IMG_1782372651713.jpg',
  },
  {
    title: 'Seară relaxantă',
    time: '19:00',
    src: '/images/poiana/FB_IMG_1782372655006.jpg',
  },
  {
    title: 'Dimineață fără grabă',
    time: '09:00',
    src: '/images/poiana/FB_IMG_1782372630817.jpg',
  },
]

export default function HomePage() {
  return (
    <main className="bg-sand min-h-screen">
      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-medium text-ink tracking-wide">
            Poiana Salcâmilor
          </span>
          <span className="hidden md:block text-border text-xs">·</span>
          <span className="hidden md:block text-xs text-ink-muted font-sans tracking-wide">
            Negrești, Vaslui
          </span>
        </div>
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="#experienta" className="hidden md:block nav-link">
            Experiența
          </Link>
          <Link href="#locatie" className="hidden md:block nav-link">
            Locație
          </Link>
          <Link href="/portal/lookup" className="hidden md:block nav-link">
            Rezervarea mea
          </Link>
          <Link href="/rezervare" className="btn-primary text-xs px-5 py-2.5">
            Verifică disponibilitatea
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] overflow-hidden">
        {/* Left — content */}
        <div className="relative z-10 flex flex-col justify-end pb-16 lg:pb-24 px-6 md:px-12 lg:pl-20 lg:pr-12 bg-sand">
          <div className="max-w-xl">
            <span className="eyebrow">Negrești · Vaslui · România</span>
            <h1 className="mt-5 font-serif font-light text-ink leading-[0.9] text-[clamp(3.5rem,7vw,6.5rem)] tracking-[-0.02em]">
              Două nopți<br />
              <em className="not-italic text-gold">de liniște.</em>
            </h1>
            <p className="mt-7 text-ink-muted text-base leading-relaxed font-sans max-w-sm">
              Poiana Salcâmilor — o proprietate ascunsă în inima naturii,
              unde liniștea se simte din primul pas pe prăzniță.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/rezervare" className="btn-primary">
                Verifică disponibilitatea
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#experienta" className="btn-ghost self-start sm:self-center">
                Planifică experiența
              </a>
            </div>
            <div className="mt-14 flex items-center gap-6 text-[11px] text-ink-muted font-sans tracking-wide">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Disponibil pentru rezervări
              </span>
              <span>Confirmare în 24h</span>
            </div>
          </div>
        </div>

        {/* Right — hero photo: cabana noaptea cu zapada */}
        <div className="absolute inset-0 lg:relative lg:inset-auto opacity-25 lg:opacity-100">
          <div className="relative w-full h-full">
            <Image
              src="/images/poiana/FB_IMG_1782372660467.jpg"
              alt="Poiana Salcâmilor noaptea"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sand via-transparent to-transparent lg:from-transparent hidden lg:block" />
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─────────────────────────────────────────────────────── */}
      <div className="section-padding py-8 flex items-center gap-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium font-sans">
          BaecoDigital Smart Hospitality
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ─── MOOD SECTION ────────────────────────────────────────────────── */}
      <section id="experienta" className="py-16 lg:py-24">
        <div className="section-padding mb-10">
          <span className="eyebrow">Atmosfera</span>
          <h2 className="mt-4 section-title">
            Cum se simte<br />un weekend aici.
          </h2>
        </div>

        <div className="section-padding overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
            {MOOD.map((item, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-60 h-[340px] overflow-hidden group cursor-default"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate/80 via-slate/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="text-white/50 text-[10px] font-mono mb-2">{item.time}</span>
                  <p className="text-white text-base font-serif font-light leading-snug">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE PLANNER ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-slate text-white">
        <div className="section-padding">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium font-sans">
              Planificator Experiență
            </span>
            <h2 className="mt-4 font-serif font-light text-display-sm leading-[0.95]">
              Construiește-ți<br />
              <em className="not-italic text-gold">experiența.</em>
            </h2>
            <p className="mt-5 text-white/60 font-sans text-base leading-relaxed">
              Răspunde la câteva întrebări și îți recomandăm experiența perfectă
              pentru tine — inclusiv extras-urile care fac diferența.
            </p>
          </div>
          <ExperiencePlanner />
        </div>
      </section>

      {/* ─── PROPERTY DETAILS ────────────────────────────────────────────── */}
      <section id="locatie" className="py-16 lg:py-24">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="eyebrow">Despre proprietate</span>
              <h2 className="mt-4 section-title">
                O oază de<br />liniște autentică.
              </h2>
              <p className="mt-6 text-ink-muted leading-relaxed font-sans">
                Ascunsă în inima naturii din zona Negrești, Vaslui, Poiana Salcâmilor
                este mai mult decât un loc de cazare. Este locul unde telefonul
                poate rămâne în geantă, unde apusul devine evenimentul serii și
                unde dimineața nu are orar.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: 'Capacitate', value: 'până la 8 persoane' },
                  { label: 'Ciubăr', value: 'disponibil la cerere' },
                  { label: 'Grătar', value: 'zonă privată exterioară' },
                  { label: 'Parcare', value: 'privată, gratuită' },
                ].map((item) => (
                  <div key={item.label} className="border-l-2 border-gold pl-4 py-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">{item.label}</p>
                    <p className="text-sm font-medium text-ink font-sans mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              <Link href="/rezervare" className="btn-primary mt-10 inline-flex">
                Rezervă o experiență
              </Link>
            </div>

            {/* Property exterior photo */}
            <div className="relative h-[420px] lg:h-[520px] overflow-hidden">
              <Image
                src="/images/poiana/FB_IMG_1782372648611.jpg"
                alt="Cabana Poiana Salcâmilor exterior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY STRIP ───────────────────────────────────────────────── */}
      <section className="py-4">
        <div className="grid grid-cols-4 gap-1">
          {[
            '/images/poiana/FB_IMG_1782372636613.jpg',
            '/images/poiana/FB_IMG_1782372641971.jpg',
            '/images/poiana/FB_IMG_1782372657747.jpg',
            '/images/poiana/FB_IMG_1782372666396.jpg',
          ].map((src, i) => (
            <div key={i} className="relative h-40 overflow-hidden group">
              <Image
                src={src}
                alt={`Poiana Salcâmilor ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── MULTI-LOCATION PREVIEW ──────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-y border-border">
        <div className="section-padding">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <span className="eyebrow">Locații</span>
              <h2 className="mt-3 font-serif text-heading text-ink font-light">
                Familia Poiana Salcâmilor
              </h2>
            </div>
            <p className="text-sm text-ink-muted font-sans max-w-xs leading-relaxed">
              Același standard, aceeași liniște.<br />Alege locația care ți se potrivește.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Poiana Salcâmilor', tag: 'Original', status: 'Disponibil', desc: 'Locația originală. Pădure, liniște, ciubăr.' },
              { name: 'Poiana Salcâmilor Lake View', tag: 'Nou', status: 'În curând', desc: 'Aceeași liniște, cu vedere la lac.' },
              { name: 'Poiana Salcâmilor Resort', tag: 'Proiect', status: 'Planificat 2027', desc: 'Experiența completă: spa, restaurant, cabane.' },
            ].map((loc) => (
              <div key={loc.name} className="border border-border p-5 group hover:border-gold transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-sans">{loc.tag}</span>
                  <span className={`text-[10px] font-sans px-2 py-0.5 ${loc.status === 'Disponibil' ? 'bg-emerald-50 text-emerald-700' : 'bg-sand text-ink-muted'}`}>
                    {loc.status}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-ink leading-snug">{loc.name}</h3>
                <p className="mt-2 text-sm text-ink-muted font-sans leading-relaxed">{loc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 text-center section-padding">
        <span className="eyebrow">Rezervă acum</span>
        <h2 className="mt-5 font-serif font-light text-ink leading-[0.92] text-[clamp(3rem,6vw,5.5rem)] tracking-[-0.02em]">
          Ești gata pentru<br />
          <em className="not-italic text-gold">liniștea asta?</em>
        </h2>
        <p className="mt-6 text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
          Verifică disponibilitatea și rezervă weekendul tău perfect.
          Confirmare în mai puțin de 24 de ore.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/rezervare" className="btn-gold">
            Verifică disponibilitatea
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="#experienta" className="btn-outline">
            Planifică experiența
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 section-padding">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="font-serif text-lg font-medium text-ink">Poiana Salcâmilor</span>
            <p className="text-xs text-ink-muted font-sans mt-1">Negrești, Vaslui, România</p>
            <a href="mailto:contact@poianasalcamilor.ro" className="text-xs text-ink-muted font-sans mt-0.5 block hover:text-gold transition-colors">
              contact@poianasalcamilor.ro
            </a>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm font-sans">
            <Link href="/rezervare" className="nav-link">Rezervare</Link>
            <Link href="/portal/lookup" className="nav-link">Portal client</Link>
            <Link href="/admin" className="nav-link text-ink-muted/50">Admin</Link>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink-muted/60 font-sans tracking-wide uppercase">
              Powered by
            </p>
            <p className="text-xs font-medium text-ink-muted font-sans">
              BaecoDigital Smart Hospitality
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
