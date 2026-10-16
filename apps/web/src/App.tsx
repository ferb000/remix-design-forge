/**
 * Design Forge - Architectural Visualization Studio
 * Ultra-Minimalist Immaterial Interface with Active Cinematic Showreel
 * Seamless One-Page Scroll Website Across All 7 Primary Sections
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { HeroCenter } from './components/HeroCenter';
import { ArchitecturalShowreel } from './components/ArchitecturalShowreel';
import { NavigationDrawer, NavDestination } from './components/NavigationDrawer';
import { ConnectWithUsModal } from './components/ConnectWithUsModal';
import { ServicesModal } from './components/ServicesModal';
import { StudioModal } from './components/StudioModal';
import { ProcessModal } from './components/ProcessModal';
import { FaqModal } from './components/FaqModal';
import { OurWorkSlider } from './components/OurWorkSlider';
import { OurClientsSlider } from './components/OurClientsSlider';
import { AboutUsView } from './components/AboutUsView';
import { SHOWREEL_SCENES, SceneItem } from './data/studioData';

export type ActiveSection = 'home' | 'work' | 'about' | 'clients' | 'process' | 'faq' | 'connect';

export const SECTIONS: ActiveSection[] = [
  'home',
  'work',
  'about',
  'clients',
  'process',
  'faq',
  'connect',
];

// Dedicated Navigation Menu Trigger Component with subtle Apple Liquid Glass aesthetic (Desktop & Mobile)
export const NavigationMenuTrigger: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <header className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] sm:top-6 sm:left-6 md:top-9 md:left-9 z-[60] pointer-events-auto">
    <button
      onClick={onClick}
      className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.015] hover:bg-white/[0.04] active:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.18] active:scale-90 transition-all duration-300 cursor-pointer focus:outline-none flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden"
      aria-label="Open navigation menu"
    >
      {/* Subtle Liquid Glass Inner-Glow Highlight */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.05)_35%,transparent_75%)] pointer-events-none" />

      {/* Subtle Liquid Glass Specular Inset Rim Highlight */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

      {/* Prismatic Internal Caustic Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.06] pointer-events-none" />

      {/* Three-line architectural icon with interactive geometric expansion on hover */}
      <div className="relative z-10 w-5 sm:w-6 h-3 sm:h-4 flex flex-col justify-between items-start py-0.5">
        <span className="w-5 sm:w-6 h-[1.5px] bg-white/80 rounded-full transition-all duration-300 group-hover:w-5 sm:group-hover:w-6 group-hover:bg-white" />
        <span className="w-3 sm:w-4 h-[1.5px] bg-white/80 rounded-full transition-all duration-300 group-hover:w-5 sm:group-hover:w-6 group-hover:bg-white" />
        <span className="w-5 sm:w-6 h-[1.5px] bg-white/80 rounded-full transition-all duration-300 group-hover:w-3.5 sm:group-hover:w-4.5 group-hover:bg-white" />
      </div>
    </button>
  </header>
);

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Navigation & Sub-modals state
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isWorkGalleryOpen, setIsWorkGalleryOpen] = useState(false);
  const [isProjectExpanded, setIsProjectExpanded] = useState(false);

  // Background media scene state
  const [currentScene, setCurrentScene] = useState<SceneItem>(SHOWREEL_SCENES[0]);

  // Target work category state when jumping from Services links
  const [targetWorkCategory, setTargetWorkCategory] = useState<{ id: string; openGallery: boolean } | null>(null);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToWork = (categoryId?: string, openGallery?: boolean) => {
    if (categoryId) {
      setTargetWorkCategory({ id: categoryId, openGallery: !!openGallery });
    }
    scrollToSection('work');
  };

  // IntersectionObserver to smoothly track the currently active section for the nav drawer & title
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '') as ActiveSection;
            if (SECTIONS.includes(id)) {
              setActiveSection(id);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.35,
      }
    );

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(`section-${sec}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSelectNav = (dest: NavDestination) => {
    setIsNavOpen(false);
    scrollToSection(dest);
  };

  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#0d0d0d] text-[#f5f5f7] select-none font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. CONTINUOUS ACTIVE CINEMATIC SHOWREEL MOTION BACKGROUND    */}
      {/* ------------------------------------------------------------- */}
      <ArchitecturalShowreel
        currentSceneOverride={currentScene}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP-LEFT NAVIGATION BUTTON (CONSISTENT FIXED COORDINATES)  */}
      {/* ------------------------------------------------------------- */}
      <NavigationMenuTrigger
        onClick={() => setIsNavOpen(true)}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTINUOUS ONE-PAGE VERTICAL SCROLL STREAM                 */}
      {/* ------------------------------------------------------------- */}
      <main
        id="onepage-scroll-container"
        ref={scrollContainerRef}
        className="relative z-30 w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
      >
        {/* 1. HOME SECTION */}
        <section
          id="section-home"
          className="relative w-full min-h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between overflow-hidden"
        >
          {/* Center Canvas: Immaterial Lens & Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <HeroCenter />
          </div>

          {/* Bottom-Left: Interactive Apple Liquid Glass Morphing Trigger (Desktop & Mobile) */}
          <footer className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))] sm:bottom-6 sm:left-6 md:bottom-9 md:left-9 z-50 pointer-events-auto">
            <AnimatePresence mode="wait" initial={false}>
              {!isProjectExpanded ? (
                /* Collapsed: Very subtle ultra-transparent diagonal arrow */
                <motion.button
                  key="arrow-collapsed"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectExpanded(true);
                  }}
                  className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.015] hover:bg-white/[0.04] active:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.18] active:scale-90 flex items-center justify-center text-white/80 hover:text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] cursor-pointer overflow-hidden transition-all duration-300"
                  aria-label="Open start a project option"
                >
                  {/* Subtle Liquid Glass Inner-Glow Highlight */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.05)_35%,transparent_75%)] pointer-events-none" />

                  {/* Subtle Apple Specular Inset Rim Highlight */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

                  {/* Prismatic Internal Caustic Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.06] pointer-events-none" />

                  <ArrowUpRight className="relative z-10 w-5 h-5 sm:w-5.5 sm:h-5.5 text-white/80 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
              ) : (
                /* Expanded: Very subtle ultra-transparent Apple Liquid Glass 'Start a project' option */
                <motion.button
                  key="start-project-expanded"
                  initial={{ opacity: 0, scale: 0.9, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.88, x: -6 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 340 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectExpanded(false);
                    scrollToSection('connect');
                  }}
                  className="group relative h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] active:bg-white/[0.08] backdrop-blur-3xl border border-white/[0.1] hover:border-white/[0.2] flex items-center gap-3 sm:gap-3.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] cursor-pointer overflow-hidden active:scale-95 transition-all duration-300"
                  aria-label="Start a project"
                >
                  {/* Subtle Liquid Glass Inner-Glow Highlight */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.05)_35%,transparent_75%)] pointer-events-none" />

                  {/* Subtle Apple Specular Inset Rim Highlight */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

                  {/* Liquid Glass ambient highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.015] via-white/[0.05] to-transparent pointer-events-none" />
                  
                  <span className="relative z-10 text-[14.4px] sm:text-[16.8px] font-medium tracking-wider text-white/90 group-hover:text-white whitespace-nowrap transition-colors">
                    Start A Project
                  </span>

                  <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/[0.04] border border-white/[0.14] backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-white shadow-sm flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 group-hover:text-white" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </footer>

          {/* Click/Touch-Anywhere Backdrop: Collapses the 'start a project' option back into the arrow (Desktop & Mobile) */}
          <AnimatePresence>
            {isProjectExpanded && (
              <motion.div
                key="popup-dismiss-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsProjectExpanded(false)}
                onTouchStart={() => setIsProjectExpanded(false)}
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
              />
            )}
          </AnimatePresence>

          {/* Bottom-Center: Minimal Scroll Cue */}
          <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <button
              onClick={() => scrollToSection('work')}
              className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none transition-all duration-300 opacity-60 hover:opacity-100"
              aria-label="Scroll down to explore work"
            >
              <span className="text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">
                Scroll To Explore
              </span>
              <div className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center p-1">
                <span className="w-1 h-1.5 rounded-full bg-white animate-bounce" />
              </div>
            </button>
          </div>
        </section>

        {/* 2. OUR WORK SECTION */}
        <section
          id="section-work"
          className="relative w-full h-screen h-[100dvh] min-h-[100dvh] snap-start snap-always overflow-hidden bg-[#0d0d0d] flex flex-col"
        >
          <OurWorkSlider
            onClose={() => scrollToSection('home')}
            onNavigatePrev={() => scrollToSection('home')}
            onNavigateNext={() => scrollToSection('about')}
            onSelectHeroScene={(item: { title: string }) => {
              const matched = SHOWREEL_SCENES.find((s) => s.title === item.title);
              if (matched) setCurrentScene(matched);
              scrollToSection('home');
            }}
            onInquire={() => scrollToSection('connect')}
            onOpenMenu={() => setIsNavOpen(true)}
            activeCategoryOverride={targetWorkCategory}
            onClearCategoryOverride={() => setTargetWorkCategory(null)}
            onGalleryStateChange={setIsWorkGalleryOpen}
          />
        </section>

        {/* 3. ABOUT US SECTION (DESKTOP: FULL SPREAD, MOBILE: 2 DUAL SNAP SCREENS) */}
        <div
          id="section-about"
          className="relative w-full bg-[#0d0d0f]"
        >
          <AboutUsView
            onClose={() => scrollToSection('home')}
            onNavigateHome={() => scrollToSection('home')}
            onNavigateWork={() => scrollToSection('work')}
            onNavigateClients={() => scrollToSection('clients')}
            onNavigateProcess={() => scrollToSection('process')}
            onOpenScheduler={() => scrollToSection('connect')}
            onOpenServices={() => setIsServicesOpen(true)}
          />
        </div>

        {/* 4. OUR CLIENTS SECTION */}
        <section
          id="section-clients"
          className="relative w-full h-screen h-[100dvh] min-h-[100dvh] snap-start snap-always overflow-hidden bg-[#0e0e10] flex flex-col"
        >
          <OurClientsSlider
            onClose={() => scrollToSection('home')}
            onNavigatePrev={() => scrollToSection('about')}
            onNavigateNext={() => scrollToSection('process')}
            onInquire={() => scrollToSection('connect')}
            onOpenMenu={() => setIsNavOpen(true)}
          />
        </section>

        {/* 5. CREATIVE PROCESS SECTION */}
        <section
          id="section-process"
          className="relative w-full min-h-screen min-h-[100dvh] snap-start snap-always overflow-hidden bg-[#0b0b0d]"
        >
          <ProcessModal
            isOpen={true}
            onClose={() => scrollToSection('home')}
            onStartProject={() => scrollToSection('connect')}
            onOpenFaq={() => scrollToSection('faq')}
            onNavigatePrev={() => scrollToSection('clients')}
            onNavigateNext={() => scrollToSection('faq')}
          />
        </section>

        {/* 6. FAQ SECTION */}
        <section
          id="section-faq"
          className="relative w-full min-h-screen min-h-[100dvh] snap-start snap-always overflow-hidden bg-[#0b0b0d]"
        >
          <FaqModal
            isOpen={true}
            onClose={() => scrollToSection('home')}
            onConnectWithUs={() => scrollToSection('connect')}
            onBackToProcess={() => scrollToSection('process')}
          />
        </section>

        {/* 7. CONNECT WITH US SECTION */}
        <section
          id="section-connect"
          className="relative w-full min-h-screen snap-start bg-[#0d0e11]"
        >
          <ConnectWithUsModal
            isOpen={true}
            onClose={() => scrollToSection('home')}
            onNavigateAbout={() => scrollToSection('about')}
            onNavigateClients={() => scrollToSection('clients')}
            onNavigateWork={(categoryId, openGallery) => handleNavigateToWork(categoryId, openGallery)}
            onNavigateProcess={() => scrollToSection('process')}
            onBackToFaq={() => scrollToSection('faq')}
          />
        </section>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. NAVIGATION DRAWER & SECONDARY SHEETS                       */}
      {/* ------------------------------------------------------------- */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelectNav={handleSelectNav}
      />

      <ServicesModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        onStartProjectWithService={() => {
          setIsServicesOpen(false);
          scrollToSection('connect');
        }}
      />

      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onStartProject={() => {
          setIsStudioOpen(false);
          scrollToSection('connect');
        }}
      />

    </div>
  );
}
