import React from 'react';
import { X, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { STUDIO_SERVICES } from '../data/studioData';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProjectWithService: (serviceId: string) => void;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onStartProjectWithService,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl transition-all overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#101014] border border-white/15 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-none">
                Packages & Architectural Services
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light mt-1">
                Production-grade CGI, Unreal Engine 5 & Cinematic Spatial Film
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STUDIO_SERVICES.map(service => (
              <div
                key={service.id}
                className="p-6 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-mono text-xs text-white/40 tracking-widest">{service.number}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {service.turnaround}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white tracking-wide group-hover:text-white/90">
                    {service.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-1 mb-4 leading-relaxed font-light">
                    {service.tagline}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block">
                      Scope & Deliverables:
                    </span>
                    {service.deliverables.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-white/60 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/50 italic">
                    Best for: {service.idealFor}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onStartProjectWithService(service.id);
                    }}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <span>Commission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
