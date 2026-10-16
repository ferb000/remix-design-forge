import { AdminProject, AdminClient, AdminInquiry, AdminBooking } from '../types';
export { getApiBaseUrl as getAdminApiBaseUrl, setApiBaseUrl as setAdminApiBaseUrl } from '../../services/connection';
import { getApiBaseUrl as getAdminApiBaseUrl } from '../../services/connection';
async function request<T>(endpoint: string, method = 'GET', body?: unknown): Promise<T> {
  const multipart = body instanceof FormData;
  const res = await fetch(getAdminApiBaseUrl() + endpoint, {
    method, credentials: 'include', headers: !multipart ? { 'Content-Type': 'application/json' } : {},
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  if (res.status === 401) window.dispatchEvent(new Event('studio:unauthorized'));
  if (!res.ok || json.success === false) throw new Error(json.message || 'The API request failed.');
  return json.data;
}
function payload(field: string, value: unknown, fileField: string, file?: File) {
  if (!file) return value;
  const metadata = { ...(value as Record<string, unknown>) };
  delete metadata[fileField === 'image' ? 'image' : 'logoUrl'];
  const form = new FormData(); form.append(field, JSON.stringify(metadata)); form.append(fileField, file); return form;
}
export const adminApi = {
  async getProjects() { return { data: await request<AdminProject[]>('/api/projects'), isFallback: false }; },
  createProject(project: Omit<AdminProject, 'id'>, file?: File) { return request<AdminProject>('/api/projects', 'POST', payload('project', project, 'image', file)); },
  deleteProject(id: string) { return request<boolean>('/api/projects/' + encodeURIComponent(id), 'DELETE'); },
  async getClients() { return { data: await request<AdminClient[]>('/api/clients'), isFallback: false }; },
  createClient(client: Omit<AdminClient, 'id'>, file?: File) { return request<AdminClient>('/api/clients', 'POST', payload('client', client, 'logo', file)); },
  deleteClient(id: string) { return request<boolean>('/api/clients/' + encodeURIComponent(id), 'DELETE'); },
  async getInquiries() { return { data: await request<AdminInquiry[]>('/api/inquiries'), isFallback: false }; },
  async updateInquiryStatus(id: string, status: 'new' | 'reviewed' | 'archived') { await request('/api/inquiries/' + encodeURIComponent(id), 'PATCH', { status }); return true; },
  async getBookings() { return { data: await request<AdminBooking[]>('/api/bookings'), isFallback: false }; },
  async checkHealth() { const url = getAdminApiBaseUrl(); try { await request('/api/health'); return { isOnline: true, url }; } catch { return { isOnline: false, url }; } },
};
