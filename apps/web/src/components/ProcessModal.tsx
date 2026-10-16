import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Box,
  Layers,
  Sun,
  Palette,
  Camera,
  Sparkles,
  Flame,
  Clock,
  MessageSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Curated architectural assets for the process steps
import imgNordic from '../assets/images/arch_hero_nordic_1791042685381.jpg';
import imgTower from '../assets/images/arch_glass_tower_1791046631981.jpg';
import imgKyoto from '../assets/images/arch_kyoto_sanctuary_1791042718246.jpg';
import imgSpiral from '../assets/images/arch_spiral_gallery_1791046607463.jpg';
import imgInterior from '../assets/images/arch_interior_loft_1791042707674.jpg';
import imgDesert from '../assets/images/arch_desert_villa_1791046593942.jpg';
import imgCoastal from '../assets/images/arch_coastal_pool_1791047725968.jpg';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: () => void;
  onOpenFaq?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

interface ProcessStep {
  step: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: '01',
    badge: '01 · DISCOVERY',
    title: 'Discovery & Intent',
    description:
      'We listen to your goals and ideas first so we understand what matters most to you.',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    type: 'brief',
  },
  {
    step: '02',
    badge: '02 · DIRECTION',
    title: 'References & Look Direction',
    description:
      'We look at colors and lighting styles together so you can choose the exact mood you want.',
    icon: <Palette className="w-3.5 h-3.5 text-amber-400" />,
    type: 'moodboard',
  },
  {
    step: '03',
    badge: '03 · EXPLORATION',
    title: 'Model Complete + AI Exploration',
    description:
      'We test different skies, weather, and landscaping to see what makes your building look its best.',
    icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
    type: 'ai-exploration',
  },
  {
    step: '04',
    badge: '04 · FRAMING',
    title: 'Client Review: Angles & Lighting',
    description:
      'We share a few different vantage points so you can pick the views that tell your story.',
    icon: <Camera className="w-3.5 h-3.5 text-sky-400" />,
    type: 'camera-review',
  },
  {
    step: '05',
    badge: '05 · COMPOSITION',
    title: 'Clay Render',
    description:
      'We check the basic shapes and sizes first so the structure feels right before adding any colors.',
    icon: <Box className="w-3.5 h-3.5 text-neutral-300" />,
    type: 'clay',
  },
  {
    step: '06',
    badge: '06 · ATMOSPHERE',
    title: 'General Feeling Stage',
    description:
      'We add natural light and warmth so the space feels welcoming the moment someone looks at it.',
    icon: <Sun className="w-3.5 h-3.5 text-amber-300" />,
    type: 'lighting',
  },
  {
    step: '07',
    badge: '07 · MATERIALITY',
    title: 'Texturing & Material Development',
    description:
      'We bring in your chosen real-world finishes so wood, glass, and stone look true to life.',
    icon: <Layers className="w-3.5 h-3.5 text-rose-400" />,
    type: 'materials',
  },
  {
    step: '08',
    badge: '08 · REFINEMENT',
    title: 'Progress Update / Near-Final Review',
    description:
      'You see an almost-finished draft to make any small tweaks and make sure you love the result.',
    icon: <MessageSquare className="w-3.5 h-3.5 text-amber-400" />,
    type: 'markup',
  },
  {
    step: '09',
    badge: '09 · MASTERING',
    title: 'Final Render & Post-Production',
    description:
      'We polish every detail so you get clean, beautiful images ready to show your clients.',
    icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    type: 'final',
  },
  {
    step: '10',
    badge: '10 · DELIVERY',
    title: 'Timing & Feedback',
    description:
      'We keep in touch every step of the way and always deliver on the day we promised.',
    icon: <Clock className="w-3.5 h-3.5 text-teal-400" />,
    type: 'timeline',
  },
];

