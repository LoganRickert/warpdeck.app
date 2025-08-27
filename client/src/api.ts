import type {
  Settings,
  Dashboard,
  DashboardMeta,
  Link,
  DashboardLayout,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateLinkRequest,
  UpdateLinkRequest,
  UpdateSettingsRequest,
} from './types';

const API_BASE = '/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Settings API
export const settingsApi = {
  get: () => apiRequest<Settings>('/settings'),
  update: (data: UpdateSettingsRequest) =>
    apiRequest<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  export: () => {
    const url = `${API_BASE}/settings/export`;
    window.open(url, '_blank');
  },
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/settings/import`, {
      method: 'POST',
      body: formData,
    });
  },
};

// Dashboards API
export const dashboardsApi = {
  getAll: () => apiRequest<Dashboard[]>('/dashboards'),
  getBySlug: (slug: string) => apiRequest<Dashboard>(`/dashboards/${slug}`),
  create: (data: CreateDashboardRequest) =>
    apiRequest<Dashboard>('/dashboards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  import: (data: Dashboard) =>
    apiRequest<Dashboard>('/dashboards/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reorder: (dashboardIds: string[]) =>
    apiRequest<{ message: string; dashboards: any[] }>('/dashboards/reorder', {
      method: 'POST',
      body: JSON.stringify({ dashboardIds }),
    }),
  repair: () =>
    apiRequest<{ message: string; oldSlug?: string; newSlug?: string }>('/dashboards/repair', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  update: (slug: string, data: UpdateDashboardRequest) =>
    apiRequest<Dashboard>(`/dashboards/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (slug: string) =>
    apiRequest<{ message: string }>(`/dashboards/${slug}`, {
      method: 'DELETE',
    }),
  addLink: (slug: string, data: CreateLinkRequest) =>
    apiRequest<Link>(`/dashboards/${slug}/links`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLink: (slug: string, linkId: string, data: UpdateLinkRequest) =>
    apiRequest<Link>(`/dashboards/${slug}/links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLink: (slug: string, linkId: string) =>
    apiRequest<{ message: string }>(`/dashboards/${slug}/links/${linkId}`, {
      method: 'DELETE',
    }),
  refresh: (slug: string) =>
    apiRequest<Dashboard>(`/dashboards/${slug}/refresh`, {
      method: 'POST',
    }),
};

// Utils API
export const utilsApi = {
  getFavicon: (url: string) => `${API_BASE}/favicon?url=${encodeURIComponent(url)}`,
};

// Re-export types for convenience
export type {
  Settings,
  Dashboard,
  DashboardMeta,
  Link,
  DashboardLayout,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateLinkRequest,
  UpdateLinkRequest,
  UpdateSettingsRequest,
};
