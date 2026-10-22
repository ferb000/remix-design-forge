import { createPortal } from 'react-dom';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Calendar, Clock, CheckCircle2, Building, ShieldCheck, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { STUDIO_INFO, STUDIO_SERVICES } from '../data/studioData';
import { bookingsApi, ApiError, BookingAvailability } from '../services/api';

interface ProjectSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSchedulerModal: React.FC<ProjectSchedulerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<string>('cinematic-cgi');
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    firmName: '',
    location: '',

    timeline: 'Within 30 Days',
    notes: '',
  });
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',

  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [emailQueued, setEmailQueued] = useState(false);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotError, setSlotError] = useState('');
  const requestVersion = useRef(0);
  const submitting = useRef(false);
  const refreshAvailability = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsLoadingSlots(true);
    try {
      const response = await bookingsApi.getAvailability();
      if (version === requestVersion.current) { setAvailability(response.data); setSlotError(''); }
    } catch {
      if (version === requestVersion.current) {
        setAvailability(null);
        setSlotError('Unable to check availability. Please retry before booking.');
      }
    } finally { if (version === requestVersion.current) setIsLoadingSlots(false); }
  }, []);
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    refreshAvailability();
    const timer = window.setInterval(refreshAvailability, 30000);
    window.addEventListener('focus', refreshAvailability);
    return () => { requestVersion.current++; window.clearInterval(timer); window.removeEventListener('focus', refreshAvailability); };
  }, [isOpen, isSubmitted, refreshAvailability]);
  useEffect(() => {
    if (!availability || isSubmitted) return;
    if (!availability.dates.some(day => day.date === selectedDate)) {
      setSelectedDate(availability.dates.find(day => day.slots.some(slot => slot.available))?.date || '');
      setSelectedTime('');
    } else if (!availability.dates.find(day => day.date === selectedDate)?.slots.some(slot => slot.time === selectedTime && slot.available)) {
      if (selectedTime) {
        setStep(current => current === 4 ? 3 : current);
        setSlotError('Your selected slot is no longer available. Please choose another time.');
      }
      setSelectedTime('');
    }
  }, [availability, selectedDate, selectedTime, isSubmitted]);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen, onClose]);
  const availableDates = (availability?.dates || []).map(day => ({ ...day,
    day: new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
    num: new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  }));
  const availableTimes = availability?.dates.find(day => day.date === selectedDate)?.slots || [];
  const hasValidSlot = availableTimes.some(slot => slot.time === selectedTime && slot.available && Date.parse(slot.startsAt) > Date.now());

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || !hasValidSlot || isLoadingSlots || step !== 4) return;
    submitting.current = true;
    setIsSubmitting(true);
    const serviceName = STUDIO_SERVICES.find((s) => s.id === selectedService)?.name || selectedService;
    try {
      const response = await bookingsApi.submit({
      serviceId: selectedService,
      serviceName,
      date: selectedDate,
      time: selectedTime,
      name: clientInfo.name,
      email: clientInfo.email,
      phone: clientInfo.phone,

      notes: projectDetails.notes,
      projectName: projectDetails.projectName,
      firmName: projectDetails.firmName,
      location: projectDetails.location,

      timeline: projectDetails.timeline,
    });
      setEmailQueued(response.data.emailStatus === 'queued');
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 409 || error.status === 400)) {
        setSelectedTime('');
        setStep(3);
        await refreshAvailability();
      }
      window.alert((error as Error).message);
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setStep(1);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl transition-all overflow-hidden"
    >
      <div className="relative w-full max-w-2xl bg-[#121214] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 flex-shrink-0">
              <Calendar className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-normal tracking-tight text-white leading-none">
                Schedule Consultation
              </h3>
              <p className="text-sm sm:text-base text-white/70 font-light mt-1">
                Direct consultation with Design Forge Senior Art Directors
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

        {/* Progress Tracker (If not completed) */}
        {!isSubmitted && (
          <div className="px-3 sm:px-6 pt-4 pb-2 shrink-0 border-b border-white/5 bg-black/30">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-white/50 tracking-normal sm:tracking-wider uppercase mb-2">
              <span className={step >= 1 ? 'text-white font-medium' : ''}>01. Discipline</span>
              <span className="text-white/20">/</span>
              <span className={step >= 2 ? 'text-white font-medium' : ''}>02. Project Scope</span>
              <span className="text-white/20">/</span>
              <span className={step >= 3 ? 'text-white font-medium' : ''}>03. Call Slot</span>
              <span className="text-white/20">/</span>
              <span className={step >= 4 ? 'text-white font-medium' : ''}>04. Details</span>
            </div>
            <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-8 overflow-y-auto overscroll-contain min-h-0">
          {!isSubmitted && isLoadingSlots && <p role="status" className="text-xs text-white/60 mb-3">Checking available consultation slots...</p>}
          {!isSubmitted && slotError && (
            <div role="alert" className="text-sm text-red-300 mb-3">
              {slotError} <button type="button" onClick={refreshAvailability} className="underline">Retry</button>
            </div>
          )}
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-display text-2xl font-bold uppercase tracking-tight text-white mb-2">
                Consultation Confirmed
              </h4>
              <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
                Thank you, <span className="text-white font-medium">{clientInfo.name || 'Architect'}</span>. We have reserved your video session on{' '}
                <span className="text-white font-medium">{selectedDate}</span> at{' '}
                <span className="text-white font-medium">{selectedTime}</span>.
              </p>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left max-w-md mx-auto mb-8 text-xs space-y-2">
                {emailQueued && <p className="text-white/70">A confirmation email will be sent to {clientInfo.email}.</p>}
                <div className="flex justify-between text-white/60">
                  <span>Selected Service:</span>
                  <span className="text-white font-medium">
                    {STUDIO_SERVICES.find(s => s.id === selectedService)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Project / Firm:</span>
                  <span className="text-white font-medium">
                    {projectDetails.projectName || 'Confidential Project'} · {projectDetails.firmName || 'Studio'}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Design Forge Dispatch:</span>
                  <span className="text-white font-medium">{STUDIO_INFO.email}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Return To Studio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Select Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                      Select Required Visualization Capability
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Choose the primary scope of your architectural project or commission.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {STUDIO_SERVICES.map(srv => {
                      const isSelected = selectedService === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv.id)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white bg-white/10 shadow-lg'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-mono text-xs text-white/40">{srv.number}</span>
                            <span className="text-[10px] tracking-wider uppercase text-white/50">
                              
                            </span>
                          </div>
                          <h5 className="font-semibold text-sm text-white">{srv.name}</h5>
                          <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">
                            {srv.tagline}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Project Scope */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                      Project Details & Scope
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Help us understand the scale, timeline, and architectural ambition.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Project Name / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pavilion at Lake Geneva"
                        value={projectDetails.projectName}
                        onChange={e => setProjectDetails({ ...projectDetails, projectName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Architecture Firm / Developer
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Atelier Foster & Partners"
                        value={projectDetails.firmName}
                        onChange={e => setProjectDetails({ ...projectDetails, firmName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Target Completion
                      </label>
                      <select
                        value={projectDetails.timeline}
                        onChange={e => setProjectDetails({ ...projectDetails, timeline: e.target.value })}
                        className="w-full px-3 py-2.5 rounded bg-[#18181b] border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      >
                        <option value="Urgent (< 14 Days)">Urgent (&lt; 14 Days - Competition)</option>
                        <option value="Within 30 Days">Standard (Within 30 Days)</option>
                        <option value="60 - 90 Days">Medium Term (60 – 90 Days)</option>
                        <option value="Q3/Q4 2026">Long Term (Q3 / Q4 2026)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                      Brief Description / Special Vision
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Share initial notes, design files (Revit/Rhino/SketchUp), atmospheric lighting preferences..."
                      value={projectDetails.notes}
                      onChange={e => setProjectDetails({ ...projectDetails, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-[14.4px] text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      <span>Choose Call Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Call Slot Picker */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                      Schedule 30-Minute Video Consultation
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Direct 1-on-1 strategy call with our Creative Director via Google Meet / Zoom.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70">
                      Select Date (Upcoming Studio Openings)
                    </label>
                    <p className="text-xs text-white/50">30-minute calls · GMT · Accra (UTC+00:00)</p>
                    {!isLoadingSlots && availability && !availableDates.some(day => day.slots.some(slot => slot.available)) && (
                      <p role="status" className="text-xs text-white/60">No consultation slots are available in the next 30 days. Please contact the studio.</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {availableDates.map(d => {
                        const isSelected = selectedDate === d.date;
                        return (
                          <button
                            key={d.date}
                            type="button"
                            disabled={!d.slots.some(slot => slot.available) || isLoadingSlots || isSubmitting}
                            onClick={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                            className={`p-2.5 rounded text-center border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'border-white bg-white text-black shadow-md'
                                : 'border-white/15 bg-white/5 text-white/80 hover:border-white/40'
                            }`}
                          >
                            <span className="block text-base font-bold font-display mt-0.5">
                              {d.num}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70">
                      Select Preferred Time Window
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableTimes.map(t => {
                        const isSelected = selectedTime === t.time;
                        return (
                          <button
                            key={t.time}
                            type="button"
                            disabled={!t.available || isLoadingSlots || isSubmitting}
                            onClick={() => setSelectedTime(t.time)}
                            className={`py-2 px-3 rounded text-center border text-xs font-mono transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'border-white bg-white text-black font-semibold'
                                : 'border-white/15 bg-white/5 text-white/80 hover:border-white/40'
                            }`}
                          >
                            {t.time}{!t.available ? ' · Booked' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-[14.4px] text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={!hasValidSlot || isLoadingSlots}
                      className="flex items-center gap-2 px-5 py-2.5 rounded bg-white text-black font-semibold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Your Contact Info</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Client Contact Info & Confirmation */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                      Confirm Consultation & Details
                    </h4>
                    <p className="text-xs text-white/60 mt-1">
                      Your time is reserved when you submit this form.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Henrik Lindqvist"
                        value={clientInfo.name}
                        onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="henrik@architecture.com"
                        value={clientInfo.email}
                        onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+41 44 215 0000"
                        value={clientInfo.phone}
                        onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>

                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
                    <p className="font-semibold text-white">Summary of Reservation:</p>
                    <p>• {STUDIO_SERVICES.find(s => s.id === selectedService)?.name}</p>
                    <p>• Consultation: {selectedDate} at {selectedTime}</p>
                    <p className="text-[11px] text-white/50 pt-1">
                      Direct studio contact: <span className="text-white/80">{STUDIO_INFO.email}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1.5 text-[14.4px] text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!hasValidSlot || isLoadingSlots || isSubmitting}
                      className="px-6 py-2.5 rounded bg-white text-black font-bold text-[14.4px] tracking-wider hover:bg-neutral-200 transition-colors shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Reserving...' : 'Lock In Consultation'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>, document.body
  );
};
