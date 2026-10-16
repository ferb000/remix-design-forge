import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GalleryProject, ALL_GALLERY_PROJECTS } from '../components/FullScreenWorkGallery';
import { CLIENT_LOGOS } from '../components/OurClientsSlider';
import {
  projectsApi,
  clientsApi,
  ClientItem,
  getApiBaseUrl,
  setApiBaseUrl as saveApiBaseUrl,
  bookingsApi,
} from '../services/api';

interface StudioDataContextType {
  projects: GalleryProject[];
  clients: ClientItem[];
  isLoading: boolean;
  isFallbackMode: boolean;
  apiBaseUrl: string;
  isApiConnected: boolean;
  setApiBaseUrl: (url: string) => void;
  checkApiConnection: () => Promise<boolean>;
  addProject: (newProject: Omit<GalleryProject, 'id'>, imageFile?: File) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addClient: (newClient: Omit<ClientItem, 'id'>, logoFile?: File) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const StudioDataContext = createContext<StudioDataContextType | undefined>(undefined);

export const StudioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<GalleryProject[]>(ALL_GALLERY_PROJECTS);
  const [clients, setClients] = useState<ClientItem[]>(CLIENT_LOGOS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(getApiBaseUrl());
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  const checkApiConnection = useCallback(async (): Promise<boolean> => {
    const health = await bookingsApi.checkHealth();
    setIsApiConnected(health.isOnline);
    return health.isOnline;
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projRes, clientRes] = await Promise.all([
        projectsApi.getAll(),
        clientsApi.getAll(),
      ]);

      if (projRes.data) {
        setProjects(projRes.data);
      }
      if (clientRes.data) {
        setClients(clientRes.data);
      }

      setIsFallbackMode(Boolean(projRes.isFallback || clientRes.isFallback));
    } catch (err) {
      console.warn('[StudioDataProvider] Error refreshing data, using fallbacks:', err);
      setIsFallbackMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    checkApiConnection();
    const refreshOnFocus = () => { refreshData(); checkApiConnection(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [refreshData, checkApiConnection]);

  const handleSetApiBaseUrl = (url: string) => {
    saveApiBaseUrl(url);
    setApiBaseUrlState(url);
    checkApiConnection();
    refreshData();
  };

  const addProject = async (newProject: Omit<GalleryProject, 'id'>, imageFile?: File): Promise<boolean> => {
    try {
      const res = await projectsApi.create(newProject, imageFile);
      if (res.success && res.data) {
        setProjects((prev) => [res.data, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding project:', err);
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const res = await projectsApi.delete(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting project:', err);
      return false;
    }
  };

  const addClient = async (newClient: Omit<ClientItem, 'id'>, logoFile?: File): Promise<boolean> => {
    try {
      const res = await clientsApi.create(newClient, logoFile);
      if (res.success && res.data) {
        setClients((prev) => [...prev, res.data]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding client:', err);
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const res = await clientsApi.delete(id);
      if (res.success) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting client:', err);
      return false;
    }
  };

  return (
    <StudioDataContext.Provider
      value={{
        projects,
        clients,
        isLoading,
        isFallbackMode,
        apiBaseUrl,
        isApiConnected,
        setApiBaseUrl: handleSetApiBaseUrl,
        checkApiConnection,
        addProject,
        deleteProject,
        addClient,
        deleteClient,
        refreshData,
      }}
    >
      {children}
    </StudioDataContext.Provider>
  );
};

export const useStudioData = (): StudioDataContextType => {
  const context = useContext(StudioDataContext);
  if (!context) {
    throw new Error('useStudioData must be used within a StudioDataProvider');
  }
  return context;
};
