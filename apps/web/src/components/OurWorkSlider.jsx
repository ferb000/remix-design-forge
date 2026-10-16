import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown, Play } from 'lucide-react';
import { FullScreenWorkGallery } from './FullScreenWorkGallery';

// High-Resolution Architectural Renders
import imgInterior from '../assets/images/arch_interior_loft_1791042707674.jpg';
import imgModular from '../assets/images/arch_modular_apartments_1791047740832.jpg';
import imgCoastalPool from '../assets/images/arch_coastal_pool_1791047725968.jpg';
import imgRooftop from '../assets/images/arch_rooftop_panoramic_1791047753250.jpg';
import imgNordic from '../assets/images/arch_hero_nordic_1791042685381.jpg';
import imgDesert from '../assets/images/arch_desert_villa_1791046593942.jpg';
import imgMonolith from '../assets/images/arch_monolith_museum_1791042697346.jpg';
import imgSpiral from '../assets/images/arch_spiral_gallery_1791046607463.jpg';
import imgAlpine from '../assets/images/arch_alpine_chalet_1791046619292.jpg';
import imgTower from '../assets/images/arch_glass_tower_1791046631981.jpg';
import imgKyoto from '../assets/images/arch_kyoto_sanctuary_1791042718246.jpg';

// EXACTLY 4 CATEGORIES
export const WORK_CATEGORIES = [
  {
    id: 'still-images',
    title: 'Still Images',
    subtitle: 'EXTERIORS & INTERIORS',
    badgeType: null,
    frontImage: imgModular,
    leftCards: [imgInterior, imgDesert],
    rightCards: [imgNordic, imgSpiral],
    gallery: [
      { title: 'Timber & Stone Modular Complex', architect: 'Lund Hagem Arkitekter', location: 'Copenhagen, Denmark', img: imgModular },
      { title: 'Manhattan Sky Salon Penthouse', architect: 'Studio Liaigre', location: 'Tribeca, New York', img: imgInterior },
      { title: 'Nordic Basalt Cantilever Villa', architect: 'Snøhetta', location: 'Vestland, Norway', img: imgNordic },
      { title: 'Amangiri Basalt Sanctuary', architect: 'Rick Joy Architects', location: 'Canyon Point, Utah', img: imgDesert },
    ]
  },
  {
    id: 'animations',
    title: 'Animations',
    subtitle: 'VIDEO FILMS',
    badgeType: 'play',
    frontImage: imgCoastalPool,
    leftCards: [imgMonolith, imgAlpine],
    rightCards: [imgTower, imgDesert],
    gallery: [
      { title: 'Coastal Sunset Infinity Terrace Film', architect: 'Tadao Ando Architect', location: 'Ticino, Switzerland', img: imgCoastalPool },
      { title: 'Monolith Solar Pavilion Film', architect: 'Tadao Ando', location: 'Lugano, Switzerland', img: imgMonolith },
      { title: 'Alpine Chalet Twilight Motion', architect: 'Peter Zumthor Studio', location: 'St. Moritz, Switzerland', img: imgAlpine },
      { title: 'Madison Botanical Spire Flythrough', architect: 'Foster + Partners', location: 'Manhattan, New York', img: imgTower },
    ]
  },
  {
    id: 'vr',
    title: 'VR',
    subtitle: 'INTERACTIVE',
    badgeType: 'vr',
    frontImage: imgSpiral,
    leftCards: [imgInterior, imgModular],
    rightCards: [imgTower, imgDesert],
    gallery: [
      { title: 'Kunsthalle Virtual Reality Twin', architect: 'Herzog & de Meuron', location: 'Basel, Switzerland', img: imgSpiral },
      { title: 'Botanical Penthouse Real-Time', architect: 'Foster + Partners', location: 'New York, USA', img: imgInterior },
      { title: 'Nordic Nanite Digital Twin', architect: 'Design Forge Labs', location: 'Vestland, Norway', img: imgNordic },
    ]
  },
  {
    id: '360-panoramas',
    title: '360 Panoramas',
    subtitle: 'PANORAMIC VIEWS',
    badgeType: '360',
    frontImage: imgRooftop,
    leftCards: [imgKyoto, imgCoastalPool],
    rightCards: [imgDesert, imgNordic],
    gallery: [
      { title: 'Rooftop Horizon Panoramic Tour', architect: 'Rick Joy Architects', location: 'Canyon Point, Utah', img: imgRooftop },
      { title: 'Arashiyama Water Pavilion 360°', architect: 'Kengo Kuma & Associates', location: 'Kyoto, Japan', img: imgKyoto },
      { title: 'Manhattan Penthouse 360° View', architect: 'Studio Liaigre', location: 'Tribeca, New York', img: imgInterior },
    ]
  }
];

