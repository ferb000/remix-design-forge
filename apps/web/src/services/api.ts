import { ALL_GALLERY_PROJECTS, GalleryProject } from '../components/FullScreenWorkGallery';
import { CLIENT_LOGOS } from '../components/OurClientsSlider';
export interface ClientItem { id: string; name: string; subtitle?: string; icon?: React.ReactNode; logoUrl?: string; }
export interface InquiryPayload { name: string; email: string; message: string; submittedAt?: string; }
export interface BookingPayload {
  serviceId: string; serviceName: string; date: string; time: string; name: string; email: string;
  phone?: string; role?: string; notes?: string; submittedAt?: string;
  projectName?: string; firmName?: string; location?: string; budget?: string; timeline?: string;
}
export interface ApiResponse<T> { success: boolean; data: T; message?: string; isFallback?: boolean; }
export interface ConsultationSlot { time: string; startsAt: string; endsAt: string; available: boolean; }
export interface BookingAvailability { timeZone: string; durationMinutes: number; dates: { date: string; slots: ConsultationSlot[] }[]; }
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export { getApiBaseUrl, setApiBaseUrl } from './connection';
import { getApiBaseUrl } from './connection';
export const ENDPOINTS = {
  PROJECTS: '/api/projects', PROJECT_BY_ID: (id: string) => '/api/projects/' + encodeURIComponent(id),
  CLIENTS: '/api/clients', CLIENT_BY_ID: (id: string) => '/api/clients/' + encodeURIComponent(id),
  INQUIRIES: '/api/inquiries', BOOKINGS: '/api/bookings', UPLOAD: '/api/upload', HEALTH: '/api/health',
};
async function request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<ApiResponse<T>> {
  const multipart = body instanceof FormData;
  const res = await fetch(getApiBaseUrl() + endpoint, {
    method, credentials: 'include', headers: !multipart ? { 'Content-Type': 'application/json' } : {},
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new ApiError(json.message || 'The studio could not receive your request. Please try again.', res.status);
  return { ...json, isFallback: false };
}
function payload(field: string, value: unknown, fileField: string, file?: File) {
  if (!file) return value;
  const metadata = { ...(value as Record<string, unknown>) };
  delete metadata[fileField === 'image' ? 'image' : 'logoUrl'];
  const form = new FormData(); form.append(field, JSON.stringify(metadata)); form.append(fileField, file); return form;
}
export const projectsApi = {
  async getAll(): Promise<ApiResponse<GalleryProject[]>> {
    try { return await request<GalleryProject[]>(ENDPOINTS.PROJECTS); }
    catch { return { success: true, data: ALL_GALLERY_PROJECTS, isFallback: true }; }
  },
  create(project: Omit<GalleryProject, 'id'>, file?: File) { return request<GalleryProject>(ENDPOINTS.PROJECTS, 'POST', payload('project', project, 'image', file)); },
  update(id: string, updates: Partial<GalleryProject>) { return request<GalleryProject>(ENDPOINTS.PROJECT_BY_ID(id), 'PUT', updates); },
  delete(id: string) { return request<boolean>(ENDPOINTS.PROJECT_BY_ID(id), 'DELETE'); },
};
export const clientsApi = {
  async getAll(): Promise<ApiResponse<ClientItem[]>> {
    try {
      const response = await request<ClientItem[]>(ENDPOINTS.CLIENTS);
      response.data = response.data.map(client => ({ ...client, icon: CLIENT_LOGOS.find(original => original.id === client.id)?.icon }));
      return response;
    } catch { return { success: true, data: CLIENT_LOGOS, isFallback: true }; }
  },
  create(client: Omit<ClientItem, 'id'>, file?: File) { return request<ClientItem>(ENDPOINTS.CLIENTS, 'POST', payload('client', client, 'logo', file)); },
  delete(id: string) { return request<boolean>(ENDPOINTS.CLIENT_BY_ID(id), 'DELETE'); },
};
export const inquiriesApi = {
  submit(payload: InquiryPayload) { return request<{ received: boolean; id: string; emailStatus: 'queued' | 'disabled' }>(ENDPOINTS.INQUIRIES, 'POST', payload); },
};
export const bookingsApi = {
  getAvailability() { return request<BookingAvailability>('/api/bookings/availability'); },
  submit(payload: BookingPayload) { return request<{ booked: boolean; reservationId: string; emailStatus: 'queued' | 'disabled' }>(ENDPOINTS.BOOKINGS, 'POST', payload); },
  async checkHealth() { const url = getApiBaseUrl(); try { await request(ENDPOINTS.HEALTH); return { isOnline: true, url }; } catch { return { isOnline: false, url }; } },
};
