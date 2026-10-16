import React, { useState } from 'react';
import { X, Maximize2, Check, ArrowUpRight, Compass, Film } from 'lucide-react';
import { SHOWREEL_SCENES, SceneItem } from '../data/studioData';

interface ProjectsShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSceneForHero: (scene: SceneItem) => void;
  onStartProject: () => void;
}

export const ProjectsShowreelModal: React.FC<ProjectsShowreelModalProps> = ({
  isOpen,
  onClose,
  onSelectSceneForHero,
  onStartProject,
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneItem>(SHOWREEL_SCENES[0]);
  const [lightboxActive, setLightboxActive] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl transition-all overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-[#0f0f12] border border-white/15 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-none">
                Selected Works & Architectural Showreel
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light mt-1">
                Curated 8K Architectural CGI & Cinematic Motion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8">
          
          {/* Main Selected Feature Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Large Image Frame */}
            <div className="lg:col-span-8 relative rounded-lg overflow-hidden border border-white/15 bg-black group aspect-[16/9]">
              <img
                src={selectedScene.image}
                alt={selectedScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Bottom specs overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider text-white/90 bg-black/60 px-3 py-1.5 rounded backdrop-blur-md border border-white/15">
                  {selectedScene.focal}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectSceneForHero(selectedScene);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set As Hero Background</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Metadata details */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/40 tracking-wider uppercase mb-1">
                  <span>{selectedScene.code}</span>
                  <span>·</span>
                  <span>{selectedScene.category}</span>
                  <span>·</span>
                  <span>{selectedScene.year}</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                  {selectedScene.title}
                </h3>
                <p className="text-xs text-white/70 mt-1 font-light italic">
                  {selectedScene.subtitle}
                </p>

                <p className="text-xs text-white/60 leading-relaxed mt-4">
                  {selectedScene.description}
                </p>
              </div>

              {/* Architectural Technical Specs */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2 text-xs font-mono text-white/70">
                <div className="flex justify-between">
                  <span className="text-white/40">Location:</span>
                  <span className="text-white">{selectedScene.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Pipeline:</span>
                  <span className="text-white">{selectedScene.renderEngine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Master Delivery:</span>
                  <span className="text-white">8K Linear EXR · 60 FPS</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onStartProject();
                }}
                className="w-full py-2.5 rounded border border-white/20 hover:border-white bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-[14.4px] tracking-wider transition-all cursor-pointer text-center"
              >
                Inquire For Similar Project
              </button>
            </div>
          </div>

          {/* Thumbnail Strip / Project Switcher */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs tracking-[0.2em] uppercase text-white/50 font-mono">
                All Showreel Archives (Select to inspect)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SHOWREEL_SCENES.map(scene => {
                const isActive = selectedScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene)}
                    className={`relative rounded-md overflow-hidden border text-left transition-all group aspect-[16/10] cursor-pointer ${
                      isActive
                        ? 'border-white ring-2 ring-white/50 scale-[1.02]'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={scene.image}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="font-mono text-[10px] text-white/60 block">
                        {scene.code}
                      </span>
                      <span className="font-display text-xs font-bold text-white block truncate">
                        {scene.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