export const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  onStartProject,
  onOpenFaq,
  onNavigatePrev,
  onNavigateNext,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isTransitioningRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);

  const handleNext = () => {
    const now = Date.now();
    // Guard against multiple rapid calls per single swipe gesture
    if (isTransitioningRef.current || now - lastSwipeTimeRef.current < 380) return;
    isTransitioningRef.current = true;
    lastSwipeTimeRef.current = now;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % PROCESS_STEPS.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 360);
  };

  const handlePrev = () => {
    const now = Date.now();
    // Guard against multiple rapid calls per single swipe gesture
    if (isTransitioningRef.current || now - lastSwipeTimeRef.current < 380) return;
    isTransitioningRef.current = true;
    lastSwipeTimeRef.current = now;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 360);
  };

  const handleSelectStep = (index: number) => {
    const now = Date.now();
    if (isTransitioningRef.current || now - lastSwipeTimeRef.current < 380) return;
    isTransitioningRef.current = true;
    lastSwipeTimeRef.current = now;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 360);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  const currentStep = PROCESS_STEPS[activeIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 45 : -45,
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 360, damping: 32 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -45 : 45,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 360, damping: 32 },
        opacity: { duration: 0.18 },
      },
    }),
  };

  return (
    <div
      className="relative w-full h-full min-h-screen min-h-[100dvh] flex flex-col justify-between bg-[#0b0b0d]/85 backdrop-blur-2xl text-[#f5f5f7] select-none font-sans overflow-hidden px-4 sm:px-6 md:px-9 py-3 sm:py-5 md:py-8"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER: ALIGNED WITH FIXED TOGGLE BUTTON COORDINATES    */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full flex items-center justify-between pb-2.5 sm:pb-5 border-b border-white/[0.08] z-20 flex-shrink-0">
        
        {/* Left: Spacer matching navigation toggle + Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />
          <div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
              Creative Process
            </h1>
          </div>
        </div>

        {/* Right: Step Indicator & Close Button */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 tracking-widest uppercase">
            <span>Step</span>
            <span className="text-white font-medium">{currentStep.step}</span>
            <span>/</span>
            <span>{PROCESS_STEPS.length}</span>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
            aria-label="Close Creative Process"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CENTER: 1/3 WRITE-UP & 2/3 VISUAL STAGE               */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full flex-1 min-h-0 relative my-auto py-2 sm:py-3 flex flex-col justify-center overflow-hidden">
        
        {/* Swipeable Canvas covering both PC (mouse drag) and Mobile (touch) */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep.step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              if (offset < -35 || velocity < -260) {
                handleNext();
              } else if (offset > 35 || velocity > 260) {
                handlePrev();
              }
            }}
            className="w-full h-full max-w-[1720px] mx-auto flex flex-col lg:flex-row items-center justify-between lg:gap-10 xl:gap-12 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* ------------------------------------------------------- */}
            {/* WRITE-UP: ~1/3 OF SPACE (Top on Mobile, Left on Desktop)*/}
            {/* ------------------------------------------------------- */}
            <div className="w-full lg:w-[32%] xl:w-[30%] flex-shrink-0 flex flex-col justify-center min-h-[28%] max-h-[35%] lg:min-h-0 lg:max-h-none space-y-1.5 xs:space-y-2 sm:space-y-3.5 lg:space-y-5 px-1 lg:pr-4">
              
              {/* Step Badge */}
              <div>
                <div className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/[0.05] border border-white/10 mb-1 sm:mb-2.5">
                  <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/75">
                    {currentStep.badge}
                  </span>
                </div>

                <h2 className="font-display text-lg xs:text-xl sm:text-2xl lg:text-4xl font-normal tracking-tight text-white leading-tight">
                  {currentStep.title}
                </h2>
              </div>

              {/* Highly Legible Description */}
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed line-clamp-3 xs:line-clamp-4 lg:line-clamp-none">
                {currentStep.description}
              </p>

              {/* Advance Shortcut Hint (Desktop & larger mobile screens) */}
              <div className="pt-0.5 sm:pt-1 hidden xs:flex items-center justify-between">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer group py-0.5"
                >
                  <span>Next: Step {String(((activeIndex + 1) % PROCESS_STEPS.length) + 1).padStart(2, '0')}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>

                <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest hidden sm:inline">
                  Swipe horizontally to navigate
                </span>
              </div>
            </div>

            {/* Little Negative Space Divider on Mobile */}
            <div className="w-full h-2 xs:h-3 lg:hidden flex-shrink-0" aria-hidden="true" />

            {/* ------------------------------------------------------- */}
            {/* SUPPORTING VISUAL: ~2/3 OF SPACE (Bottom on Mobile, Right on Desktop) */}
            {/* Consistent aspect ratio [16/10] matching Step 05 reference across all slides */}
            {/* ------------------------------------------------------- */}
            <div className="w-full flex-1 min-h-0 lg:w-[68%] xl:w-[70%] h-full flex items-center justify-center relative">
              <div className="w-full aspect-[16/10] max-h-[56vh] lg:max-h-[64vh] xl:max-h-[68vh] rounded-2xl overflow-hidden border border-white/12 bg-[#121215] shadow-2xl relative flex items-center justify-center select-none">
                
                {/* 01: Project Brief Checklist on Architectural Canvas */}
                {currentStep.type === 'brief' && (
                  <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 sm:p-7 lg:p-9 bg-[#131317]">
                    <img
                      src={imgNordic}
                      alt="Project Discovery & Brief Scope Canvas"
                      className="absolute inset-0 w-full h-full object-cover filter brightness-[0.25] contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-display text-sm sm:text-base lg:text-lg font-medium text-white tracking-wide">
                          Project Discovery & Scope Architecture
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-xs font-mono text-emerald-400 uppercase tracking-widest">
                        PHASE 01
                      </span>
                    </div>

                    {/* Discovery Checklist: Single column of 6 rows filling container height */}
                    <div className="relative z-10 flex flex-col justify-between flex-1 py-3 sm:py-4 my-auto gap-2 sm:gap-2.5">
                      {[
                        { label: 'Architectural Vision', status: 'Defined' },
                        { label: 'Target Audience (Buyers / Investors)', status: 'Identified' },
                        { label: 'Stills & Films Deliverables', status: 'Approved' },
                        { label: 'Key Narrative Moments', status: 'Clarified' },
                        { label: '8K Native Master Output', status: 'Specified' },
                        { label: 'Turnaround Milestones', status: 'Locked' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3.5 sm:px-5 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-black/65 backdrop-blur-md border border-white/[0.1] hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 text-white min-w-0">
                            <span className="font-sans text-xs sm:text-sm lg:text-base font-normal text-white/95 truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs lg:text-sm uppercase font-mono tracking-wider sm:tracking-widest text-emerald-400 font-medium ml-3 flex-shrink-0">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="relative z-10 text-[10px] sm:text-xs lg:text-sm font-mono text-white/45 uppercase tracking-[0.18em] sm:tracking-[0.22em] text-center pt-2 sm:pt-2.5 border-t border-white/[0.08]">
                      Clear discovery sets the foundation for zero wasted revisions.
                    </div>
                  </div>
                )}

                {/* 02: References & Look Direction (Multiple Images filling container) */}
                {currentStep.type === 'moodboard' && (
                  <div className="w-full h-full grid grid-cols-12 gap-0 overflow-hidden relative">
                    {/* Primary reference - 64% width */}
                    <div className="col-span-8 h-full relative overflow-hidden border-r border-white/10 group">
                      <img
                        src={imgDesert}
                        alt="Primary Look Direction: Warm Twilight Cantilever"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-white">
                        Primary Reference · Warm Twilight Cantilever
                      </div>
                    </div>

                    {/* Secondary references - 36% width stacked */}
                    <div className="col-span-4 h-full flex flex-col">
                      <div className="h-1/2 relative overflow-hidden border-b border-white/10 group">
                        <img
                          src={imgKyoto}
                          alt="Material Reference: Natural Cedar Light"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] sm:text-xs font-mono text-white">
                          Natural Cedar Light
                        </div>
                      </div>
                      <div className="h-1/2 relative overflow-hidden group">
                        <img
                          src={imgSpiral}
                          alt="Material Reference: Honed Travertine"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] sm:text-xs font-mono text-white">
                          Honed Travertine
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 03: Model Complete + AI Exploration (Multiple Images side-by-side) */}
                {currentStep.type === 'ai-exploration' && (
                  <div className="w-full h-full grid grid-cols-2 gap-0 overflow-hidden relative">
                    {/* Left: 3D Viewport Geometry */}
                    <div className="h-full relative overflow-hidden border-r border-white/15 bg-[#141518] flex flex-col justify-between">
                      <img
                        src={imgDesert}
                        alt="3D CAD Viewport Geometry"
                        className="w-full h-full object-cover filter grayscale contrast-200 brightness-90 opacity-75"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono text-blue-300">
                        3D CAD Viewport Geometry
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono text-white/80">
                        CAD / Revit / Rhino Wireframe
                      </div>
                    </div>

                    {/* Right: AI Atmosphere Exploration */}
                    <div className="h-full relative overflow-hidden bg-[#161424]">
                      <img
                        src={imgCoastal}
                        alt="AI Atmosphere Exploration"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-indigo-950/85 backdrop-blur-md border border-indigo-500/30 text-[10px] sm:text-xs font-mono text-indigo-300">
                        AI Atmosphere Exploration
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono text-white/80">
                        Rapid Environment Variations
                      </div>
                    </div>
                  </div>
                )}

                {/* 04: Client Review: Angles & Lighting (3 Images side-by-side) */}
                {currentStep.type === 'camera-review' && (
                  <div className="w-full h-full grid grid-cols-3 gap-0 overflow-hidden relative">
                    {[
                      { img: imgNordic, label: 'Angle A · Pedestrian Approach', chosen: true },
                      { img: imgTower, label: 'Angle B · Skyline Twilight', chosen: false },
                      { img: imgCoastal, label: 'Angle C · 45° Corner Horizon', chosen: false },
                    ].map((cam, idx) => (
                      <div
                        key={idx}
                        className={`h-full relative overflow-hidden group ${
                          idx < 2 ? 'border-r border-white/15' : ''
                        }`}
                      >
                        <img
                          src={cam.img}
                          alt={cam.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
                        
                        {cam.chosen && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400 text-sky-300 text-[10px] sm:text-xs font-mono backdrop-blur-md">
                            Approved Angle
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15">
                          <span className="text-[10px] sm:text-xs font-mono text-white block truncate">
                            {cam.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 05: Clay Render (Reference Image from user - pure full-bleed image in container) */}
                {currentStep.type === 'clay' && (
                  <div className="w-full h-full relative overflow-hidden group">
                    <img
                      src={imgCoastal}
                      alt="Clay Render: Pure Monochrome Architectural Massing Study"
                      className="w-full h-full object-cover filter grayscale contrast-125 brightness-95"
                    />
                  </div>
                )}

                {/* 06: General Feeling Stage (Pure full-bleed image in container) */}
                {currentStep.type === 'lighting' && (
                  <div className="w-full h-full relative overflow-hidden group">
                    <img
                      src={imgInterior}
                      alt="General Feeling Stage: Directional Sunlight & Atmosphere"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 07: Texturing & Material Development */}
                {currentStep.type === 'materials' && (
                  <div className="w-full h-full relative overflow-hidden group">
                    <img
                      src={imgSpiral}
                      alt="Continuous Scene: Material Development"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 flex flex-col gap-1 text-[8px] sm:text-xs font-mono text-white/90 shadow-2xl">
                      <span className="text-[7px] sm:text-[9.5px] uppercase tracking-widest text-white/40">
                        Physical Shaders:
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-700" />
                        French Oak
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-300" />
                        Roman Travertine
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-neutral-200" />
                        Linen Bouclé
                      </span>
                    </div>
                  </div>
                )}

                {/* 08: Progress Update / Near-Final Review */}
                {currentStep.type === 'markup' && (
                  <div className="w-full h-full relative overflow-hidden group">
                    <img
                      src={imgDesert}
                      alt="Continuous Scene: Near-Final Client Review"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-10 left-6 px-3 py-1.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 text-[9px] sm:text-xs font-mono backdrop-blur-md shadow-2xl">
                      <span>Warmer accent lighting here</span>
                    </div>
                    <div className="absolute bottom-12 right-6 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-[9px] sm:text-xs font-mono backdrop-blur-md shadow-2xl">
                      <span>Travertine texture approved</span>
                    </div>
                  </div>
                )}

                {/* 09: Final Render & Post-Production */}
                {currentStep.type === 'final' && (
                  <div className="w-full h-full relative overflow-hidden group">
                    <img
                      src={imgTower}
                      alt="Continuous Scene: Final 8K Master Render"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-white text-black font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider">
                        8K Native Master · ACES Linear Color
                      </span>
                      <span className="text-[8.5px] sm:text-xs font-mono text-white/60 hidden sm:inline">
                        100% Polish Delivered
                      </span>
                    </div>
                  </div>
                )}

                {/* 10: Timing & Feedback Roadmap */}
                {currentStep.type === 'timeline' && (
                  <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 sm:p-7 lg:p-9 bg-[#131317]">
                    <img
                      src={imgTower}
                      alt="Timeline Background"
                      className="absolute inset-0 w-full h-full object-cover filter brightness-[0.25] contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
                      <div>
                        <span className="font-display text-sm sm:text-base lg:text-lg font-medium text-white tracking-wide block">
                          Production Timeline Roadmap
                        </span>
                        <span className="text-xs font-light text-white/60">
                          Structured milestones ensure predictable delivery.
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-teal-400 uppercase tracking-widest">
                        TYPICAL 2 WEEKS
                      </span>
                    </div>

                    {/* Timeline Milestones: Rows filling container height with comfortable spacing & larger text */}
                    <div className="relative z-10 flex flex-col justify-between flex-1 py-3 sm:py-4 my-auto gap-2 sm:gap-2.5">
                      {[
                        { step: '01', phase: 'Brief & Discovery Goals', duration: '1–2 Days' },
                        { step: '02', phase: 'Exploration & Camera Angle Selection', duration: '2–4 Days' },
                        { step: '03', phase: 'Development & High-Detail Texturing', duration: '3–7 Days' },
                        { step: '04', phase: 'Collaborative Progress Review', duration: '1–3 Days' },
                        { step: '05', phase: 'Final 8K Master Production & Delivery', duration: '1–2 Days' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl bg-black/65 backdrop-blur-md border border-white/[0.1] hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 truncate">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-[10px] sm:text-xs font-mono font-medium flex-shrink-0">
                              {item.step}
                            </span>
                            <span className="text-white/95 font-sans text-xs sm:text-sm lg:text-base font-normal truncate">
                              {item.phase}
                            </span>
                          </div>
                          <span className="text-teal-400 font-mono text-[10px] sm:text-xs lg:text-sm font-medium ml-3 flex-shrink-0 tracking-wide">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onStartProject();
                      }}
                      className="relative z-10 w-full h-11 sm:h-12 lg:h-13 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer flex-shrink-0 mt-1"
                    >
                      Start Your Project Workflow →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER: STEP PILLS & NAVIGATION CONTROLS             */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full flex items-center justify-between pt-2.5 sm:pt-5 border-t border-white/[0.08] z-20 gap-2 sm:gap-4 flex-shrink-0">
        
        {/* Left: Quick Jump up to Clients */}
        <div className="flex items-center">
          {onNavigatePrev && (
            <button
              onClick={onNavigatePrev}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
              aria-label="Back to Our Clients"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Clients</span>
            </button>
          )}
        </div>

        {/* Center: Slide Switcher (Step indicator on mobile, 10 pills on desktop) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Previous step button */}
          <button
            onClick={handlePrev}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/50 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer active:scale-95 flex-shrink-0"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* MOBILE STEP INDICATOR: Step 03 / 10 */}
          <div className="sm:hidden px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono tracking-wider text-white">
            <span>Step {currentStep.step} / {PROCESS_STEPS.length}</span>
          </div>

          {/* DESKTOP 10 Step Pills (01 to 10) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {PROCESS_STEPS.map((step, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={step.step}
                  onClick={() => handleSelectStep(idx)}
                  className={`px-3 py-1.5 rounded-full text-[14.4px] font-mono transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm scale-105'
                      : 'bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                  aria-label={`Jump to Step ${step.step}: ${step.title}`}
                >
                  {step.step}
                </button>
              );
            })}
          </div>

          {/* Next step button */}
          <button
            onClick={handleNext}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/50 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer active:scale-95 flex-shrink-0"
            aria-label="Next step"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Continue down to FAQ */}
        <div className="flex items-center">
          {(onNavigateNext || onOpenFaq) && (
            <button
              onClick={() => {
                if (onNavigateNext) onNavigateNext();
                else if (onOpenFaq) {
                  onClose();
                  onOpenFaq();
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
              aria-label="Navigate down to FAQ"
            >
              <span>FAQ</span>
              <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
