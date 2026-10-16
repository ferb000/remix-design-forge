import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface AdminLoginProps {
  onSwitchToPublic?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSwitchToPublic }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#090a0d] relative overflow-hidden">
      {/* Background Architectural Ambient Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Top Bar Switcher back to public portfolio */}
      {onSwitchToPublic && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onSwitchToPublic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <span>View Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="relative w-full max-w-md bg-[#111216]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Studio Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 text-white shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/50 block mb-1">
            Design Forge Studio
          </span>
          <h1 className="text-2xl font-light tracking-wide text-white font-display">
            Admin Console Portal
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Authorized architectural personnel only
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@designforge.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.07] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.07] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 h-11 rounded-xl bg-white text-black font-medium text-sm tracking-wide hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In To Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
