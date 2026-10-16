import React, { useState, useEffect, useCallback } from 'react';
import { AdminProject, AdminClient, AdminInquiry, AdminBooking } from '../types';
import { adminApi } from '../services/adminApi';
import { AdminHeader } from './AdminHeader';
import { ProjectsManager } from './ProjectsManager';
import { ClientsManager } from './ClientsManager';
import { InquiriesInbox } from './InquiriesInbox';
import { BookingsManager } from './BookingsManager';
import { ApiSettingsModal } from './ApiSettingsModal';
import { Briefcase, Users, Mail, Calendar } from 'lucide-react';

interface AdminDashboardProps {
  onSwitchToPublic?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchToPublic }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'clients' | 'inquiries' | 'bookings'>('projects');
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projRes, clientRes, inqRes, bookRes, healthRes] = await Promise.all([
        adminApi.getProjects(),
        adminApi.getClients(),
        adminApi.getInquiries(),
        adminApi.getBookings(),
        adminApi.checkHealth(),
      ]);

      setProjects(projRes.data);
      setClients(clientRes.data);
      setInquiries(inqRes.data);
      setBookings(bookRes.data);
      setIsApiConnected(healthRes.isOnline);
    } catch (err) {
      console.warn('Error loading admin data:', err);
      setIsApiConnected(false);
      window.alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f5f7] flex flex-col">
      <AdminHeader
        isApiConnected={isApiConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwitchToPublic={onSwitchToPublic}
      />

      {/* Navigation Sub-bar */}
      <div className="w-full bg-[#0d0e12] border-b border-white/5 px-4 sm:px-8 py-2.5 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Portfolio Works ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'clients'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client Logos ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap relative ${
              activeTab === 'inquiries'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inquiries ({inquiries.length})</span>
            {newInquiriesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultations ({bookings.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-white/40 text-xs font-mono">
            Loading Studio Data...
          </div>
        ) : (
          <>
            {activeTab === 'projects' && (
              <ProjectsManager projects={projects} onRefresh={loadData} />
            )}
            {activeTab === 'clients' && (
              <ClientsManager clients={clients} onRefresh={loadData} />
            )}
            {activeTab === 'inquiries' && (
              <InquiriesInbox inquiries={inquiries} onRefresh={loadData} />
            )}
            {activeTab === 'bookings' && (
              <BookingsManager bookings={bookings} />
            )}
          </>
        )}
      </main>

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConnectionChange={(online) => { setIsApiConnected(online); loadData(); }}
      />
    </div>
  );
};
