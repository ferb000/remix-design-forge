import React, { useEffect, useRef, useState } from 'react';
import { SHOWREEL_SCENES, SceneItem } from '../data/studioData';

interface ArchitecturalShowreelProps {
  currentSceneOverride?: SceneItem;
  onSceneChange?: (scene: SceneItem) => void;
}

export const ArchitecturalShowreel: React.FC<ArchitecturalShowreelProps> = ({
  currentSceneOverride,
  onSceneChange,
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If parent specifies an override scene, sync to it
  useEffect(() => {
    if (currentSceneOverride) {
      const idx = SHOWREEL_SCENES.findIndex(s => s.id === currentSceneOverride.id);
      if (idx !== -1) {
        setActiveSceneIndex(idx);
        setProgress(0);
      }
    }
  }, [currentSceneOverride]);

  // Dynamic showreel sequencer: smoothly advances every 8 seconds with continuous progress
  useEffect(() => {
    const sceneDurationMs = 8000;
    const intervalMs = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;
      const currentProgress = (elapsed % sceneDurationMs) / sceneDurationMs;
      setProgress(currentProgress);

      if (elapsed >= sceneDurationMs) {
        elapsed = 0;
        setActiveSceneIndex(prev => (prev + 1) % SHOWREEL_SCENES.length);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  // Safely inform parent of scene changes without updating during render
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onSceneChange) {
      onSceneChange(SHOWREEL_SCENES[activeSceneIndex]);
    }
  }, [activeSceneIndex, onSceneChange]);

  // Floating atmospheric dust motes & light shimmer canvas for cinematic depth
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 45 ambient floating particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating volumetric particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        if (p.y < 0) p.y = height + 10;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black">
      
      {/* 1. Cinematic Architectural Motion Layers */}
      {SHOWREEL_SCENES.map((scene, idx) => {
        const isActive = idx === activeSceneIndex;
        // Directional camera pan alternate between left/right/zoom
        const cameraStyle = idx % 2 === 0
          ? 'animate-arch-glide-zoom'
          : 'animate-arch-pan-drift';

        return (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Cinematic Pan / Zoom camera motion container */}
            <div
              className={`w-full h-full transform ${
                isActive ? cameraStyle : 'scale-100'
              }`}
            >
              <img
                src={scene.image}
                alt={scene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  willChange: 'transform',
                  transformOrigin: idx === 0 ? 'center center' : idx === 1 ? '40% 60%' : '60% 40%',
                }}
              />
            </div>
          </div>
        );
      })}

      {/* 2. Dynamic Volumetric Architectural Light Sweep Overlay */}
      {/* Creates moving natural sunlight raking across building textures */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-screen opacity-25">
        <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-amber-100/10 to-transparent -skew-x-12 animate-light-sweep" />
      </div>

      {/* 3. Floating Atmospheric Spatial Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none opacity-60"
      />

      {/* 4. Film Grain & Architectural Depth Scrim */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0d0d0d] via-black/20 to-[#0d0d0d]/80 pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(13,13,13,0.7)_100%)] pointer-events-none" />

      {/* 5. Minimal Reel Timecode & Motion Indicator (Whisper-quiet) */}
      <div className="absolute top-8 right-8 z-30 flex items-center gap-3 text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Showreel Motion Active</span>
        <span className="text-white/20">/</span>
        <span className="text-white/60">0{activeSceneIndex + 1}.04</span>
      </div>

      {/* 6. Hairline Live Playhead Progress Bar at top edge */}
      <div className="absolute top-0 left-0 right-0 z-40 h-[1.5px] bg-white/5">
        <div
          className="h-full bg-white/40 transition-all duration-75 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

    </div>
  );
};
