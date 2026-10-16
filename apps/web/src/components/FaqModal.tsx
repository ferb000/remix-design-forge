import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWithUs: () => void;
  onBackToProcess?: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  onClose,
  onConnectWithUs,
  onBackToProcess,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'What files or information do you need to start a project?',
      a: 'Send us your architectural drawings, sketches, or 3D files. Any photos of finishes, lighting ideas, or mood boards you like are also helpful.',
    },
    {
      q: "What if our design isn't 100% finalized yet?",
      a: 'That is completely fine. We can set up the views and basic shapes first while your team finalizes finishes and design details.',
    },
    {
      q: 'How do you calculate the cost of a project?',
      a: 'Every project is custom. Pricing depends on the size of the space, how many views you need, and your timeline.',
    },
    {
      q: 'What is included in a base project cost?',
      a: 'Your quote covers building the scene, realistic lighting and textures, two revision rounds, and ready-to-present high-resolution images.',
    },
    {
      q: 'What payment terms do you accept?',
      a: 'We ask for 50% to kick off the work and the remaining 50% once you review and approve the final images.',
    },
    {
      q: 'Which formats and resolutions do you deliver?',
      a: 'You get high-resolution files ready for both print and digital screens, including presentation decks, marketing websites, and large display boards.',
    },
    {
      q: 'Do you provide the raw 3D scenes or layered PSD files?',
      a: 'We deliver finished, presentation-ready images. Raw production files contain licensed software assets, but working files can be arranged upon request.',
    },
    {
      q: 'What is architectural 3D rendering?',
      a: 'It turns architectural drawings into lifelike images so your clients and buyers can see and feel your vision before construction starts.',
    },
    {
      q: 'How long does a 3D rendering take?',
      a: 'Most projects take a few days per view. We will give you a clear schedule upfront and stick to your deadline.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className="relative w-full h-full min-h-screen min-h-[100dvh] flex flex-col justify-between bg-[#0b0b0d]/85 backdrop-blur-2xl text-[#f5f5f7] select-none font-sans overflow-hidden px-4 sm:px-6 md:px-9 py-4 sm:py-6 md:py-9"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER: ALIGNED WITH FIXED TOGGLE COORDINATES           */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full flex items-center justify-between pb-3 sm:pb-6 border-b border-white/[0.08] z-20 flex-shrink-0">
        
        {/* Left: Spacer matching fixed toggle button + Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />
          <div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
              FAQ
            </h1>
          </div>
        </div>

        {/* Right: Close Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
            aria-label="Close FAQ"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN STAGE: ONLY QUESTIONS & ANSWERS (NOTHING MORE)         */}
      {/* ------------------------------------------------------------- */}
      <main id="faq-scroll-container" className="w-full flex-1 min-h-0 overflow-y-auto my-auto py-3 sm:py-6 pr-1">
        <div className="w-full max-w-4xl mx-auto space-y-2.5 sm:space-y-3 pb-6">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.035] transition-colors overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-sm sm:text-base md:text-lg font-normal text-white tracking-wide">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/15 flex items-center justify-center text-white/70 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-white/10 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 text-sm sm:text-base text-white/70 font-light leading-relaxed border-t border-white/[0.04]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER CONTROLS: SHORTCUTS & CONNECT TRANSITION     */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full flex items-center justify-between pt-3 sm:pt-6 border-t border-white/[0.08] z-20 gap-2 sm:gap-4 flex-shrink-0">
        
        {/* Left: Back to Creative Process (Arrow pointing UP to preceding page) */}
        <div className="flex items-center">
          {onBackToProcess && (
            <button
              onClick={onBackToProcess}
              className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
              aria-label="Back to Creative Process"
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Process</span>
            </button>
          )}
        </div>

        {/* Right: Proceed to Connect With Us (Arrow pointing DOWN to next page) */}
        <div className="flex items-center">
          <button
            onClick={onConnectWithUs}
            className="flex items-center gap-1.5 sm:gap-2 text-[14.4px] sm:text-[16.8px] font-medium tracking-[0.18em] sm:tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer py-1 group"
            aria-label="Proceed down to Connect With Us"
          >
            <span>Connect With Us</span>
            <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
