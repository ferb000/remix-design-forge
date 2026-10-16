import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';

// 15 CURATED GENERIC ARCHITECTURAL & DESIGN CLIENT LOGOS
export const CLIENT_LOGOS = [
  {
    id: 'altura',
    name: 'ALTURA',
    subtitle: 'DEVELOPMENTS',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 21V9l8-6 8 6v12" />
        <path d="M9 21V12h6v9" />
        <line x1="4" y1="21" x2="20" y2="21" />
      </svg>
    ),
  },
  {
    id: 'nova',
    name: 'NOVA',
    subtitle: 'ARCHITECTS',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'atlas',
    name: 'ATLAS',
    subtitle: 'URBAN',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    ),
  },
  {
    id: 'forma',
    name: 'FORMA',
    subtitle: 'STUDIO',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'lumiere',
    name: 'LUMIÈRE',
    subtitle: 'DESIGN',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="12" r="6" />
        <circle cx="15" cy="12" r="6" />
      </svg>
    ),
  },
  {
    id: 'harbor',
    name: 'HARBOR',
    subtitle: 'PROPERTIES',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 17c3.5-2 6.5-2 10 0s6.5 2 8 0" />
        <path d="M3 21c3.5-2 6.5-2 10 0s6.5 2 8 0" />
        <path d="M12 3v11M8 7l4-4 4 4" />
      </svg>
    ),
  },
  {
    id: 'vyne',
    name: 'VYNE',
    subtitle: 'HOMES',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L4 12h16L12 2z" />
        <path d="M12 12v10" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
  },
  {
    id: 'monument',
    name: 'MONUMENT',
    subtitle: 'GROUP',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 21h18M4 17h16M6 17V8M10 17V8M14 17V8M18 17V8M3 8l9-5 9 5" />
      </svg>
    ),
  },
  {
    id: 'orion',
    name: 'ORION',
    subtitle: 'TOWERS',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'terrain',
    name: 'TERRAIN',
    subtitle: 'ARCHITECTURE',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 19L9 8l4 6 3-4 6 9H2z" />
      </svg>
    ),
  },
  {
    id: 'aurelia',
    name: 'AURELIA',
    subtitle: 'ESTATES',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 21V10a7 7 0 0 1 14 0v11" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <circle cx="12" cy="10" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'strata',
    name: 'STRATA',
    subtitle: 'COLLECTIVE',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M2 12h20M6 18h12" />
      </svg>
    ),
  },
  {
    id: 'arcade',
    name: 'ARCADE',
    subtitle: 'STUDIO',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 21V9a4 4 0 0 1 8 0v12" />
        <path d="M12 21V9a4 4 0 0 1 8 0v12" />
      </svg>
    ),
  },
  {
    id: 'kinetic',
    name: 'KINETIC',
    subtitle: 'SPACES',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'solace',
    name: 'SOLACE',
    subtitle: 'RESIDENCES',
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9zm0 16a7 7 0 0 1-7-7 7 7 0 0 1 7-7v14z" />
      </svg>
    ),
  },
];

export const OurClientsSlider = ({ onClose, onNavigatePrev, onNavigateNext, onInquire, onOpenMenu }) => {
  const { clients } = useStudioData();
  const displayClients = clients;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
      else if (e.key === 'ArrowUp' && onNavigatePrev) onNavigatePrev();
      else if (e.key === 'ArrowDown' && onNavigateNext) onNavigateNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigatePrev, onNavigateNext]);

  return (
    <div className="relative w-full h-full min-h-screen min-h-[100dvh] bg-[#0d0d0f]/85 backdrop-blur-2xl text-[#f5f5f7] flex flex-col justify-between px-4 sm:px-6 md:px-9 pt-3 sm:pt-5 md:pt-8 pb-2 sm:pb-3 md:pb-4 select-none overflow-hidden font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER: CONSISTENT TOGGLE COORDINATES + SECTION TITLE  */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full flex items-center justify-between pb-3 sm:pb-6 border-b border-white/[0.08] z-20 flex-shrink-0">
        
        {/* Top Left: Navigation Toggle Spacer + Section Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />
          <div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
              Our Clients
            </h1>
          </div>
        </div>

        {/* Top Right: Clean Close Button */}
        <div className="flex items-center">
          {onClose && (
            <button
              onClick={onClose}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              aria-label="Close Clients section"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CENTER: SINGLE STATIC PAGE GRID OF ALL LOGOS & NAMES  */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full max-w-[1720px] mx-auto my-auto py-2 sm:py-4 flex-1 min-h-0 relative flex flex-col justify-center items-center overflow-y-auto sm:overflow-y-visible">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full grid grid-cols-3 sm:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4 lg:gap-5 py-1 sm:py-2 items-center justify-items-center"
        >
          {displayClients.map((client) => (
            <div
              key={client.id}
              className="w-full aspect-[4/3] xs:aspect-[1/1] sm:aspect-[4/3] max-w-[180px] sm:max-w-[210px] rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center text-center p-2 xs:p-3 sm:p-4 group cursor-default"
            >
              {/* Logo Emblem Icon */}
              <div className="mb-1.5 xs:mb-2 sm:mb-2.5 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 flex items-center justify-center h-8 sm:h-10">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="max-h-8 sm:max-h-10 max-w-[80px] sm:max-w-[100px] object-contain"
                  />
                ) : client.icon ? (
                  client.icon
                ) : (
                  <span className="font-display font-bold text-lg text-white/80">
                    {client.name?.slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Logo Name Underneath */}
              <h3 className="font-display text-xs sm:text-sm font-bold tracking-[0.16em] uppercase text-white/90 group-hover:text-white transition-colors leading-tight">
                {client.name}
              </h3>

              {/* Subtitle Under Name */}
              {client.subtitle && (
                <p className="text-xs font-mono tracking-[0.18em] uppercase text-white/45 group-hover:text-white/65 transition-colors mt-0.5">
                  {client.subtitle}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER: CLEAN NAVIGATION WITHOUT SLIDESHOW SYMBOLS  */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full flex items-center justify-between pt-2.5 sm:pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] z-20 gap-2 sm:gap-4 flex-shrink-0 mt-auto">
        
        {/* Left: Quick Jump up to About */}
        <div className="flex items-center">
          {onNavigatePrev && (
            <button
              onClick={onNavigatePrev}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
              aria-label="Scroll back up to About"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>About</span>
            </button>
          )}
        </div>

        {/* Center: Clean Studio Indicator */}
        <div className="text-xs font-mono tracking-[0.25em] uppercase text-white/30 hidden sm:block">
          Design Forge · Client Partnerships
        </div>

        {/* Right: Continue down to Creative Process */}
        <div className="flex items-center">
          {onNavigateNext && (
            <button
              onClick={onNavigateNext}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
              aria-label="Continue to Creative Process"
            >
              <span>Process</span>
              <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
