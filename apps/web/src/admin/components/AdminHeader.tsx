import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Settings2, Wifi, WifiOff, ExternalLink } from 'lucide-react';

interface AdminHeaderProps {
  isApiConnected: boolean;
  onOpenSettings: () => void;
  onSwitchToPublic?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isApiConnected,
  onOpenSettings,
  onSwitchToPublic,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-[#111216] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
      {/* Brand & Console Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display text-sm font-semibold tracking-wider text-white block">
            DESIGN FORGE
          </span>
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
            Admin Studio Console
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Switch to Public Site */}
        {onSwitchToPublic && (
          <button
            onClick={onSwitchToPublic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title="Open Public Showcase Website"
          >
            <span>Live Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* API Status Pill */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border cursor-pointer transition-colors ${
            isApiConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title="Click to configure API Base URL"
        >
          {isApiConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">
            {isApiConnected ? 'API Connected' : 'API Unavailable'}
          </span>
          <Settings2 className="w-3 h-3 ml-0.5 opacity-60" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="hidden md:block text-right">
            <span className="text-xs text-white font-medium block leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-white/40 font-mono uppercase">
              {user?.role?.replace('_', ' ') || 'Super Admin'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-mono text-white uppercase">
            {user?.name ? user.name[0] : 'A'}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
