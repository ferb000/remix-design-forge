import React, { useState, useEffect, useRef } from 'react';

export const HeroCenter: React.FC = () => {
  // Intro animation stages:
  // 'initial' (0ms) -> 'intro-visible' (fade in typography) -> 'faded-low' (after 2s hold, drop to low opacity)
  const [introState, setIntroState] = useState<'initial' | 'intro-visible' | 'faded-low'>('initial');
  const [isCursorMoving, setIsCursorMoving] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial fade in sequence:
  // Starts from pure deep-matte black background (#0d0d0d)
  // Fades in typography, holds for 2 seconds, then transitions to low-opacity
  useEffect(() => {
    const t1 = setTimeout(() => {
      setIntroState('intro-visible');
    }, 300);

    const t2 = setTimeout(() => {
      setIntroState('faded-low');
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 2. Cursor motion detection:
  // When cursor is moving -> isCursorMoving = true (low opacity visible)
  // When cursor stops moving -> after brief delay, isCursorMoving = false (fades out entirely)
  useEffect(() => {
    const handleActivity = () => {
      setIsCursorMoving(true);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        setIsCursorMoving(false);
      }, 2000);
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('pointermove', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('pointermove', handleActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Opacity calculation (strictly following requirements):
  // - Initial: opacity-0
  // - Intro-visible: opacity-100 (holds for 2s)
  // - Faded-low:
  //   * If cursor is moving: opacity-10
  //   * If cursor is NOT moving: opacity-0 (fades out entirely)
  // - NO hover effects on text blocks
  let opacityStyle = 'opacity-0';

  if (introState === 'initial') {
    opacityStyle = 'opacity-0';
  } else if (introState === 'intro-visible') {
    opacityStyle = 'opacity-100';
  } else if (introState === 'faded-low') {
    opacityStyle = isCursorMoving ? 'opacity-10' : 'opacity-0';
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full select-none pointer-events-none">
      <div
        className={`transition-opacity duration-1000 ease-out flex flex-col items-center ${opacityStyle}`}
      >
        {/* Hero Text: Consistent hero scale matching all hero banners across the site */}
        <h1
          className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] sm:tracking-[0.25em] text-[#f5f5f7] uppercase"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.85)' }}
        >
          Design Forge
        </h1>

        {/* Sub Text: Consistent sub text scale matching all sub text across the site */}
        <p
          className="mt-3 sm:mt-4 text-sm sm:text-base font-light tracking-[0.22em] sm:tracking-[0.28em] text-white/70 uppercase font-sans"
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.85)' }}
        >
          Give your dream a shape of reality
        </p>
      </div>
    </div>
  );
};
