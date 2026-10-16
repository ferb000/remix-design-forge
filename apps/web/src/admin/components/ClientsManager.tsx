import React, { useState, useRef } from 'react';
import { AdminClient } from '../types';
import { adminApi } from '../services/adminApi';
import { Plus, Trash2, Upload, CheckCircle2, Building } from 'lucide-react';

interface ClientsManagerProps {
  clients: AdminClient[];
  onRefresh: () => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({ clients, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsUploading(true);
    try {
      await adminApi.createClient(
        {
          name: name.toUpperCase(),
          subtitle: subtitle ? subtitle.toUpperCase() : undefined,
          logoUrl: logoPreview || logoUrl || undefined,
        },
        logoFile || undefined
      );

      setNotification(`Client "${name}" added to showcase!`);
      setName('');
      setSubtitle('');
      setLogoUrl('');
      setLogoFile(null);
      setLogoPreview('');
      setIsFormOpen(false);
      onRefresh();

      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Failed creating client:', err);
      window.alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${clientName}" from client logos?`)) {
      return;
    }
    try {
      await adminApi.deleteClient(id);
    } catch (error) {
      window.alert((error as Error).message);
      return;
    }
    setNotification(`Client "${clientName}" removed.`);
    onRefresh();
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111216] p-4 rounded-xl border border-white/10">
        <div>
          <h2 className="text-lg font-medium text-white font-display">
            Client Logos & Brand Partners ({clients.length})
          </h2>
          <p className="text-xs text-white/50">
            Add or remove architectural firms, developers, and partner studio logos displayed in the client slider.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cancel' : 'Add Client Logo'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Add Client Form */}
      {isFormOpen && (
        <form
          onSubmit={handleCreate}
          className="bg-[#14151a] border border-white/15 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono tracking-widest uppercase text-white/70">
              New Client Partner Emblem
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                Client / Firm Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. RENZO PIANO BUILDING WORKSHOP"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                Location / Subtitle (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. GENOA / PARIS / NYC"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Logo Upload or URL */}
          <div>
            <label className="block text-xs font-mono uppercase text-white/60 mb-1">
              Logo Graphic (SVG, PNG, or URL)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl p-4 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto text-white/40 mb-1" />
                <span className="text-xs text-white/70 block font-medium">Upload Logo Image</span>
                <span className="text-[10px] text-white/40 font-mono">Transparent SVG or PNG recommended</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <span className="text-[10px] text-white/40 font-mono block mb-1">Or paste logo image URL:</span>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    if (e.target.value) setLogoPreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {logoPreview && (
              <div className="mt-3 relative w-32 h-16 rounded-lg bg-white/5 border border-white/20 p-2 flex items-center justify-center">
                <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview('');
                    setLogoFile(null);
                    setLogoUrl('');
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg text-white/60 hover:text-white text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-lg bg-white text-black text-xs font-semibold tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="group relative bg-[#111216] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/25 transition-all text-center min-h-[140px]"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              {client.logoUrl ? (
                <div className="h-12 w-full flex items-center justify-center mb-2">
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="max-h-12 max-w-[80%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-white/50 group-hover:text-white">
                  <Building className="w-5 h-5" />
                </div>
              )}

              <h4 className="font-semibold text-xs tracking-wider text-white uppercase mt-1">
                {client.name}
              </h4>
              {client.subtitle && (
                <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase mt-0.5">
                  {client.subtitle}
                </span>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30">
              <span>{client.id}</span>
              <button
                onClick={() => handleDelete(client.id, client.name)}
                className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Remove client"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
