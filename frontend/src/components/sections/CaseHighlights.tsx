'use client';

import { useRef } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CASES = [
  {
    id: 1,
    area:       'Corporate Litigation',
    title:      'Preservation of Controlling Interest',
    outcome:    'Full defense verdict. Shareholder claims dismissed with prejudice.',
    year:       '2023',
    duration:   '14 months',
    badge:      'Victory',
    badgeColor: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/5',
    summary:    'Represented a principal shareholder in a multi-party derivative action challenging board resolutions. Secured dismissal at the appellate level.',
  },
  {
    id: 2,
    area:       'Mergers & Acquisitions',
    title:      'Cross-Border Acquisition Defense',
    outcome:    'Transaction completed. Regulatory clearance obtained in 4 jurisdictions.',
    year:       '2023',
    duration:   '9 months',
    badge:      'Completed',
    badgeColor: 'text-gold border-gold/40 bg-gold/5',
    summary:    'Advised acquiring entity on a $420M cross-border transaction involving regulatory submissions to financial authorities across multiple jurisdictions.',
  },
  {
    id: 3,
    area:       'Arbitration',
    title:      'International Commercial Dispute',
    outcome:    '$18M award in favour of client. Enforcement confirmed.',
    year:       '2022',
    duration:   '22 months',
    badge:      'Award Won',
    badgeColor: 'text-gold border-gold/40 bg-gold/5',
    summary:    'Lead counsel in ICC arbitration proceedings arising from a breach of a distribution agreement. Full quantum awarded with enforcement confirmed across two jurisdictions.',
  },
  {
    id: 4,
    area:       'Regulatory Affairs',
    title:      'Licensing Reinstatement',
    outcome:    'License reinstated. Operations resumed within 60 days.',
    year:       '2022',
    duration:   '4 months',
    badge:      'Resolved',
    badgeColor: 'text-sky-400 border-sky-400/40 bg-sky-400/5',
    summary:    'Successfully challenged a regulatory authority\'s revocation order through administrative appeal, establishing precedent for due process rights in licensing proceedings.',
  },
  {
    id: 5,
    area:       'Real Estate',
    title:      'Landmark Property Portfolio Restructure',
    outcome:    'Restructuring approved. Debt extinguished by 62%.',
    year:       '2021',
    duration:   '11 months',
    badge:      'Completed',
    badgeColor: 'text-gold border-gold/40 bg-gold/5',
    summary:    'Advised a real estate holding entity on the restructuring of a distressed portfolio of commercial properties, negotiating creditor agreements and securing court approval.',
  },
  {
    id: 6,
    area:       'Constitutional Law',
    title:      'Freedom of Expression Challenge',
    outcome:    'Regulatory provision declared unconstitutional.',
    year:       '2021',
    duration:   '18 months',
    badge:      'Landmark',
    badgeColor: 'text-purple-400 border-purple-400/40 bg-purple-400/5',
    summary:    'Brought constitutional challenge on behalf of a media consortium against censorship provisions. High Court ruling established binding precedent.',
  },
];

export default function CasesSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="cases" className="py-32 md:py-44 bg-surface relative overflow-hidden">

      <div className="absolute right-0 top-0 section-number">IV</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14`}
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-10 bg-gold opacity-60" />
              <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
                04 — Case Highlights
              </span>
            </div>
            <h2
              className="font-serif font-light text-text-primary leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              A record defined by{' '}
              <span className="italic text-gold">decisive results.</span>
            </h2>
            <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-lg leading-relaxed">
              The following highlights represent a selection of matters handled across our practice areas.
              All identifying details have been anonymised.
            </p>
          </div>

          {/* Scroll controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 border border-divider text-text-secondary hover:text-gold hover:border-gold-dim transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 border border-divider text-text-secondary hover:text-gold hover:border-gold-dim transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal scrolling carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto horizontal-scroll pb-6 -mx-6 px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {CASES.map((c, i) => (
            <div
              key={c.id}
              className="flex-shrink-0 w-80 md:w-96 card p-8 group cursor-default"
              style={{ scrollSnapAlign: 'start', animationDelay: `${i * 60}ms` }}
            >
              {/* Area + year */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gold opacity-70 font-sans">
                  {c.area}
                </span>
                <span className="text-[0.6rem] text-text-muted font-sans">{c.year}</span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg font-light text-text-primary mb-4 leading-snug">
                {c.title}
              </h3>

              {/* Summary */}
              <p className="font-sans text-xs text-text-secondary font-light leading-relaxed mb-6">
                {c.summary}
              </p>

              {/* Gold divider */}
              <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, rgba(198,167,94,0.3), transparent)' }} />

              {/* Outcome */}
              <p className="font-sans text-xs text-text-secondary font-light mb-5 leading-relaxed">
                <span className="text-gold font-medium">Outcome:</span>{' '}
                {c.outcome}
              </p>

              {/* Footer row */}
              <div className="flex items-center justify-between">
                <span className={`badge-gold text-[0.6rem] ${c.badgeColor}`}>
                  {c.badge}
                </span>
                <span className="text-[0.65rem] text-text-muted font-sans">
                  Duration: {c.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="font-sans text-[0.65rem] text-text-muted font-light mt-8 leading-relaxed">
          * All case details have been anonymised to protect client confidentiality. Past results do not guarantee future outcomes.
        </p>

      </div>
    </section>
  );
}
