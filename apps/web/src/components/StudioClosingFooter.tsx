import React from 'react';
import {
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react';

interface StudioClosingFooterProps {
  onOpenScheduler: () => void;
  onNavigateAbout?: () => void;
  onNavigateClients?: () => void;
  onNavigateWork?: () => void;
  onNavigateProcess?: () => void;
}

export const StudioClosingFooter: React.FC<StudioClosingFooterProps> = ({
  onOpenScheduler,
  onNavigateAbout,
  onNavigateClients,
  onNavigateWork,
  onNavigateProcess,
}) => {
  return (
    <div className="w-full flex flex-col bg-[#080809] text-white">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HERO: DUSK VILLA & READY TO DISCUSS (REFERENCE 4 TOP)  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full aspect-[16/10] sm:aspect-[21/9] min-h-[460px] sm:min-h-[520px] overflow-hidden bg-neutral-900 border-t border-b border-white/[0.08]">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=85"
          alt="Luxury architectural residence at dusk"
          className="w-full h-full object-cover object-center brightness-90 contrast-105"
        />

        {/* Left-weighted dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent flex items-center" />
        <div className="absolute inset-0 bg-black/25" />

        {/* Content Callout */}
        <div className="absolute inset-0 flex items-center px-6 sm:px-12 md:px-20 lg:px-28">
          <div className="max-w-xl space-y-4 sm:space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.08]">
              Ready to discuss<br />
              your next project?
            </h2>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-lg">
              If you need guidance on what kind of visuals or presentation tools your project requires, simply fill out the form below and tell us about your goals.
            </p>

            <div>
              <button
                onClick={onOpenScheduler}
                className="group inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-xl active:scale-95"
              >
                <span>Fill Out Form</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. BOTTOM DIRECTORY: GOT A PROJECT IN MIND? (REFERENCE 4 BOT) */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full pt-16 sm:pt-24 pb-12 px-6 sm:px-12 md:px-20 lg:px-28">
        <div className="w-full max-w-[1560px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/[0.08]">
            
            {/* Left Block: Got a project in mind? */}
            <div className="md:col-span-5 space-y-6">
              <h3 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
                Got a project<br />
                in mind?
              </h3>

              <div className="pt-2">
                <button
                  onClick={onOpenScheduler}
                  className="group inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/40 text-[14.4px] sm:text-[16.8px] font-medium tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span>Let's Talk</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Middle Columns: About, Services, Contact */}
            <div className="md:col-span-5 grid grid-cols-3 gap-6 sm:gap-8">
              
              {/* About Column */}
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  About
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li>
                    <button
                      onClick={onNavigateAbout}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateClients}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Clients
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateProcess}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Our Process
                    </button>
                  </li>
                </ul>
              </div>

              {/* Services Column */}
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  Services
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li>
                    <button
                      onClick={onNavigateWork}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Stills
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateWork}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Animation
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateWork}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      VR
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateWork}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      360 Panoramas
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Column */}
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  Contact
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li className="text-white/80">Accra, Ghana</li>
                  <li>
                    <a href="tel:+233200000000" className="hover:text-white transition-colors">
                      +233 20 000 0000
                    </a>
                  </li>
                  <li>
                    <a href="mailto:designforge25@gmail.com" className="hover:text-white transition-colors">
                      designforge25@gmail.com
                    </a>
                  </li>
                  <li className="pt-2">
                    <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer block text-[11px]">
                      Terms & Conditions
                    </span>
                  </li>
                  <li>
                    <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer block text-[11px]">
                      Privacy Policy
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Social Icons */}
            <div className="md:col-span-2 flex flex-row md:flex-col items-start md:items-end justify-start gap-3">
              {[
                { label: 'Instagram', icon: <Instagram className="w-4 h-4" />, href: 'https://instagram.com' },
                { label: 'Facebook', icon: <Facebook className="w-4 h-4" />, href: 'https://facebook.com' },
                { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, href: 'https://linkedin.com' },
                {
                  label: 'Behance',
                  icon: <span className="font-bold text-[11px] leading-none">Bē</span>,
                  href: 'https://behance.net',
                },
                { label: 'YouTube', icon: <Youtube className="w-4 h-4" />, href: 'https://youtube.com' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer hover:bg-white/5"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Sub-Footer Line */}
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] sm:text-xs text-white/40 tracking-wider font-mono gap-4">
            <div>
              <span>Accra, Ghana</span>
              <span className="mx-2">|</span>
              <span>+233 20 000 0000</span>
              <span className="mx-2">|</span>
              <a href="mailto:designforge25@gmail.com" className="hover:text-white/70 transition-colors">
                designforge25@gmail.com
              </a>
            </div>

            <div className="uppercase tracking-[0.25em] text-white/30 text-[10px]">
              Design for a brighter tomorrow.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