export const OurWorkSlider = ({
  onClose,
  onSelectHeroScene,
  onInquire,
  onOpenMenu,
  onNavigateNext,
  onNavigatePrev,
  activeCategoryOverride,
  onClearCategoryOverride,
  onGalleryStateChange,
}) => {
  // Default active category: Animations (index 1)
  const [activeIndex, setActiveIndex] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState(null);

  // Notify parent orchestrator when full-screen gallery opens/closes
  useEffect(() => {
    onGalleryStateChange?.(Boolean(selectedGalleryCategory));
  }, [selectedGalleryCategory, onGalleryStateChange]);

  // Jump to specific category and optionally open its full gallery view
  useEffect(() => {
    if (!activeCategoryOverride) return;
    const catIdx = WORK_CATEGORIES.findIndex((c) => c.id === activeCategoryOverride.id);
    if (catIdx !== -1) {
      setSwipeDirection(catIdx > activeIndex ? 1 : -1);
      setActiveIndex(catIdx);
      if (activeCategoryOverride.openGallery) {
        setSelectedGalleryCategory(WORK_CATEGORIES[catIdx]);
      }
    }
    onClearCategoryOverride?.();
  }, [activeCategoryOverride, onClearCategoryOverride, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        if (selectedGalleryCategory) setSelectedGalleryCategory(null);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryCategory, onClose]);

  const isNavigatingRef = useRef(false);

  const handleNext = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setSwipeDirection(1);
    setActiveIndex((prev) => (prev + 1) % WORK_CATEGORIES.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 280);
  };

  const handlePrev = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setSwipeDirection(-1);
    setActiveIndex((prev) => (prev - 1 + WORK_CATEGORIES.length) % WORK_CATEGORIES.length);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 280);
  };

  // Determine current active item for pagination (hovered index takes precedence on hover)
  const highlightedIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  // Touch swipe handling for mobile
  const touchStartXRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const activeMobileCat = WORK_CATEGORIES[activeIndex];
  const prevMobileCat = WORK_CATEGORIES[(activeIndex - 1 + WORK_CATEGORIES.length) % WORK_CATEGORIES.length];
  const nextMobileCat = WORK_CATEGORIES[(activeIndex + 1) % WORK_CATEGORIES.length];

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-[#0d0d0f] text-[#f5f5f7] flex flex-col justify-between px-4 sm:px-6 md:px-9 pt-3 sm:pt-6 md:pt-9 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 md:pb-8 select-none overflow-hidden font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER: ALIGNED WITH FIXED TOP-LEFT TOGGLE COORDINATES */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full flex items-center justify-between pb-2.5 sm:pb-6 border-b border-white/[0.08] z-20 flex-shrink-0">
        
        {/* Top Left: Dedicated spacer matching fixed toggle button + Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Transparent spacer matching the fixed navigation toggle button's exact bounds */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />

          <div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
              Our Work
            </h1>
          </div>
        </div>

        {/* Top Right: Only the close sign at the right corner */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              aria-label="Close Work section"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. CENTER SECTION: RESPONSIVE CARDS (DESKTOP SPREAD / MOBILE DECK) */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full max-w-[1720px] mx-auto flex-1 min-h-0 relative flex flex-col items-center justify-center my-auto py-2 sm:py-6">
        
        {/* MOBILE VIEW: Signature Spread Cards Deck with Swipe Interaction */}
        <div
          className="sm:hidden flex flex-col items-center justify-center w-full my-auto px-4 relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Step / Category Counter */}
          <div className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase mb-3 sm:mb-4">
            Category {String(activeIndex + 1).padStart(2, '0')} / {String(WORK_CATEGORIES.length).padStart(2, '0')}
          </div>

          {/* Swipeable Spread Cards Deck Container */}
          <AnimatePresence custom={swipeDirection} mode="popLayout" initial={false}>
            <motion.div
              key={activeMobileCat.id}
              custom={swipeDirection}
              variants={{
                enter: (dir) => ({
                  x: dir > 0 ? 110 : -110,
                  opacity: 0,
                  scale: 0.95,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    x: { type: 'spring', stiffness: 380, damping: 30, mass: 0.65 },
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    scale: { type: 'spring', stiffness: 380, damping: 30, mass: 0.65 },
                  },
                },
                exit: (dir) => ({
                  x: dir > 0 ? -110 : 110,
                  opacity: 0,
                  scale: 0.95,
                  transition: {
                    x: { type: 'spring', stiffness: 380, damping: 30, mass: 0.65 },
                    opacity: { duration: 0.16, ease: 'easeIn' },
                    scale: { type: 'spring', stiffness: 380, damping: 30, mass: 0.65 },
                  },
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 36 }}
              onDragEnd={(_, info) => {
                const swipeThresh = 24;
                const velocityThresh = 160;
                if (info.offset.x < -swipeThresh || info.velocity.x < -velocityThresh) {
                  handleNext();
                } else if (info.offset.x > swipeThresh || info.velocity.x > velocityThresh) {
                  handlePrev();
                }
              }}
              onClick={() => setSelectedGalleryCategory(activeMobileCat)}
              className="relative flex flex-col items-center cursor-pointer w-full max-w-[280px] select-none touch-pan-y transform-gpu will-change-transform"
            >
              {/* --------------------------------------------------- */}
              {/* SPREAD CARDS DECK: 5 FAN-OUT LAYERS (MATCHING DESKTOP) */}
              {/* --------------------------------------------------- */}
              <div className="relative w-full max-w-[185px] xs:max-w-[210px] h-[270px] xs:h-[300px] flex items-center justify-center mb-4 sm:mb-5 transform-gpu">
                
                {/* BACKGROUND CARD 2: FAR LEFT PEEK */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl -translate-x-12 xs:-translate-x-14 -translate-y-2 scale-[0.88] opacity-45 origin-bottom transform-gpu"
                  style={{ zIndex: 10 }}
                >
                  <img
                    src={activeMobileCat.leftCards[1] || activeMobileCat.leftCards[0]}
                    alt={`${activeMobileCat.title} Far Left`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-50"
                  />
                </div>

                {/* BACKGROUND CARD 1: NEAR LEFT PEEK */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl -translate-x-6 xs:-translate-x-7 -translate-y-1 scale-[0.94] opacity-80 origin-bottom transform-gpu"
                  style={{ zIndex: 15 }}
                >
                  <img
                    src={activeMobileCat.leftCards[0]}
                    alt={`${activeMobileCat.title} Near Left`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-70"
                  />
                </div>

                {/* BACKGROUND CARD 4: FAR RIGHT PEEK */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl translate-x-12 xs:translate-x-14 -translate-y-2 scale-[0.88] opacity-45 origin-bottom transform-gpu"
                  style={{ zIndex: 10 }}
                >
                  <img
                    src={activeMobileCat.rightCards[1] || activeMobileCat.rightCards[0]}
                    alt={`${activeMobileCat.title} Far Right`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-50"
                  />
                </div>

                {/* BACKGROUND CARD 3: NEAR RIGHT PEEK */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl translate-x-6 xs:translate-x-7 -translate-y-1 scale-[0.94] opacity-80 origin-bottom transform-gpu"
                  style={{ zIndex: 15 }}
                >
                  <img
                    src={activeMobileCat.rightCards[0]}
                    alt={`${activeMobileCat.title} Near Right`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-70"
                  />
                </div>

                {/* FOREGROUND FEATURED CARD */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden border border-white/40 bg-black shadow-2xl transform-gpu"
                  style={{ zIndex: 20 }}
                >
                  <img
                    src={activeMobileCat.frontImage}
                    alt={activeMobileCat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* LARGE CENTERED DARK CIRCULAR ICONS (MATCHING DESKTOP) */}
                  {activeMobileCat.badgeType === 'play' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-13 h-13 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex items-center justify-center pl-1 shadow-2xl">
                        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                          <polygon points="6 4 20 12 6 20 6 4" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {activeMobileCat.badgeType === 'vr' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-13 h-13 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <svg
                          className="w-6 h-6 text-white fill-none stroke-current stroke-2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="7" width="20" height="10" rx="3" />
                          <circle cx="8" cy="12" r="2" />
                          <circle cx="16" cy="12" r="2" />
                          <path d="M10 17a2 2 0 0 1 4 0" />
                          <path d="M12 7V4" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {activeMobileCat.badgeType === '360' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-13 h-13 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl">
                        <svg
                          className="w-6 h-6 text-white fill-none stroke-current stroke-2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <polyline points="3 3 3 8 8 8" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <polyline points="16 16 21 16 21 21" />
                        </svg>
                        <span className="text-[8px] font-mono tracking-wider font-bold text-white -mt-0.5">
                          360°
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* --------------------------------------------------- */}
              {/* CATEGORY TYPOGRAPHY & DIVIDER LINE (MATCHING DESKTOP) */}
              {/* --------------------------------------------------- */}
              <div className="text-center flex flex-col items-center w-full px-2">
                <h3 className="font-display text-xl xs:text-2xl font-normal tracking-tight text-white uppercase">
                  {activeMobileCat.title}
                </h3>

                <p className="text-[11px] sm:text-[13px] font-light tracking-wide text-white/70 mt-1">
                  {activeMobileCat.subtitle}
                </p>

                {/* Signature Horizontal Line Indicator */}
                <div className="h-[1.5px] w-10 bg-white/80 mt-3" />

                <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/50 mt-2.5">
                  Swipe to browse ↔ Tap to open ↗
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DESKTOP VIEW: Uniform 4-column grid with generous spacing */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-14 xl:gap-20 2xl:gap-24 justify-items-center items-end w-full">
          {WORK_CATEGORIES.map((cat, idx) => {
            const isHovered = hoveredIndex === idx;
            const isActive = idx === activeIndex && hoveredIndex === null;
            const isSelectedOrHovered = isHovered || isActive;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setSelectedGalleryCategory(cat);
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 ease-out w-full ${
                  isSelectedOrHovered
                    ? 'scale-110 xl:scale-115 opacity-100 z-30'
                    : 'scale-90 opacity-65 hover:opacity-85 z-10'
                }`}
                style={{
                  transformOrigin: 'center bottom',
                }}
              >
                
                {/* --------------------------------------------------- */}
                {/* SHRUNKEN NATURAL CARD WITH WIDER PULLED-OUT LAYERS  */}
                {/* --------------------------------------------------- */}
                <div className="relative w-full max-w-[200px] sm:max-w-[215px] lg:max-w-[210px] xl:max-w-[230px] 2xl:max-w-[250px] h-[290px] sm:h-[315px] lg:h-[310px] xl:h-[340px] 2xl:h-[370px] flex items-center justify-center mb-6">
                  
                  {/* BACKGROUND CARD 2: FAR LEFT PEEK (Pulled out ~40%) */}
                  <div
                    className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-500 ease-out origin-bottom ${
                      isSelectedOrHovered
                        ? '-translate-x-20 sm:-translate-x-24 xl:-translate-x-28 -translate-y-2.5 scale-[0.88] opacity-50'
                        : '-translate-x-14 sm:-translate-x-16 xl:-translate-x-20 -translate-y-1.5 scale-[0.89] opacity-40'
                    }`}
                    style={{ zIndex: 10 }}
                  >
                    <img
                      src={cat.leftCards[1] || cat.leftCards[0]}
                      alt={`${cat.title} Far Left`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-50"
                    />
                  </div>

                  {/* BACKGROUND CARD 1: NEAR LEFT PEEK (Pulled out ~25%-30%) */}
                  <div
                    className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl transition-transform duration-500 ease-out origin-bottom ${
                      isSelectedOrHovered
                        ? '-translate-x-10 sm:-translate-x-12 xl:-translate-x-14 -translate-y-1 scale-[0.94] opacity-85'
                        : '-translate-x-8 sm:-translate-x-9 xl:-translate-x-11 -translate-y-0.5 scale-[0.94] opacity-75'
                    }`}
                    style={{ zIndex: 15 }}
                  >
                    <img
                      src={cat.leftCards[0]}
                      alt={`${cat.title} Left`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-75"
                    />
                  </div>

                  {/* BACKGROUND CARD 4: FAR RIGHT PEEK (Pulled out ~40%) */}
                  <div
                    className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-500 ease-out origin-bottom ${
                      isSelectedOrHovered
                        ? 'translate-x-20 sm:translate-x-24 xl:translate-x-28 -translate-y-2.5 scale-[0.88] opacity-50'
                        : 'translate-x-14 sm:translate-x-16 xl:translate-x-20 -translate-y-1.5 scale-[0.89] opacity-40'
                    }`}
                    style={{ zIndex: 10 }}
                  >
                    <img
                      src={cat.rightCards[1] || cat.rightCards[0]}
                      alt={`${cat.title} Far Right`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-50"
                    />
                  </div>

                  {/* BACKGROUND CARD 3: NEAR RIGHT PEEK (Pulled out ~25%-30%) */}
                  <div
                    className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl transition-transform duration-500 ease-out origin-bottom ${
                      isSelectedOrHovered
                        ? 'translate-x-10 sm:translate-x-12 xl:translate-x-14 -translate-y-1 scale-[0.94] opacity-85'
                        : 'translate-x-8 sm:translate-x-9 xl:translate-x-11 -translate-y-0.5 scale-[0.94] opacity-75'
                    }`}
                    style={{ zIndex: 15 }}
                  >
                    <img
                      src={cat.rightCards[0]}
                      alt={`${cat.title} Right`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-75"
                    />
                  </div>

                  {/* FOREGROUND FEATURED CARD */}
                  <div
                    className={`relative w-full h-full rounded-2xl overflow-hidden border bg-black shadow-2xl transition-all duration-300 ${
                      isSelectedOrHovered
                        ? 'border-white/50 ring-1 ring-white/30 shadow-white/10'
                        : 'border-white/20 hover:border-white/35'
                    }`}
                    style={{ zIndex: 20 }}
                  >
                    <img
                      src={cat.frontImage}
                      alt={cat.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    {/* LARGE CENTERED DARK CIRCULAR ICONS */}
                    {cat.badgeType === 'play' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex items-center justify-center pl-1 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                          <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                            <polygon points="6 4 20 12 6 20 6 4" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {cat.badgeType === 'vr' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                          <svg
                            className="w-7 h-7 text-white fill-none stroke-current stroke-2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="7" width="20" height="10" rx="3" />
                            <circle cx="8" cy="12" r="2" />
                            <circle cx="16" cy="12" r="2" />
                            <path d="M10 17a2 2 0 0 1 4 0" />
                            <path d="M12 7V4" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {cat.badgeType === '360' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/65 border border-white/25 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110">
                          <svg
                            className="w-6 h-6 text-white fill-none stroke-current stroke-2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <polyline points="3 3 3 8 8 8" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <polyline points="16 16 21 16 21 21" />
                          </svg>
                          <span className="text-[8px] font-mono tracking-wider font-bold text-white -mt-0.5">
                            360°
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* --------------------------------------------------- */}
                {/* CATEGORY TYPOGRAPHY & DIVIDER LINE                  */}
                {/* --------------------------------------------------- */}
                <div className="text-center flex flex-col items-center w-full px-2">
                  <h3 className={`font-display text-lg sm:text-xl lg:text-2xl font-normal tracking-tight uppercase transition-colors duration-300 ${
                    isSelectedOrHovered ? 'text-white' : 'text-white/70'
                  }`}>
                    {cat.title}
                  </h3>

                  <p className="text-[11px] sm:text-[13px] font-light tracking-wide text-white/70 mt-1">
                    {cat.subtitle}
                  </p>

                  {/* Horizontal line indicator */}
                  <div
                    className={`h-[1.5px] transition-all duration-300 mt-3 ${
                      isSelectedOrHovered
                        ? 'w-10 bg-white/80'
                        : 'w-4 bg-white/10'
                    }`}
                  />
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM CONTROLS: CENTERED ARROWS & ALIGNED EXTREMES        */}
      {/* ------------------------------------------------------------- */}
      <footer className="relative w-full flex items-center justify-between pt-3 sm:pt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-0 border-t border-white/[0.08] z-20 flex-shrink-0 min-h-[48px] sm:min-h-[54px]">
        
        {/* Extreme Left: Quick Jump up to Home */}
        <div className="flex items-center justify-start z-10">
          {onNavigatePrev && (
            <button
              onClick={onNavigatePrev}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1.5 pr-2 group"
              aria-label="Scroll back up to home"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Home</span>
            </button>
          )}
        </div>

        {/* Absolute Center: Navigation Arrows & 4 Pagination Indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 sm:gap-5 z-20 pointer-events-auto">
          {/* Previous Arrow Button */}
          <button
            onClick={handlePrev}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/20 hover:border-white/40 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-90 shadow-sm"
            aria-label="Previous Category"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 4 Pagination Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {WORK_CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSwipeDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  i === highlightedIndex
                    ? 'w-4 sm:w-5 h-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Go to ${cat.title}`}
              />
            ))}
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={handleNext}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/20 hover:border-white/40 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-90 shadow-sm"
            aria-label="Next Category"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Extreme Right: Quick Jump down to About Us */}
        <div className="flex items-center justify-end z-10">
          {onNavigateNext && (
            <button
              onClick={onNavigateNext}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1.5 pl-2 group"
              aria-label="Scroll down to About Us"
            >
              <span>About</span>
              <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          )}
        </div>

      </footer>

      {/* ------------------------------------------------------------- */}
      {/* SCREEN-FILLING BIG FORMAT MASONRY ARCHIVE GALLERY              */}
      {/* ------------------------------------------------------------- */}
      <FullScreenWorkGallery
        isOpen={Boolean(selectedGalleryCategory)}
        initialCategoryId={selectedGalleryCategory?.id || null}
        onClose={() => setSelectedGalleryCategory(null)}
        onInquire={() => {
          setSelectedGalleryCategory(null);
          onInquire?.();
        }}
      />

    </div>
  );
};
