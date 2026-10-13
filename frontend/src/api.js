const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const searchRoutes = (search) => request(`/api/routes?search=${encodeURIComponent(search)}`);
export const createReport = (body) => request('/api/reports', { method: 'POST', body: JSON.stringify(body) });
export const getReports = (contact) => request(`/api/reports?contact=${encodeURIComponent(contact)}`);
