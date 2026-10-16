import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AboutUsViewProps {
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateWork: () => void;
  onNavigateClients: () => void;
  onNavigateProcess: () => void;
  onOpenScheduler: () => void;
  onOpenServices?: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  onClose,
  onNavigateWork,
  onNavigateClients,
}) => {
  const [isFullScreenImageOpen, setIsFullScreenImageOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFillScreen, setIsFillScreen] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  const handleOpenFullScreen = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFullScreenImageOpen(true);
    setZoomLevel(1);
    setIsFillScreen(false);

    // Attempt browser fullscreen if supported
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Gracefully fall back to viewport overlay
    }
  };

  const handleCloseFullScreen = async () => {
    setIsFullScreenImageOpen(false);
    setZoomLevel(1);
    setIsFillScreen(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Gracefully ignore
    }
  };

  const toggleNativeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (fullscreenContainerRef.current?.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen().catch(() => {});
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        setIsNativeFullscreen(true);
      } else {
        await document.exitFullscreen().catch(() => {});
        setIsNativeFullscreen(false);
      }
    } catch {
      setIsFillScreen((prev) => !prev);
    }
  };

  // Sync fullscreenchange event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close full screen image on Escape key or toggle on F key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreenImageOpen) {
        handleCloseFullScreen();
      } else if ((e.key === 'f' || e.key === 'F') && isFullScreenImageOpen) {
        toggleNativeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenImageOpen]);

  const scrollToMobileStory = () => {
    document.getElementById('about-mobile-story')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMobileFounder = () => {
    document.getElementById('about-mobile-founder')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-[#0d0d0f] text-[#f5f5f7] select-none font-sans">
      
      {/* ============================================================= */}
      {/* MOBILE SCREEN 1: THE FOUNDER & VISION (SNAP POINT 1)          */}
      {/* ============================================================= */}
      <section
        id="about-mobile-founder"
        className="sm:hidden relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-4 py-3 xs:py-4 select-none overflow-hidden"
      >
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-2.5 border-b border-white/[0.08] z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex-shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
                About Us
              </h1>
              <span className="font-mono text-[9px] text-white/40 tracking-[0.2em] uppercase border border-white/10 px-1.5 py-0.5 rounded-full">
                01 / 02
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                aria-label="Close section"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Center: Founder Picture & Vision */}
        <main className="w-full flex-1 min-h-0 flex flex-col items-center justify-center py-2 px-2 max-w-sm mx-auto my-auto text-center">
          {/* 4:5 Portrait of Ivan (Click to preview in Full Screen mode) */}
          <div
            onClick={handleOpenFullScreen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenFullScreen();
              }
            }}
            className="relative w-full max-w-[185px] xs:max-w-[210px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 hover:border-white/50 active:scale-[0.98] bg-[#121215] shadow-2xl mb-3 xs:mb-4 flex-shrink-0 group cursor-pointer transition-all duration-300"
            aria-label="Click to preview Ivan's portrait in full screen mode"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85"
              alt="Ivan, Founder of Design Forge"
              onClick={handleOpenFullScreen}
              className="w-full h-full object-cover object-[center_24%] filter grayscale contrast-110 brightness-95 group-hover:scale-105 transition-transform duration-500 cursor-pointer pointer-events-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Fullscreen Preview Icon Cue */}
            <div
              onClick={handleOpenFullScreen}
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/90 group-hover:text-white group-hover:scale-110 transition-all shadow-lg cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </div>

            {/* Founder badge on image */}
            <div className="absolute bottom-2.5 left-3 text-left pointer-events-none">
              <span className="font-display text-sm font-bold text-white tracking-tight block leading-tight">
                Ivan
              </span>
              <span className="text-[10px] font-mono text-white/70 uppercase tracking-[0.18em]">
                Founder
              </span>
            </div>
          </div>

          {/* Statement Under Picture */}
          <div className="flex flex-col items-center max-w-[340px]">
            <h2 className="text-sm sm:text-base font-normal text-white leading-relaxed tracking-tight mb-2">
              We help you make your projects impossible to ignore
            </h2>
            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
              We partner with architects, interior designers, and real estate leaders to turn complex blueprints into compelling visual stories that secure approvals and drive sales.
            </p>
          </div>
        </main>

        {/* Bottom Bar: Quick links & story prompt */}
        <footer className="w-full flex items-center justify-between pt-2.5 border-t border-white/[0.08] z-20 flex-shrink-0 min-h-[44px]">
          <button
            onClick={onNavigateWork}
            className="flex items-center gap-1.5 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
            aria-label="Scroll up to Our Work"
          >
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            <span>Work</span>
          </button>

          {/* Center: Slide indicator */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            <button
              onClick={scrollToMobileStory}
              className="w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/50 cursor-pointer transition-all"
              aria-label="Go to story"
            />
          </div>

          <button
            onClick={scrollToMobileStory}
            className="flex items-center gap-1.5 text-[13.2px] font-mono tracking-[0.16em] text-white/80 hover:text-white transition-colors cursor-pointer py-1 group"
            aria-label="Scroll down to Story"
          >
            <span>Story</span>
            <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </footer>
      </section>

      {/* ============================================================= */}
      {/* MOBILE SCREEN 2: THE APPROACH & STORY (SNAP POINT 2)          */}
      {/* ============================================================= */}
      <section
        id="about-mobile-story"
        className="sm:hidden relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-4 py-3 xs:py-4 select-none overflow-hidden"
      >
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-2.5 border-b border-white/[0.08] z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex-shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
                The Approach
              </h1>
              <span className="font-mono text-[9px] text-white/40 tracking-[0.2em] uppercase border border-white/10 px-1.5 py-0.5 rounded-full">
                02 / 02
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                aria-label="Close section"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Center: Story & Narrative */}
        <main className="w-full flex-1 min-h-0 flex flex-col justify-center py-2 px-2 max-w-sm mx-auto my-auto text-left">
          <div className="space-y-3.5 xs:space-y-4">
            <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed">
              For four years, we’ve mastered the art of visual translation. We don't just make pretty pictures—we craft strategic visual tools designed to make your project easier to understand, approve, and sell.
            </p>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
              When blueprints alone aren’t enough to help stakeholders see your vision, we translate your architectural designs into immersive visual stories—from photorealistic renders to virtual reality—so you can secure approvals and share your work with absolute confidence.
            </p>
          </div>
        </main>

        {/* Bottom Bar: Back to Founder & forward to Clients */}
        <footer className="w-full flex items-center justify-between pt-2.5 border-t border-white/[0.08] z-20 flex-shrink-0 min-h-[44px]">
          <button
            onClick={scrollToMobileFounder}
            className="flex items-center gap-1.5 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
            aria-label="Scroll back to Founder"
          >
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            <span>Founder</span>
          </button>

          {/* Center: Slide indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToMobileFounder}
              className="w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/50 cursor-pointer transition-all"
              aria-label="Go to founder"
            />
            <span className="w-4 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          </div>

          <button
            onClick={onNavigateClients}
            className="flex items-center gap-1.5 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/80 hover:text-white transition-colors cursor-pointer py-1 group"
            aria-label="Continue to Our Clients"
          >
            <span>Clients</span>
            <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </footer>
      </section>

      {/* ============================================================= */}
      {/* DESKTOP VIEW: PRESERVED FULL EDITORIAL SPREAD                 */}
      {/* ============================================================= */}
      <section
        id="about-desktop"
        className="hidden sm:flex relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always flex-col justify-between px-6 md:px-9 py-6 md:py-9 select-none overflow-hidden"
      >
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-3 sm:pb-6 border-b border-white/[0.08] z-20 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
                About Us
              </h1>
            </div>
          </div>

          <div className="flex items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                aria-label="Close section"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Center: Full 2-Column Editorial Spread */}
        <main className="w-full flex-1 min-h-0 relative my-auto py-4 flex flex-col justify-center">
          <div className="grid w-full h-full max-w-[1720px] mx-auto grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Narrative */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-8 pr-0 lg:pr-4">
              <div>
                <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-light text-white leading-[1.3] tracking-tight">
                  We help you make your projects impossible to ignore
                </h2>
                <p className="text-sm sm:text-base text-white/70 font-light mt-2 sm:mt-3 leading-relaxed">
                  We partner with architects, interior designers, and real estate leaders to turn complex blueprints into compelling visual stories that secure approvals and drive sales.
                </p>
              </div>

              {/* 2-Column narrative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white/[0.08]">
                <div>
                  <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                    For four years, we’ve mastered the art of visual translation. We don't just make pretty pictures—we craft strategic visual tools designed to make your project easier to understand, approve, and sell.
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                    When blueprints alone aren’t enough to help stakeholders see your vision, we translate your architectural designs into immersive visual stories—from photorealistic renders to virtual reality—so you can secure approvals and share your work with absolute confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Founder Portrait & Architectural Graphic Accent */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center py-4 lg:py-0">
              <div
                onClick={handleOpenFullScreen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenFullScreen();
                  }
                }}
                className="relative w-full max-w-xs sm:max-w-md rounded-xl overflow-hidden border border-white/15 hover:border-white/45 bg-[#121215] shadow-2xl group cursor-pointer transition-all duration-300"
                aria-label="Click to open Ivan's portrait in full screen mode"
              >
                <div className="absolute top-4 right-4 z-20 pointer-events-none text-right opacity-30 group-hover:opacity-60 transition-opacity">
                  <span className="font-display text-xs tracking-tighter uppercase font-bold text-white block leading-tight">
                    Creative<br />Studio
                  </span>
                </div>

                <div className="aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden relative cursor-pointer" onClick={handleOpenFullScreen}>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85"
                    alt="Ivan, Founder of Design Forge"
                    onClick={handleOpenFullScreen}
                    className="w-full h-full object-cover object-[center_28%] filter grayscale contrast-110 brightness-95 group-hover:scale-105 transition-transform duration-700 cursor-pointer pointer-events-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Interactive Full Screen Preview Hint Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <div className="px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/25 text-white flex items-center gap-2 text-xs font-mono tracking-wider shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>CLICK FOR FULL SCREEN</span>
                    </div>
                  </div>
                </div>

                {/* Founder Label */}
                <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 z-20 pointer-events-none">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                    Ivan
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-white/70 uppercase tracking-[0.2em] mt-1 font-mono">
                    Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Controls */}
        <footer className="relative w-full flex items-center justify-between pt-3 sm:pt-6 border-t border-white/[0.08] z-20 flex-shrink-0 min-h-[46px] sm:min-h-[54px]">
          <div className="flex items-center justify-start z-10">
            <button
              onClick={onNavigateWork}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1.5 pr-2 group"
              aria-label="Scroll back to Our Work"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Work</span>
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 z-20 pointer-events-auto">
            <div className="text-xs font-mono tracking-[0.25em] uppercase text-white/30">
              Creative Studio
            </div>
          </div>

          <div className="flex items-center justify-end z-10">
            <button
              onClick={onNavigateClients}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1.5 pl-2 group"
              aria-label="Continue to Our Clients"
            >
              <span>Clients</span>
              <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        </footer>
      </section>

      {/* ============================================================= */}
      {/* TRUE FULL SCREEN IMAGE VIEWER (PORTALED TO DOCUMENT BODY)     */}
      {/* ============================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFullScreenImageOpen && (
            <motion.div
              ref={fullscreenContainerRef}
              key="fullscreen-founder-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleCloseFullScreen}
              className="fixed inset-0 z-[999999] w-screen h-screen bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center select-none overflow-hidden touch-none"
            >
              {/* Floating Top Controls Bar */}
              <div
                className="absolute top-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex items-center justify-between z-50 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left: Founder credit */}
                <div className="flex items-center gap-3 pointer-events-auto">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-base sm:text-xl font-bold text-white tracking-tight leading-none">
                        Ivan
                      </h2>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 border border-white/20 px-2 py-0.5 rounded-full bg-white/5">
                        Founder
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-mono text-white/50 tracking-wider mt-1 hidden sm:block">
                      Design Forge • Architectural Visual Direction
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
                  {/* Fill / Fit Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFillScreen((prev) => !prev);
                      setZoomLevel(1);
                    }}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isFillScreen
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20'
                    }`}
                    title={isFillScreen ? 'Fit to Screen' : 'Fill Screen'}
                  >
                    {isFillScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span className="hidden xs:inline">{isFillScreen ? 'Fit Screen' : 'Fill Screen'}</span>
                  </button>

                  {/* Native Fullscreen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNativeFullscreen();
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                    title={isNativeFullscreen ? 'Exit Native Fullscreen' : 'Enter Native Fullscreen'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Zoom controls */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomLevel((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
                    }}
                    disabled={zoomLevel <= 0.75}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 text-white/90 hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomLevel((prev) => Math.min(3, +(prev + 0.25).toFixed(2)));
                    }}
                    disabled={zoomLevel >= 3}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 text-white/90 hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {zoomLevel !== 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomLevel(1);
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseFullScreen();
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 text-white transition-all flex items-center justify-center cursor-pointer ml-1"
                    title="Close Full Screen (Esc)"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Fullscreen Canvas: True edge-to-edge / viewport centered */}
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((prev) => (prev === 1 ? 1.6 : 1));
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: zoomLevel,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex items-center justify-center transition-all duration-300 ${
                    isFillScreen
                      ? 'w-full h-full'
                      : 'w-full h-full p-4 sm:p-8 md:p-12'
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2400&q=95"
                    alt="Ivan, Founder of Design Forge"
                    className={`select-none pointer-events-none transition-all duration-300 filter grayscale contrast-110 brightness-95 shadow-2xl ${
                      isFillScreen
                        ? 'w-full h-full object-cover'
                        : 'max-w-full max-h-[90vh] sm:max-h-[94vh] object-contain rounded-xl sm:rounded-2xl border border-white/20'
                    }`}
                  />
                </motion.div>
              </div>

              {/* Floating Bottom Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs sm:text-sm text-white/70 font-light hidden sm:block pointer-events-auto">
                  Click image to zoom • Click background or Esc to exit
                </p>
                <span className="text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-widest pointer-events-auto">
                  Full Screen Mode
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};
