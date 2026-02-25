'use client';

import { useReveal } from '@/hooks/useReveal';

const STATS = [
  { value: '28+', label: 'Years of Practice' },
  { value: '400+', label: 'Cases Won' },
  { value: '12',   label: 'Senior Partners' },
  { value: '6',    label: 'Practice Areas' },
];

export default function AboutSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: bodyRef, visible: bodyV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const { ref: statsRef, visible: statsV } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="about" className="py-32 md:py-44 bg-black relative overflow-hidden">

      <div className="absolute right-0 top-0 section-number">III</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              03 — About Our Office
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Where tradition meets{' '}
            <span className="italic text-gold">modern practice.</span>
          </h2>
        </div>

        {/* Main content grid */}
        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mb-24"
        >
          {/* Text column — 3 cols */}
          <div className={`reveal ${bodyV ? 'visible' : ''} lg:col-span-3 space-y-6`}>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              Founded in the tradition of rigorous legal excellence, PotuPartners has grown into
              a premier institution serving clients across complex commercial, corporate, and
              constitutional matters. Our practice is defined not by volume, but by the calibre of
              counsel we bring to every engagement.
            </p>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              Our offices are designed as a reflection of our practice: precise, considered,
              and uncompromising in quality. Every aspect of the environment — from our
              secure consultation suites to our extensive legal research library — is
              purpose-built to support the highest-stakes legal work.
            </p>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              We operate on a strict mandate of client confidentiality. Matters handled within
              our walls remain within our walls. This commitment to discretion is not merely
              policy — it is the foundation on which trusted relationships are built.
            </p>

            {/* CTA text link */}
            <div className="pt-4">
              <a href="#partners" className="inline-flex items-center gap-3 group">
                <span className="text-gold text-sm tracking-[0.1em] font-sans">
                  Meet Our Partners
                </span>
                <div className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-14" />
              </a>
            </div>
          </div>

          {/* Image / visual column — 2 cols */}
          <div className={`reveal-right ${bodyV ? 'visible' : ''} lg:col-span-2`}>
            {/* Placeholder for office imagery */}
            <div
              className="relative h-80 lg:h-full min-h-64 border border-divider overflow-hidden group"
            >
              {/* Layered gradient — evokes a prestigious interior */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(198,167,94,0.03) 0%,
                      rgba(0,0,0,0.7) 40%,
                      rgba(20,20,20,0.9) 100%
                    )
                  `,
                }}
              />
              {/* Abstract architectural lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
              >
                <line x1="0" y1="300" x2="400" y2="0"   stroke="#C6A75E" strokeWidth="0.5"/>
                <line x1="50" y1="300" x2="400" y2="50"  stroke="#C6A75E" strokeWidth="0.5"/>
                <line x1="0" y1="200" x2="300" y2="0"   stroke="#C6A75E" strokeWidth="0.5"/>
                <rect x="60" y="50" width="280" height="200" fill="none" stroke="#C6A75E" strokeWidth="0.5"/>
                <rect x="80" y="70" width="240" height="160" fill="none" stroke="#C6A75E" strokeWidth="0.3"/>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-serif text-5xl font-light text-gold opacity-20 select-none">
                  PP
                </div>
                <div className="h-px w-16 bg-gold opacity-20 mt-3" />
                <p className="text-text-muted text-xs tracking-[0.3em] uppercase mt-3 font-sans">
                  Est. Founded
                </p>
              </div>

              {/* Hover reveal */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="font-sans text-xs text-text-secondary font-light">
                  One Commerce Square, 18th Floor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-divider"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`reveal ${statsV ? 'visible' : ''} p-8 md:p-10 text-center border-r border-b md:border-b-0 border-divider last:border-r-0 even:border-r-0 md:even:border-r relative overflow-hidden group hover:bg-surface-2 transition-colors duration-300`}
              style={{ transitionDelay: statsV ? `${i * 80}ms` : '0ms' }}
            >
              <div className="font-serif font-light text-gold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {s.value}
              </div>
              <div className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-text-muted font-light">
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
