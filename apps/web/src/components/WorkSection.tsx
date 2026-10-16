import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Maximize2,
  X,
  Layers,
  Sparkles,
  Eye,
  Film,
  Compass,
  Box,
} from 'lucide-react';
import {
  WORK_CATEGORIES,
  WORK_PROJECTS,
  CategoryDeck,
  WorkProject,
  CLIENT_PARTNERS,
} from '../data/workData';

interface WorkSectionProps {
  onClose?: () => void;
  onSelectProjectForHero?: (project: WorkProject) => void;
  onScheduleCall?: () => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  onClose,
  onSelectProjectForHero,
  onScheduleCall,
}) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
  const [expandedCategoryGallery, setExpandedCategoryGallery] = useState<CategoryDeck | null>(null);

  const activeCategory: CategoryDeck = WORK_CATEGORIES[activeCategoryIndex];

  // Keyboard navigation for categories
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        if (selectedProject) setSelectedProject(null);
        else if (expandedCategoryGallery) setExpandedCategoryGallery(null);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, expandedCategoryGallery, onClose]);

  const handleNext = () => {
    setActiveCategoryIndex(prev => (prev + 1) % WORK_CATEGORIES.length);
  };

  const handlePrev = () => {
    setActiveCategoryIndex(prev => (prev - 1 + WORK_CATEGORIES.length) % WORK_CATEGORIES.length);
  };

  // Category Icon helper
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'still-images':
        return <Eye className="w-3.5 h-3.5" />;
      case 'animations':
        return <Film className="w-3.5 h-3.5" />;
      case '360-panoramas':
        return <Compass className="w-3.5 h-3.5" />;
      case 'virtual-reality':
        return <Box className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  // Fan card layout calculator for 3-4 cards in a stack
  const getCardFanTransforms = (cardIdx: number, totalCards: number, isFanned: boolean) => {
    if (!isFanned) {
      // Resting stacked deck with subtle natural rotational offset
      const restingRotations = [-4, -1, 3, 6];
      const restingY = [0, 2, 4, 6];
      const restingX = [0, 0, 0, 0];
      return {
        rotate: restingRotations[cardIdx] || 0,
        x: restingX[cardIdx] || 0,
        y: restingY[cardIdx] || 0,
        scale: 1 - cardIdx * 0.02,
        zIndex: totalCards - cardIdx,
      };
    }

    // Fanned-out playing card spread
    // 3 cards vs 4 cards spacing
    if (totalCards === 3) {
      const fannedRotations = [-10, 0, 10];
      const fannedX = [-75, 0, 75];
      const fannedY = [-6, -10, -6];
      return {
        rotate: fannedRotations[cardIdx] || 0,
        x: fannedX[cardIdx] || 0,
        y: fannedY[cardIdx] || 0,
        scale: 1.02,
        zIndex: 10 + cardIdx,
      };
    }

    // 4 cards fanned spread
    const fannedRotations = [-14, -5, 5, 14];
    const fannedX = [-88, -28, 32, 92];
    const fannedY = [-6, -12, -12, -6];
    return {
      rotate: fannedRotations[cardIdx] || 0,
      x: fannedX[cardIdx] || 0,
      y: fannedY[cardIdx] || 0,
      scale: 1.03,
      zIndex: 10 + cardIdx,
    };
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0d0d0d] text-[#f5f5f7] py-12 px-4 sm:px-8 md:px-14 overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: TOP HEADER & CONTROLS                              */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between pb-8 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/40">
              Curated Portfolio · Q1 2026
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
            Our Work
          </h2>
        </div>

        {/* Minimal Category Tab Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {WORK_CATEGORIES.map((cat, i) => {
            const isSelected = activeCategoryIndex === i;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIndex(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[14.4px] sm:text-[16px] tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black font-medium shadow-lg'
                    : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.name}</span>
                <span className="text-[9px] opacity-60 font-mono ml-0.5">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: INTERACTIVE FANNED-CARD DECK CAROUSEL              */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto relative py-6 sm:py-10">
        
        {/* Navigation Arrows (Header as Sketched) */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/50">
              Deck {activeCategoryIndex + 1} of {WORK_CATEGORIES.length}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs font-light text-white/70 tracking-wider">
              {activeCategory.tagline}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Previous Category"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
              aria-label="Next Category"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Decks Stage: Centered Active View with Dimmed Siblings */}
        <div className="relative min-h-[460px] sm:min-h-[500px] flex items-center justify-center overflow-visible">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 items-center w-full">
            {WORK_CATEGORIES.map((category, catIdx) => {
              const isActive = catIdx === activeCategoryIndex;
              const isHovered = hoveredCategory === category.id;
              const isFanned = isHovered || (isActive && hoveredCategory === null);

              // Calculate distance from active
              const diff = catIdx - activeCategoryIndex;

              return (
                <div
                  key={category.id}
                  onClick={() => {
                    setActiveCategoryIndex(catIdx);
                    setExpandedCategoryGallery(category);
                  }}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 ease-out select-none ${
                    isActive
                      ? 'opacity-100 scale-100 md:scale-105 z-20'
                      : 'opacity-40 hover:opacity-75 scale-95 md:scale-90 z-10'
                  }`}
                >
                  {/* Card Deck Fan Container */}
                  <div className="relative w-[240px] sm:w-[260px] h-[320px] sm:h-[350px] flex items-center justify-center mb-6">
                    {category.cards.map((project, cardIdx) => {
                      const transforms = getCardFanTransforms(
                        cardIdx,
                        category.cards.length,
                        isFanned
                      );

                      return (
                        <motion.div
                          key={project.id}
                          className="absolute w-full h-full rounded-xl overflow-hidden border border-white/15 bg-black shadow-2xl origin-bottom transition-shadow duration-300"
                          animate={{
                            rotate: transforms.rotate,
                            x: transforms.x,
                            y: transforms.y,
                            scale: transforms.scale,
                            zIndex: transforms.zIndex,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 22,
                          }}
                          whileHover={{
                            scale: transforms.scale * 1.04,
                            transition: { duration: 0.2 },
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedProject(project);
                          }}
                        >
                          {/* Project Imagery */}
                          <img
                            src={project.image}
                            alt={project.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />

                          {/* Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                          {/* Top-Right Badge: Number in Deck */}
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-md text-[9px] font-mono tracking-wider text-white/70">
                            0{cardIdx + 1}
                          </div>

                          {/* Bottom Card Context */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="text-[9px] font-mono tracking-wider uppercase text-white/60 block mb-0.5">
                              {project.location}
                            </span>
                            <h4 className="font-display text-sm font-light text-white tracking-wide truncate">
                              {project.title}
                            </h4>
                            <p className="text-[10px] text-white/50 tracking-wider truncate mt-0.5">
                              {project.architect}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Deck Title & Interaction Prompt */}
                  <div className="text-center mt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                      <span className="text-[10px] tracking-[0.2em] uppercase text-white/80 font-light">
                        {category.name}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-light text-white tracking-wider">
                      {category.tagline}
                    </h3>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedCategoryGallery(category);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[14.4px] tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span>Explore Gallery ({category.count})</span>
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Swipe / Drag Hint for Mobile */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] tracking-[0.25em] text-white/30 uppercase font-mono">
          <span>• Hover to Fan Cards • Click Deck to Expand •</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: CLIENT / PARTNER SECTION ("Our Clients / Partners")*/}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto pt-14 pb-8 border-t border-white/10 mt-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40 block mb-1">
              Global Architectural Network
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-extralight tracking-[0.25em] uppercase text-white">
              Our Clients / Partners
            </h3>
          </div>

          <span className="text-xs text-white/50 font-light tracking-wider">
            Collaborating with Pritzker Laureates & Premier Developers
          </span>
        </div>

        {/* Monochromatic Glassmorphism Grid / Slider */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CLIENT_PARTNERS.map((client, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/20 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group cursor-default"
            >
              <div>
                <span className="text-[9px] font-mono text-white/30 tracking-widest block mb-1">
                  {client.origin}
                </span>
                <h4 className="font-display text-xs sm:text-sm font-light text-white/80 group-hover:text-white tracking-wide transition-colors">
                  {client.name}
                </h4>
              </div>

              <span className="text-[9px] text-white/40 font-light mt-3 block truncate">
                {client.category}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Consultation CTA */}
        <div className="mt-10 p-6 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-sm font-medium text-white tracking-wider uppercase">
              Commission an Architectural Visualization
            </h4>
            <p className="text-xs text-white/60 font-light mt-0.5">
              Available for international competitions, marketing campaigns, and real-time VR.
            </p>
          </div>

          <button
            onClick={onScheduleCall}
            className="px-6 py-2.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Start A Project
          </button>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: SINGLE PROJECT LIGHTBOX VIEWER                       */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[#121214] border border-white/15 rounded-xl shadow-2xl overflow-hidden my-auto"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Project Metadata */}
              <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-white/40 tracking-wider uppercase mb-1">
                    <span>{selectedProject.categoryLabel}</span>
                    <span>·</span>
                    <span>{selectedProject.year}</span>
                    <span>·</span>
                    <span>{selectedProject.location}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-wide">
                    {selectedProject.title}
                  </h3>
                  <p className="text-xs text-white/60 font-light mt-1 max-w-xl leading-relaxed">
                    {selectedProject.description}
                  </p>
                  <p className="text-[11px] font-mono text-white/40 mt-2">
                    Pipeline: {selectedProject.pipeline} · {selectedProject.aspect}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {onSelectProjectForHero && (
                    <button
                      onClick={() => {
                        onSelectProjectForHero(selectedProject);
                        setSelectedProject(null);
                        if (onClose) onClose();
                      }}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[14.4px] tracking-wider font-medium transition-colors cursor-pointer text-center"
                    >
                      Set As Hero View
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      if (onScheduleCall) onScheduleCall();
                    }}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded bg-white text-black text-[14.4px] tracking-wider font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-center"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: EXPANDED CATEGORY GALLERY                            */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {expandedCategoryGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setExpandedCategoryGallery(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-6xl bg-[#101013] border border-white/15 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 block mb-1">
                    Category Archive
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                    {expandedCategoryGallery.name} — {expandedCategoryGallery.tagline}
                  </h3>
                </div>

                <button
                  onClick={() => setExpandedCategoryGallery(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(expandedCategoryGallery.id === 'all'
                  ? WORK_PROJECTS
                  : WORK_PROJECTS.filter(p => p.category === expandedCategoryGallery.name)
                ).map(project => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                    }}
                    className="group relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-[16/10] cursor-pointer"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/60 block">
                        {project.location} · {project.year}
                      </span>
                      <h4 className="font-display text-sm font-bold text-white tracking-wide truncate">
                        {project.title}
                      </h4>
                      <p className="text-[10px] text-white/50 tracking-wider truncate mt-0.5">
                        {project.architect}
                      </p>
                    </div>

                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
