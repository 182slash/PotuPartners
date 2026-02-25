import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-divider">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-divider">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <div className="font-serif text-2xl font-light tracking-widest text-text-primary" style={{ letterSpacing: '0.2em' }}>
                POTU
              </div>
              <div className="font-serif text-[0.6rem] tracking-[0.5em] text-gold font-light mt-0.5">
                PARTNERS
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed font-light">
              Premier legal counsel delivered with integrity, discretion, and uncompromising excellence.
            </p>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Practice Areas
            </h4>
            <ul className="space-y-3">
              {['Corporate Law', 'Litigation', 'Mergers & Acquisitions', 'Arbitration', 'Regulatory Affairs', 'Real Estate'].map(item => (
                <li key={item}>
                  <a href="#services" className="text-text-secondary text-sm hover:text-gold transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Vision',       href: '#vision' },
                { label: 'Our Mission',  href: '#mission' },
                { label: 'About Office', href: '#about' },
                { label: 'Case Highlights', href: '#cases' },
                { label: 'Our Partners', href: '#partners' },
              ].map(item => (
                <li key={item.href}>
                  <a href={item.href} className="text-text-secondary text-sm hover:text-gold transition-colors duration-200">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary text-sm leading-relaxed">
                  One Commerce Square, 18th Floor<br />
                  City Centre, Metro District
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <a href="tel:+10000000000" className="text-text-secondary text-sm hover:text-gold transition-colors">
                  +1 (000) 000-0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <a href="mailto:counsel@potupartners.site" className="text-text-secondary text-sm hover:text-gold transition-colors">
                  counsel@potupartners.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs tracking-wide">
            © {year} PotuPartners. All rights reserved. Attorney advertising.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Disclaimer
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
