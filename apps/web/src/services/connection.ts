// Production uses Nginx's same-origin /api route. Local development uses Vite's proxy.
export const getApiBaseUrl = (): string => {
  const configured = (import.meta as any).env?.VITE_API_BASE_URL || '';
  const custom = (import.meta as any).env?.DEV ? localStorage.getItem('design_forge_api_base_url') : '';
  return (custom?.trim() || configured).replace(/\/+$/, '');
};
export const setApiBaseUrl = (url: string): void => {
  if ((import.meta as any).env?.DEV) localStorage.setItem('design_forge_api_base_url', url.trim().replace(/\/+$/, ''));
};
