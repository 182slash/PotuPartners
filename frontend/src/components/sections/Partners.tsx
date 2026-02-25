'use client';

import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { Linkedin, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const PARTNERS = [
  {
    id: '1',
    fullName:  'Adriana M. Potu',
    title:     'Founding & Managing Partner',
    specialty: 'Corporate Litigation · Arbitration',
    avatarUrl: null,
    bio:       'Adriana has led the firm through landmark arbitration victories and high-stakes corporate litigation over a career spanning three decades. Called to the bar in two jurisdictions, she is recognised as a leading practitioner by independent legal directories.',
    linkedinUrl: '#',
  },
  {
    id: '2',
    fullName:  'Dr. Edmund F. Kessler',
    title:     'Senior Partner',
    specialty: 'Mergers & Acquisitions · Regulatory',
    avatarUrl: null,
    bio:       'Edmund brings deep expertise in cross-border transactions and regulatory compliance, advising some of the continent\'s largest private equity groups and sovereign wealth funds on their most complex mandates.',
    linkedinUrl: '#',
  },
  {
    id: '3',
    fullName:  'Nkechi O. Adeyemi',
    title:     'Partner',
    specialty: 'Constitutional Law · Civil Rights',
    avatarUrl: null,
    bio:       'Nkechi has established herself as a formidable voice in constitutional litigation, with several landmark decisions to her name. Her practice focuses on matters that shape institutional accountability and individual rights.',
    linkedinUrl: '#',
  },
  {
    id: '4',
    fullName:  'Jonathan S. Hargreaves',
    title:     'Partner',
    specialty: 'Real Estate · Restructuring',
    avatarUrl: null,
    bio:       'Jonathan advises on the full spectrum of real estate transactions, from development financing to complex portfolio restructurings. His clients include institutional investors, developers, and lenders across multiple jurisdictions.',
    linkedinUrl: '#',
  },
];

export default function PartnersSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = PARTNERS.find(p => p.id === activeId);

  return (
    <section id="partners" className="py-32 md:py-44 bg-black relative overflow-hidden">

      <div className="absolute right-0 top-0 section-number">V</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              05 — Our Partners
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Counsel you can{' '}
            <span className="italic text-gold">count on.</span>
          </h2>
          <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-lg leading-relaxed">
            Our partners are practitioners of the highest order. Hover to learn more.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {PARTNERS.map((p, i) => (
            <div
              key={p.id}
              className={`reveal ${gridV ? 'visible' : ''} partner-card group relative border border-divider bg-surface-2 cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold-dim hover:shadow-card-hover`}
              style={{ transitionDelay: gridV ? `${i * 80}ms` : '0ms' }}
              onClick={() => setActiveId(p.id)}
            >
              {/* Avatar */}
              <div className="relative h-56 bg-surface-3 overflow-hidden">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Abstract geometric placeholder */}
                    <div className="relative">
                      <div
                        className="w-20 h-20 border border-gold opacity-20 flex items-center justify-center"
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-light text-gold opacity-50 select-none">
                        {getInitials(p.fullName)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover overlay with bio */}
                <div className="bio-overlay absolute inset-0 bg-black/90 p-6 flex flex-col justify-end">
                  <p className="font-sans text-xs text-text-secondary font-light leading-relaxed">
                    {p.bio}
                  </p>
                  {p.linkedinUrl && (
                    <a
                      href={p.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Linkedin size={12} />
                      <span className="tracking-[0.1em] font-sans">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-serif text-base font-light text-text-primary mb-1 leading-snug">
                  {p.fullName}
                </h3>
                <p className="font-sans text-[0.65rem] tracking-[0.05em] text-gold opacity-70 mb-2">
                  {p.title}
                </p>
                <p className="font-sans text-[0.65rem] text-text-muted">
                  {p.specialty}
                </p>
              </div>

              {/* Bottom gold accent line */}
              <div
                className="h-px w-0 group-hover:w-full bg-gold transition-all duration-500"
                style={{ background: 'linear-gradient(90deg, #C6A75E, #D4AF37)' }}
              />
            </div>
          ))}
        </div>

      </div>

      {/* Full Bio Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative bg-surface border border-divider max-w-lg w-full p-8 md:p-12"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-text-muted hover:text-gold transition-colors"
              onClick={() => setActiveId(null)}
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="w-14 h-14 border border-divider flex items-center justify-center mb-5">
                <span className="font-serif text-xl font-light text-gold select-none">
                  {getInitials(active.fullName)}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-light text-text-primary mb-1">
                {active.fullName}
              </h2>
              <p className="font-sans text-[0.7rem] tracking-[0.1em] text-gold opacity-70 mb-1">
                {active.title}
              </p>
              <p className="font-sans text-[0.7rem] text-text-muted">
                {active.specialty}
              </p>
            </div>

            <div className="gold-rule mb-6" />

            <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-6">
              {active.bio}
            </p>

            {active.linkedinUrl && (
              <a
                href={active.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
              >
                <Linkedin size={14} />
                <span className="tracking-[0.1em] font-sans">View LinkedIn Profile</span>
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
