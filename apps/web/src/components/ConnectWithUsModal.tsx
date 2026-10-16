import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ProjectSchedulerModal } from './ProjectSchedulerModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  CheckCircle2,
  Send,
  Copy,
  Check,
} from 'lucide-react';

import imgVillaDusk from '../assets/images/arch_desert_villa_1791046593942.jpg';
import { inquiriesApi } from '../services/api';

interface ConnectWithUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAbout?: () => void;
  onNavigateClients?: () => void;
  onNavigateWork?: (categoryId?: string, openGallery?: boolean) => void;
  onNavigateProcess?: () => void;
  onBackToFaq?: () => void;
}

export const ConnectWithUsModal: React.FC<ConnectWithUsModalProps> = ({
  isOpen,
  onClose,
  onNavigateAbout,
  onNavigateClients,
  onNavigateWork,
  onNavigateProcess,
  onBackToFaq,
}) => {
  const [isFormPopupOpen, setIsFormPopupOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailQueued, setEmailQueued] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(() => fallbackCopy(text, fieldName));
    } else {
      fallbackCopy(text, fieldName);
    }
  };

  const fallbackCopy = (text: string, fieldName: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error(err);
    }
    document.body.removeChild(textArea);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await inquiriesApi.submit({ name, email, message });
      setEmailQueued(response.data.emailStatus === 'queued');
      setIsSubmitted(true);
    } catch (error) {
      window.alert((error as Error).message);
    }
  };

  const handleClosePopup = () => {
    setIsFormPopupOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 300);
  };

  return (
    <div
      id="connect-scroll-container"
      className="relative w-full bg-[#0d0e11] text-[#f5f5f7] select-none font-sans"
    >
      {isSchedulerOpen && createPortal(
        <ProjectSchedulerModal isOpen={true} onClose={() => setIsSchedulerOpen(false)} />,
        document.body
      )}
      {/* ------------------------------------------------------------- */}
      {/* FLOATING TOP BAR: FIXED MENU SPACER + CLOSE BUTTON            */}
      {/* ------------------------------------------------------------- */}
      <div className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 md:px-9 py-3 sm:py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        {/* Transparent spacer matching the fixed navigation toggle button */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0" aria-hidden="true" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white/80 hover:text-white transition-all cursor-pointer pointer-events-auto backdrop-blur-md shadow-lg"
          aria-label="Close Connect with us"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SECTION: HUGE COLORFUL RENDER HERO BANNER              */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden -mt-20">
        
        {/* Background Image: High-res luxury architectural villa at golden dusk */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2600&q=90"
            onError={(e) => {
              // Fallback to local high-res asset if external image fails
              (e.target as HTMLImageElement).src = imgVillaDusk;
            }}
            alt="Luxury architectural living room overlooking infinity pool at sunset"
            className="w-full h-full object-cover object-center brightness-95 contrast-105"
          />
          {/* Subtle directional dark gradient scrim on the left for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 sm:via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Callout: Inscription & "Fill out form →" Button */}
        <div className="relative z-10 w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-9 lg:px-24 pt-16 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-2xl space-y-5 sm:space-y-8">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]">
              Ready to discuss<br />
              your next project?
            </h1>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-xl">
              If you need guidance on what kind of visuals or presentation tools your project requires, simply fill out the form below and tell us about your goals.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsFormPopupOpen(true)}
                className="group inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-all duration-300 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
              >
                <span>Fill Out Form</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => setIsSchedulerOpen(true)}
                className="inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/40 text-white font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. FOOTNOTE / FOOTER DIRECTORY (EXACTLY AS IN REFERENCE)       */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full bg-[#0d0e11] pt-12 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 md:px-9 lg:px-24 border-t border-white/[0.08]">
        <div className="w-full max-w-[1560px] mx-auto space-y-12 sm:space-y-16">
          
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
            
            {/* Left Column: Got a project in mind? */}
            <div className="md:col-span-5 space-y-4 sm:space-y-5">
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-none">
                Got a project<br />
                in mind?
              </h2>

              <div className="pt-2">
                <button
                  onClick={() => setIsFormPopupOpen(true)}
                  className="group inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/40 text-[14.4px] sm:text-[16.8px] font-medium tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span>Let's Talk</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Middle Columns: About, Services, Contact */}
            <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              
              {/* About Column */}
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  About
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li>
                    <button
                      onClick={() => onNavigateAbout?.()}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateClients?.()}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Clients
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateProcess?.()}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Our Process
                    </button>
                  </li>
                  {onBackToFaq && (
                    <li>
                      <button
                        onClick={() => onBackToFaq()}
                        className="hover:text-white transition-colors cursor-pointer text-left"
                      >
                        FAQ
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Services Column */}
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  Services
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li>
                    <button
                      onClick={() => onNavigateWork?.('still-images', true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Stills
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateWork?.('animations', true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Animation
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateWork?.('vr', true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      VR
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateWork?.('360-panoramas', true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      360 Panoramas
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Column */}
              <div className="col-span-2 sm:col-span-1 space-y-4">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block">
                  Contact
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
                  <li className="text-white/80">Accra, Ghana</li>
                  
                  {/* Phone with copy symbol */}
                  <li className="flex items-center gap-2 group">
                    <a href="tel:+233200000000" className="hover:text-white transition-colors">
                      +233 20 000 0000
                    </a>
                    <button
                      onClick={() => handleCopy('+233200000000', 'phone')}
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1 focus:outline-none"
                      aria-label="Copy phone number"
                      title="Copy phone number"
                    >
                      {copiedField === 'phone' ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </li>

                  {/* Work Email with copy symbol */}
                  <li className="flex items-center gap-2 group">
                    <a href="mailto:hello@designforge.studio" className="hover:text-white transition-colors">
                      hello@designforge.studio
                    </a>
                    <button
                      onClick={() => handleCopy('hello@designforge.studio', 'email')}
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1 focus:outline-none"
                      aria-label="Copy email address"
                      title="Copy email address"
                    >
                      {copiedField === 'email' ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </li>

                  <li className="pt-2">
                    <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer block text-[11px]">
                      Terms & Conditions
                    </span>
                  </li>
                  <li>
                    <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer block text-[11px]">
                      Privacy Policy
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Circular Social Media Platform Buttons */}
            <div className="md:col-span-1 flex flex-row md:flex-col items-center md:items-end justify-start gap-3 flex-wrap">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              {/* Behance Icon Badge */}
              <a
                href="https://behance.net"
                target="_blank"
                rel="noreferrer"
                aria-label="Behance"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-bold text-xs"
              >
                Bē
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 3. SIMPLE POPUP FORM (NAME, EMAIL, MESSAGE)                   */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isFormPopupOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#141519] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Popup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Start a Project
                  </h3>
                  <p className="text-sm text-white/70 font-light mt-0.5">
                    Tell us about your project goals and requirements.
                  </p>
                </div>

                <button
                  onClick={handleClosePopup}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Close form"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="pt-6">
                {isSubmitted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display text-xl text-white font-medium">
                        Message Sent
                      </h4>
                      <p className="text-sm sm:text-base text-white/70 font-light max-w-xs mx-auto">
                        Thank you! We've received your note and our studio will follow up with you.
                      </p>
                      {emailQueued && <p className="text-xs text-white/60">A receipt email will be sent to {email}.</p>}
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={handleClosePopup}
                        className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your project, timeline, and deliverables..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-black font-medium text-[14.4px] sm:text-[16.8px] tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
