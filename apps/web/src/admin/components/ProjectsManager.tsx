import React, { useState, useRef } from 'react';
import { AdminProject, ProjectCategory } from '../types';
import { adminApi } from '../services/adminApi';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface ProjectsManagerProps {
  projects: AdminProject[];
  onRefresh: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState<string>('');

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('still-images');
  const [architect, setArchitect] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!imagePreview && !imageUrl)) return;

    setIsUploading(true);
    try {
      await adminApi.createProject(
        {
          title,
          category,
          architect: architect || 'Design Forge Studio',
          location: location || 'International',
          year: year || '2026',
          description: description || 'High-end architectural spatial visualization.',
          image: imagePreview || imageUrl,
          pipeline: 'Unreal Engine 5.4 / 3ds Max / Corona 12',
          aspectRatio: '16:9 Cinematic',
        },
        imageFile || undefined
      );

      setNotification(`Project "${title}" published successfully!`);
      setTitle('');
      setArchitect('');
      setLocation('');
      setDescription('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setIsFormOpen(false);
      onRefresh();

      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Failed creating project:', err);
      window.alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove "${projTitle}" from the studio portfolio?`)) {
      return;
    }
    try {
      await adminApi.deleteProject(id);
    } catch (error) {
      window.alert((error as Error).message);
      return;
    }
    setNotification(`Project "${projTitle}" removed.`);
    onRefresh();
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111216] p-4 rounded-xl border border-white/10">
        <div>
          <h2 className="text-lg font-medium text-white font-display">
            Portfolio Work Archive ({projects.length} Works)
          </h2>
          <p className="text-xs text-white/50">
            Upload new CGI renders, manage active client showcase pieces, and categorize works.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cancel Upload' : 'Upload New Project'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Upload Form Accordion */}
      {isFormOpen && (
        <form
          onSubmit={handleCreate}
          className="bg-[#14151a] border border-white/15 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono tracking-widest uppercase text-white/70">
              New Architectural Project Upload
            </span>
            <span className="text-[11px] text-white/40 font-mono">Status: Draft</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kyoto Zen Sanctuary Pavilion"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1b22] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
              >
                <option value="still-images">Still Images (Exteriors & Interiors)</option>
                <option value="animations">Animations (Video Films)</option>
                <option value="vr">VR (Real-time Spatial)</option>
                <option value="360-panoramas">360 Panoramas (CGI Tours)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                Architectural Firm / Client
              </label>
              <input
                type="text"
                value={architect}
                onChange={(e) => setArchitect(e.target.value)}
                placeholder="e.g. Snøhetta"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Oslo, Norway"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/60 mb-1">
              Narrative Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architectural concept, materiality, atmospheric lighting, and design vision..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-mono uppercase text-white/60 mb-1">
              Visual Render File or URL *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl p-4 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto text-white/40 mb-1" />
                <span className="text-xs text-white/70 block font-medium">Click to upload file</span>
                <span className="text-[10px] text-white/40 font-mono">JPG, PNG, WebP up to 50MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <span className="text-[10px] text-white/40 font-mono block mb-1">Or paste image URL:</span>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {imagePreview && (
              <div className="mt-3 relative w-full sm:w-64 aspect-[16/9] rounded-lg overflow-hidden border border-white/20">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                    setImageUrl('');
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white/80 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
              {isUploading ? 'Publishing Render...' : 'Publish Project'}
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Works' },
          { id: 'still-images', label: 'Still Images' },
          { id: 'animations', label: 'Animations' },
          { id: 'vr', label: 'VR Spatial' },
          { id: '360-panoramas', label: '360 Panoramas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-white text-black font-semibold'
                : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="group bg-[#111216] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/80 uppercase">
                  {proj.category.replace('-', ' ')}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/60">
                  {proj.year}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="font-medium text-white text-sm line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-white/60 font-mono">
                  {proj.architect} · {proj.location}
                </p>
                <p className="text-xs text-white/40 line-clamp-2 pt-1 font-light leading-relaxed">
                  {proj.description}
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
              <span className="text-[10px] font-mono text-white/30">ID: {proj.id}</span>
              <button
                onClick={() => handleDelete(proj.id, proj.title)}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
