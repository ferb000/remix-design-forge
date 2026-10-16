/**
 * FullScreenWorkGallery - Architectural Photo Grid & Full-Screen Swipeable Viewer
 * Displays renders and projects in their original natural aspect ratios in a clean photo grid.
 * Selecting any project opens a full-screen view with swipe-over navigation on mobile and desktop.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowLeft,
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';

import imgNordic from '../assets/images/arch_hero_nordic_1791042685381.jpg';
import imgMonolith from '../assets/images/arch_monolith_museum_1791042697346.jpg';
import imgInterior from '../assets/images/arch_interior_loft_1791042707674.jpg';
import imgKyoto from '../assets/images/arch_kyoto_sanctuary_1791042718246.jpg';
import imgModular from '../assets/images/arch_modular_apartments_1791047740832.jpg';
import imgDesert from '../assets/images/arch_desert_villa_1791046593942.jpg';
import imgCoastalPool from '../assets/images/arch_coastal_pool_1791047725968.jpg';
import imgAlpine from '../assets/images/arch_alpine_chalet_1791046619292.jpg';
import imgTower from '../assets/images/arch_glass_tower_1791046631981.jpg';
import imgSpiral from '../assets/images/arch_spiral_gallery_1791046607463.jpg';
import imgRooftop from '../assets/images/arch_rooftop_panoramic_1791047753250.jpg';
import imgVillaDusk from '../assets/images/arch_desert_villa_1791046593942.jpg';

export interface GalleryProject {
  id: string;
  category: 'still-images' | 'animations' | 'vr' | '360-panoramas';
  title: string;
  architect: string;
  location: string;
  year: string;
  image: string;
  badge?: string;
  description: string;
}

export const ALL_GALLERY_PROJECTS: GalleryProject[] = [
  // --- STILL IMAGES ---
  {
    id: 'still-vmx-boogie',
    category: 'still-images',
    title: 'Boogie Woogie Urban Quarters',
    architect: 'VMX Architects',
    location: 'Amsterdam, Netherlands',
    year: '2026',
    image: imgModular,
    description: 'A vibrant residential masterplan interweaving textured brick facades, tree-lined pedestrian avenues, and crisp contemporary towers.',
  },
  {
    id: 'still-taipei-skyline',
    category: 'still-images',
    title: 'Metropolitan Twilight Tower',
    architect: 'Foster + Partners',
    location: 'Taipei, Taiwan',
    year: '2026',
    image: imgTower,
    description: 'Atmospheric twilight cityscape capturing the interplay between the glowing urban artery, monolithic towers, and misty mountain backdrop.',
  },
  {
    id: 'still-terminal-canopy',
    category: 'still-images',
    title: 'High-Speed Railway Terminal Canopy',
    architect: 'Zaha Hadid Architects',
    location: 'Chengdu, China',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2200&q=85',
    description: 'Sculptural branching timber-copper canopy spanning the active railway concourse, diffusing natural northern skylight across passenger platforms.',
  },
  {
    id: 'still-courtyard-terrace',
    category: 'still-images',
    title: 'Terraced Woodland School & Residences',
    architect: 'Snøhetta & COBE',
    location: 'Oslo, Norway',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    description: 'Stepped bio-diverse rooftop gardens connecting down to a central community courtyard featuring preserved pines and play slides.',
  },
  {
    id: 'still-nordic-cantilever',
    category: 'still-images',
    title: 'Nordic Basalt Cantilever Villa',
    architect: 'Snøhetta Studio',
    location: 'Vestland, Norway',
    year: '2026',
    image: imgNordic,
    description: 'Monolithic dark basalt slabs projecting outward over mirror-smooth fjord waters during morning sea mist.',
  },
  {
    id: 'still-manhattan-penthouse',
    category: 'still-images',
    title: 'Manhattan Sky Salon Penthouse',
    architect: 'Studio Liaigre',
    location: 'Tribeca, New York',
    year: '2025',
    image: imgInterior,
    description: 'Double-height private living space framing the Manhattan skyline with fluted nero marquina hearth and bespoke oiled timber joinery.',
  },
  {
    id: 'still-amangiri-sanctuary',
    category: 'still-images',
    title: 'Amangiri Basalt Sanctuary',
    architect: 'Rick Joy Architects',
    location: 'Canyon Point, Utah',
    year: '2025',
    image: imgDesert,
    description: 'Earthy textured concrete pavilion embedded seamlessly into the desert sandstone plateau at golden hour.',
  },
  {
    id: 'still-timber-pavilion',
    category: 'still-images',
    title: 'Arashiyama Water Pavilion',
    architect: 'Kengo Kuma & Associates',
    location: 'Kyoto, Japan',
    year: '2026',
    image: imgKyoto,
    description: 'Delicate charred cedar louvers and dark granite reflection pools shrouded in ambient morning mist.',
  },
  {
    id: 'still-monolith-art',
    category: 'still-images',
    title: 'Monolith Museum of Contemporary Art',
    architect: 'Tadao Ando',
    location: 'Lugano, Switzerland',
    year: '2026',
    image: imgMonolith,
    description: 'Smooth cast concrete volumes framing natural light portals and reflecting pools.',
  },
  {
    id: 'still-alpine-retreat',
    category: 'still-images',
    title: 'Alpine High-Altitude Chalet',
    architect: 'Peter Zumthor',
    location: 'St. Moritz, Switzerland',
    year: '2025',
    image: imgAlpine,
    description: 'Massive local gneiss stone walls with panoramic thermal glass gazing upon the Engadin valley.',
  },

  // --- ANIMATIONS ---
  {
    id: 'anim-coastal-sunset',
    category: 'animations',
    title: 'Coastal Sunset Infinity Terrace Film',
    architect: 'Tadao Ando Architect',
    location: 'Ticino, Switzerland',
    year: '2026',
    badge: 'Film',
    image: imgCoastalPool,
    description: 'Cinematic drone choreography sweeping from the alpine slopes across the infinity pool edge at golden hour.',
  },
  {
    id: 'anim-monolith-motion',
    category: 'animations',
    title: 'Monolith Solar Pavilion Walkthrough',
    architect: 'Tadao Ando Studio',
    location: 'Lugano, Switzerland',
    year: '2026',
    badge: 'Film',
    image: imgMonolith,
    description: 'Continuous movement exploring the shadow shifts across curved travertine walls throughout a single day.',
  },
  {
    id: 'anim-alpine-chalet',
    category: 'animations',
    title: 'Alpine Chalet Twilight Motion',
    architect: 'Peter Zumthor Studio',
    location: 'St. Moritz, Switzerland',
    year: '2026',
    badge: 'Film',
    image: imgAlpine,
    description: 'Gentle snowfall simulation with interior hearth fireglow illuminating floor-to-ceiling panoramic glass.',
  },
  {
    id: 'anim-botanical-spire',
    category: 'animations',
    title: 'Madison Botanical Spire Flythrough',
    architect: 'Foster + Partners',
    location: 'Manhattan, New York',
    year: '2025',
    badge: 'Film',
    image: imgTower,
    description: 'Dramatic vertical camera rise along the crystalline facade, piercing through early morning cloud layers.',
  },
  {
    id: 'anim-desert-villa',
    category: 'animations',
    title: 'Dusk Villa Poolside Journey',
    architect: 'Rick Joy Studio',
    location: 'Palm Springs, California',
    year: '2026',
    badge: 'Film',
    image: imgVillaDusk,
    description: 'Transition from sunset amber to deep blue twilight with synchronized architectural lighting sequences.',
  },
  {
    id: 'anim-modular-living',
    category: 'animations',
    title: 'Canalside Quarter Architectural Short',
    architect: 'VMX Architects',
    location: 'Amsterdam, Netherlands',
    year: '2026',
    badge: 'Film',
    image: imgModular,
    description: 'Atmospheric motion piece capturing pedestrian movement and changing natural light across timber facades.',
  },

  // --- VR (VIRTUAL REALITY) ---
  {
    id: 'vr-kunsthalle-twin',
    category: 'vr',
    title: 'Kunsthalle Virtual Reality Twin',
    architect: 'Herzog & de Meuron',
    location: 'Basel, Switzerland',
    year: '2026',
    badge: 'VR',
    image: imgSpiral,
    description: 'Complete real-time spatial digital twin enabling freeform spatial navigation and acoustic audio simulation.',
  },
  {
    id: 'vr-botanical-penthouse',
    category: 'vr',
    title: 'Botanical Penthouse Real-Time Twin',
    architect: 'Foster + Partners',
    location: 'Tribeca, New York',
    year: '2026',
    badge: 'VR',
    image: imgInterior,
    description: 'Interactive material customization portal allowing clients to swap marble varieties, wood finishes, and lighting fixtures live.',
  },
  {
    id: 'vr-nordic-nanite',
    category: 'vr',
    title: 'Nordic Basalt Digital Twin',
    architect: 'Design Forge Labs',
    location: 'Vestland, Norway',
    year: '2026',
    badge: 'VR',
    image: imgNordic,
    description: 'High-fidelity spatial twin with realistic water caustics and interactive ambient daylight.',
  },
  {
    id: 'vr-modular-complex',
    category: 'vr',
    title: 'Timber Modular Living Simulator',
    architect: 'Lund Hagem Arkitekter',
    location: 'Copenhagen, Denmark',
    year: '2025',
    badge: 'VR',
    image: imgModular,
    description: 'Modular unit configuration app: walk through floorplans, configure balcony layouts, and assess solar exposure.',
  },

  // --- 360 PANORAMAS ---
  {
    id: 'pano-rooftop-horizon',
    category: '360-panoramas',
    title: 'Rooftop Horizon 360° Panoramic Tour',
    architect: 'Rick Joy Architects',
    location: 'Canyon Point, Utah',
    year: '2026',
    badge: '360°',
    image: imgRooftop,
    description: 'Spherical panoramic capture positioned at the cantilevered edge of the rooftop lounge overlooking the desert expanse.',
  },
  {
    id: 'pano-arashiyama-water',
    category: '360-panoramas',
    title: 'Arashiyama Water Pavilion 360°',
    architect: 'Kengo Kuma & Associates',
    location: 'Kyoto, Japan',
    year: '2026',
    badge: '360°',
    image: imgKyoto,
    description: 'Immersive viewpoint hovering directly above the dark reflecting pond surrounded by bamboo groves.',
  },
  {
    id: 'pano-manhattan-skyline',
    category: '360-panoramas',
    title: 'Tribeca High-Rise 360° Balcony',
    architect: 'Studio Liaigre',
    location: 'Tribeca, New York',
    year: '2025',
    badge: '360°',
    image: imgInterior,
    description: 'Seamless horizon panorama connecting the interior living room out to the wraparound terrace overlooking Lower Manhattan.',
  },
  {
    id: 'pano-coastal-villa',
    category: '360-panoramas',
    title: 'Lugano Lakeside 360° Vantage',
    architect: 'Tadao Ando Architect',
    location: 'Lugano, Switzerland',
    year: '2026',
    badge: '360°',
    image: imgCoastalPool,
    description: 'Unobstructed twilight perspective floating between the glass living volume and the lake water horizon.',
  },
];

export const CATEGORY_TABS = [
  { id: 'still-images', label: 'Still Images' },
  { id: 'animations', label: 'Animations' },
  { id: 'vr', label: 'VR' },
  { id: '360-panoramas', label: '360 Panoramas' },
  { id: 'all', label: 'All Works' },
];

interface FullScreenWorkGalleryProps {
  isOpen: boolean;
  initialCategoryId?: string | null;
  onClose: () => void;
  onInquire: () => void;
}

export const FullScreenWorkGallery: React.FC<FullScreenWorkGalleryProps> = ({
  isOpen,
  initialCategoryId,
  onClose,
  onInquire,
}) => {
  const { projects } = useStudioData();
  const allProjects = projects;

  const [selectedFilter, setSelectedFilter] = useState<string>('still-images');
  const [activeLightboxProject, setActiveLightboxProject] = useState<GalleryProject | null>(null);
  const [lightboxDirection, setLightboxDirection] = useState<1 | -1>(1);

  // Sync category filter when opened with a specific category
  useEffect(() => {
    if (initialCategoryId) {
      setSelectedFilter(initialCategoryId);
    } else {
      setSelectedFilter('still-images');
    }
  }, [initialCategoryId, isOpen]);

  // Filter projects according to tab
  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'all') return allProjects;
    return allProjects.filter((p) => p.category === selectedFilter);
  }, [selectedFilter, allProjects]);

  // Lightbox traversal
  const handleNextLightbox = () => {
    if (!activeLightboxProject || filteredProjects.length === 0) return;
    const currentIndex = filteredProjects.findIndex((p) => p.id === activeLightboxProject.id);
    const nextIndex = (currentIndex + 1) % filteredProjects.length;
    setLightboxDirection(1);
    setActiveLightboxProject(filteredProjects[nextIndex]);
  };

  const handlePrevLightbox = () => {
    if (!activeLightboxProject || filteredProjects.length === 0) return;
    const currentIndex = filteredProjects.findIndex((p) => p.id === activeLightboxProject.id);
    const prevIndex = (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setLightboxDirection(-1);
    setActiveLightboxProject(filteredProjects[prevIndex]);
  };

  // Keyboard navigation for lightbox & close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeLightboxProject) {
          setActiveLightboxProject(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && activeLightboxProject) {
        handleNextLightbox();
      } else if (e.key === 'ArrowLeft' && activeLightboxProject) {
        handlePrevLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeLightboxProject, onClose, filteredProjects]);

  // Touch gesture handling for mobile full-screen swipe over
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current !== null ? Math.abs(touchStartYRef.current - touchEndY) : 0;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Horizontal swipe threshold: 35px, predominantly horizontal
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        handleNextLightbox(); // Swiped left -> Next
      } else {
        handlePrevLightbox(); // Swiped right -> Previous
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="fullscreen-work-gallery"
      role="dialog"
      aria-modal="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[80] bg-[#0a0a0c] text-[#f5f5f7] flex flex-col font-sans select-none overflow-y-auto overscroll-contain"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. STICKY TOP CONTROLS & CATEGORY BAR                         */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 md:px-9 py-3 sm:py-4 flex flex-col gap-3 shadow-2xl">
        
        {/* Top Row: Spacing alignment with fixed toggle button + Back & Close actions */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Transparent spacer matching fixed navigation toggle button */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />
            
            {/* Dedicated Back to Our Work Button */}
            <button
              onClick={onClose}
              className="group flex items-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/15 transition-all cursor-pointer text-[14.4px] sm:text-[16.8px] font-medium tracking-wider shadow-sm flex-shrink-0"
              aria-label="Back to Our Work page"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back To Our Work</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Counter badge: indicates number of pictures available in this category */}
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white/70 tracking-widest uppercase">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
            </span>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              aria-label="Close archive gallery"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs & Mobile Count */}
        <div className="w-full flex items-center justify-between gap-3 pt-1">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedFilter === tab.id;
              const count = tab.id === 'all' 
                ? allProjects.length 
                : allProjects.filter((p) => p.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`h-10 px-4 rounded-xl text-[14.4px] sm:text-[16.8px] font-medium tracking-wider transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[14.4px] font-mono ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Mobile counter indicator */}
          <span className="sm:hidden text-[11px] font-mono text-white/50 tracking-wider flex-shrink-0">
            {filteredProjects.length} Works
          </span>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. PHOTO GRID DISPLAY (ORIGINAL ASPECT RATIOS & ZERO CLUTTER) */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full flex-1 px-4 sm:px-6 md:px-9 py-4 sm:py-6">
        {/* Responsive Photo Grid: Renders in original aspect ratios */}
        <div className="columns-1 xs:columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5 pb-24">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              onClick={() => setActiveLightboxProject(project)}
              className="break-inside-avoid relative group rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 bg-[#121215] shadow-lg cursor-pointer transition-all duration-300 block transform-gpu"
            >
              {/* Image in its original natural aspect ratio */}
              <div className="relative w-full overflow-hidden bg-black/60">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out block"
                />

                {/* If it's an Animation: Show play button icon */}
                {project.category === 'animations' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 border border-white/30 backdrop-blur-md flex items-center justify-center pl-0.5 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
                    </div>
                  </div>
                )}

                {/* VR / 360 Badge if applicable */}
                {project.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-[9px] font-mono tracking-wider text-white uppercase backdrop-blur-md">
                      {project.badge}
                    </span>
                  </div>
                )}

                {/* Clean Caption Overlay on Hover & Touch */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end pointer-events-none">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/60">
                    {project.architect} · {project.location}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate mt-0.5">
                    {project.title}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. FULL SCREEN VIEW WITH SWIPE-OVER NAVIGATION                */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeLightboxProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none"
            onClick={() => setActiveLightboxProject(null)}
          >
            {/* Top Full Screen Header */}
            <div
              className="w-full flex items-center justify-between z-20 pb-3 border-b border-white/10 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 sm:gap-4 pr-4 min-w-0">
                {/* Spacer to shift title to the right so fixed hamburger menu icon never overlaps */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0" aria-hidden="true" />

                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 block truncate">
                    {activeLightboxProject.architect} · {activeLightboxProject.location}
                  </span>
                  <h2 className="font-display text-base sm:text-2xl font-bold uppercase tracking-wider text-white mt-0.5 truncate max-w-xl">
                    {activeLightboxProject.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveLightboxProject(null);
                    onClose();
                    onInquire();
                  }}
                  className="hidden xs:inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Commission Similar
                </button>

                <button
                  onClick={() => setActiveLightboxProject(null)}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                  aria-label="Close full screen view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Canvas: Full Screen Media Frame with Swipe Gesture */}
            <div
              className="relative w-full flex-1 my-2 sm:my-4 flex items-center justify-center overflow-hidden touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Prev Button (Desktop & Tablet) */}
              <button
                onClick={handlePrevLightbox}
                className="hidden sm:flex absolute left-2 md:left-4 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/70 hover:bg-black border border-white/25 items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-2xl active:scale-95"
                aria-label="Previous Project (Arrow Left or Swipe Right)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Media with smooth slide transition and drag gesture support */}
              <AnimatePresence custom={lightboxDirection} mode="wait">
                <motion.div
                  key={activeLightboxProject.id}
                  custom={lightboxDirection}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 80 : -80,
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                    },
                    exit: (dir: number) => ({
                      x: dir > 0 ? -80 : 80,
                      opacity: 0,
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40 || info.velocity.x < -200) {
                      handleNextLightbox();
                    } else if (info.offset.x > 40 || info.velocity.x > 200) {
                      handlePrevLightbox();
                    }
                  }}
                  className="relative max-w-full max-h-[78vh] sm:max-h-[82vh] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl bg-black flex items-center justify-center select-none"
                >
                  <img
                    src={activeLightboxProject.image}
                    alt={activeLightboxProject.title}
                    className="max-w-full max-h-[78vh] sm:max-h-[82vh] w-auto h-auto object-contain pointer-events-none"
                  />

                  {/* Play Icon for animations in full screen */}
                  {activeLightboxProject.category === 'animations' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl pl-1">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Next Button (Desktop & Tablet) */}
              <button
                onClick={handleNextLightbox}
                className="hidden sm:flex absolute right-2 md:right-4 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/70 hover:bg-black border border-white/25 items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-2xl active:scale-95"
                aria-label="Next Project (Arrow Right or Swipe Left)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Full Screen Footer: Counter, Description, Mobile Swipe Prompt */}
            <div
              className="w-full pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-20 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl text-left">
                <p className="text-sm sm:text-base text-neutral-200 font-light leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {activeLightboxProject.description}
                </p>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 text-xs font-mono text-white/50 uppercase tracking-widest flex-shrink-0">
                <span className="sm:hidden text-[10px] text-white/40 tracking-wider">
                  ← Swipe to browse →
                </span>
                
                <span className="text-white/80 font-semibold">
                  {filteredProjects.findIndex((p) => p.id === activeLightboxProject.id) + 1} / {filteredProjects.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
