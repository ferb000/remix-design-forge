import React from 'react';
import { X, Building2, Star, ArrowUpRight } from 'lucide-react';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProject: () => void;
}

export const ClientsModal: React.FC<ClientsModalProps> = ({
  isOpen,
  onClose,
  onStartProject,
}) => {
  if (!isOpen) return null;

  const clientList = [
    { name: 'Snøhetta Architects', location: 'Oslo / New York', type: 'Architecture & Landscape' },
    { name: 'David Chipperfield Architects', location: 'London / Berlin', type: 'Cultural & Civic' },
    { name: 'Kengo Kuma & Associates', location: 'Tokyo / Paris', type: 'Residential & Hospitality' },
    { name: 'Herzog & de Meuron', location: 'Basel / Zurich', type: 'Masterplans & Museums' },
    { name: 'Foster + Partners', location: 'London', type: 'High-Rise Commercial' },
    { name: 'BIG — Bjarke Ingels Group', location: 'Copenhagen / New York', type: 'Civic Innovation' },
    { name: 'CapitaLand Luxury Developments', location: 'Singapore', type: 'Hospitality & Towers' },
    { name: 'Hines Real Estate Investment', location: 'Chicago / London', type: 'Urban Redevelopment' },
  ];

  const testimonials = [
    {
      quote: 'Design Forge rendered our competition entry with an emotional sensitivity to light and material that directly secured the municipal commission.',
      author: 'Elinor Vance',
      role: 'Design Principal',
      firm: 'Nordic Architecture Studio',
    },
    {
      quote: 'Their Unreal Engine real-time walkthroughs transformed our VIP investor roadshow. The spatial presence is indistinguishable from physical reality.',
      author: 'Julian Thorne',
      role: 'Managing Director',
      firm: 'Thorne & Mercer Capital',
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl transition-all overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#101013] border border-white/10 rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white leading-none">
                Clients & Collaborators
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light mt-1">
                Trusted by Pritzker Laureates, Global Studios & Developers
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
        <div className="p-6 md:p-10 overflow-y-auto space-y-8">
          
          {/* Client Roster */}
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 block mb-4">
              Select Client Partnerships
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clientList.map((client, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded border border-white/5 bg-white/[0.02] flex items-center justify-between hover:border-white/15 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-light text-white tracking-wide">
                      {client.name}
                    </h4>
                    <p className="text-[11px] text-white/50 font-light mt-0.5">
                      {client.type} · {client.location}
                    </p>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 block mb-4">
              Endorsements
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded border border-white/10 bg-white/[0.01] flex flex-col justify-between"
                >
                  <p className="text-sm sm:text-base font-light text-white/80 leading-relaxed italic mb-4">
                    “{t.quote}”
                  </p>
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-xs font-medium text-white block">{t.author}</span>
                    <span className="text-xs text-white/50 font-light">{t.role}, {t.firm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-white/60 font-light">
              Collaborate on your upcoming architectural submission.
            </span>
            <button
              onClick={() => {
                onClose();
                onStartProject();
              }}
              className="inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Start Collaboration
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
