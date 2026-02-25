'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const FIRM_NAME = 'POTUPARTNERS';
const TAGLINE   = 'Excellence Without Compromise';

export default function HeroSection() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  // 0 = waiting, 1 = letters animate, 2 = tagline fades, 3 = full visible

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 200 + FIRM_NAME.length * 70 + 200);
    const t3 = setTimeout(() => setPhase(3), 200 + FIRM_NAME.length * 70 + 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grain-overlay bg-black"
    >
      {/* Radial gold glow from top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,167,94,0.09) 0%, transparent 70%)',
        }}
      />

      {/* Vertical decorative lines */}
      <div
        className="absolute left-8 top-0 bottom-0 w-px pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(198,167,94,0.15) 30%, rgba(198,167,94,0.15) 70%, transparent 100%)' }}
      />
      <div
        className="absolute right-8 top-0 bottom-0 w-px pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(198,167,94,0.15) 30%, rgba(198,167,94,0.15) 70%, transparent 100%)' }}
      />

      {/* Center content */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center">

        {/* Firm name — letter by letter */}
        <h1
          className="font-serif font-light tracking-[0.3em] text-text-primary select-none mb-2"
          style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)' }}
          aria-label="PotuPartners"
        >
          {FIRM_NAME.split('').map((char, i) => (
            <span
              key={i}
              className="letter-animate inline-block"
              style={{
                animationDelay: phase >= 1 ? `${i * 70}ms` : '9999s',
                opacity: phase < 1 ? 0 : undefined,
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Gold line draw */}
        <div
          className="relative overflow-hidden mb-8"
          style={{ height: '2px', width: 'clamp(120px, 30vw, 320px)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, #C6A75E, #D4AF37, #C6A75E, transparent)',
              transform: phase >= 2 ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '0.1s',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          className="font-sans text-[0.7rem] tracking-[0.4em] uppercase text-gold-light font-light mb-3"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {TAGLINE}
        </p>

        {/* Sub tagline */}
        <p
          className="font-serif italic text-text-secondary text-lg md:text-xl font-light max-w-xl mt-4 leading-relaxed"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          }}
        >
          Trusted counsel for matters that define legacies.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
          }}
        >
          <button
            onClick={() => scrollToSection('services')}
            className="btn-gold btn-gold-fill px-10"
          >
            <span>Our Services</span>
          </button>
          <button
            onClick={() => scrollToSection('partners')}
            className="btn-gold px-10"
          >
            <span>Meet the Partners</span>
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-20 flex flex-col items-center gap-2"
          style={{
            opacity: phase >= 3 ? 0.5 : 0,
            transition: 'opacity 1s ease 1s',
          }}
        >
          <span className="text-[0.6rem] tracking-[0.3em] uppercase text-text-muted">Scroll</span>
          <ChevronDown
            size={14}
            className="text-gold animate-bounce"
          />
        </div>
      </div>

      {/* Corner brackets — decorative */}
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
        <CornerBracket key={pos} position={pos} visible={phase >= 3} />
      ))}
    </section>
  );
}

function CornerBracket({
  position,
  visible,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible: boolean;
}) {
  const isTop    = position.startsWith('top');
  const isLeft   = position.endsWith('left');

  return (
    <div
      className={`absolute ${isTop ? 'top-8' : 'bottom-8'} ${isLeft ? 'left-8' : 'right-8'} w-6 h-6 pointer-events-none hidden md:block`}
      style={{
        borderTop:    isTop    ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderBottom: !isTop   ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderLeft:   isLeft   ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderRight:  !isLeft  ? '1px solid rgba(198,167,94,0.3)' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.8s',
      }}
    />
  );
}
