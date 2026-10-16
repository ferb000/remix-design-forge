import React, { useState } from 'react';
import { getAdminApiBaseUrl, setAdminApiBaseUrl, adminApi } from '../services/adminApi';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Globe } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (isOnline: boolean) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [url, setUrl] = useState(getAdminApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ checked: boolean; isOnline: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setAdminApiBaseUrl(url);
    const health = await adminApi.checkHealth();
    setIsTesting(false);
    setTestResult({ checked: true, isOnline: health.isOnline });
    onConnectionChange(health.isOnline);
  };

  const handleClearUrl = () => {
    setUrl('');
    setAdminApiBaseUrl('');
    setTestResult(null);
    onConnectionChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#14151a] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-white/80" />
            <h3 className="text-base font-medium text-white font-display">
              Studio API Backend Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-mono uppercase text-white/60 mb-1.5">
              Backend REST API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                disabled={!(import.meta as any).env?.DEV}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.yourstudio.com"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
              />
              <button
                onClick={handleSaveAndTest}
                disabled={isTesting}
                className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                <span>Test & Save</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                testResult.isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {testResult.isOnline ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>API backend reachable! Live data sync active.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Could not reach the API. Management actions require a working connection.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Endpoints specification */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2">
            <span className="font-mono text-white/50 block text-[11px] uppercase tracking-wider">
              Expected Backend Endpoints
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-white/70">
              <div className="flex justify-between">
                <span className="text-emerald-400">POST /api/auth/login</span>
                <span className="text-white/40">Authenticate admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">GET/POST /api/projects</span>
                <span className="text-white/40">Portfolio CRUD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">GET/POST /api/clients</span>
                <span className="text-white/40">Client logos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">GET /api/inquiries</span>
                <span className="text-white/40">Contact leads</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">GET /api/bookings</span>
                <span className="text-white/40">Consultations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <button
            onClick={handleClearUrl}
            className="text-xs text-white/40 hover:text-white font-mono cursor-pointer"
          >
            Reset to Default API
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
