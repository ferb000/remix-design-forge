import React from 'react';
import { X } from 'lucide-react';

export type NavDestination =
  | 'home'
  | 'work'
  | 'about'
  | 'clients'
  | 'connect'
  | 'process'
  | 'faq';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (destination: NavDestination) => void;
  onOpenAdmin?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNav,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  // The exact 7 menu links in exact order specified:
  const menuLinks: { label: string; action: NavDestination }[] = [
    { label: 'Home', action: 'home' },
    { label: 'Work', action: 'work' },
    { label: 'About', action: 'about' },
    { label: 'Clients', action: 'clients' },
    { label: 'Creative Process', action: 'process' },
    { label: 'FAQ', action: 'faq' },
    { label: 'Connect With Us', action: 'connect' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex flex-col justify-between bg-black/90 backdrop-blur-md transition-opacity duration-500 overflow-y-auto"
    >
      {/* 1. Header Controls */}
      <div className="w-full flex items-center justify-between p-4 sm:p-9 md:p-12 z-20">
        {/* Top-Left: "DESIGN FORGE" in subtle, low-opacity text */}
        <div className="select-none">
          <span className="font-display text-xs sm:text-sm font-light tracking-[0.38em] uppercase text-white/40">
            Design Forge
          </span>
        </div>

        {/* Top-Right: Simple, minimal "CLOSE X" or "X" button */}
        <button
          onClick={onClose}
          className="group flex items-center gap-2 p-2 text-white/50 hover:text-white transition-colors cursor-pointer focus:outline-none"
          aria-label="Close navigation overlay"
        >
          <span className="text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
            Close
          </span>
          <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
        </button>
      </div>

      {/* 2. Dead-Center Vertical & Horizontal Alignment for Menu Links */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-4 sm:py-10 z-10">
        <nav className="flex flex-col items-center space-y-4 sm:space-y-8 md:space-y-9">
          {menuLinks.map(item => (
            <button
              key={item.label}
              onClick={() => {
                onClose();
                onSelectNav(item.action);
              }}
              className="group relative cursor-pointer focus:outline-none py-1 inline-block"
            >
              <span className="font-display text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-light tracking-[0.14em] text-white/70 group-hover:text-white transition-colors duration-300 block select-none">
                {item.label}
              </span>

              {/* Subtle underline hover effect */}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full opacity-80" />
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Bottom footer: copyright & archive details */}
      <div className="w-full flex items-center justify-between p-4 sm:p-9 md:p-12 z-20">
        <span className="text-xs font-mono tracking-[0.25em] text-white/30 uppercase">
          Studio Archive 2026
        </span>
        {onOpenAdmin ? (
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="flex items-center gap-2 text-[14.4px] font-mono tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 bg-white/[0.02]"
          >
            <span>Admin Console</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono tracking-[0.2em] text-white/20 uppercase">
            Design Forge · All Rights Reserved
          </span>
        )}
      </div>

    </div>
  );
};
