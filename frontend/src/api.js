const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const TOKEN_KEY = 'cl_admin_token';
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
};

async function request(path, options = {}, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth) {
    setToken('');
    window.dispatchEvent(new Event('cl-auth-expired'));
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Public (unchanged)
export const searchRoutes = (search) => request(`/api/routes?search=${encodeURIComponent(search)}`);
export const createReport = (body) => request('/api/reports', { method: 'POST', body: JSON.stringify(body) });
export const getReports = (contact) => request(`/api/reports?contact=${encodeURIComponent(contact)}`);

// Staff
export const adminLogin = (password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
export const adminRoutes = () => request('/api/admin/routes', {}, true);
export const adminCreateRoute = (b) => request('/api/admin/routes', { method: 'POST', body: JSON.stringify(b) }, true);
export const adminUpdateRoute = (id, b) => request(`/api/admin/routes/${id}`, { method: 'PUT', body: JSON.stringify(b) }, true);
export const adminDeleteRoute = (id) => request(`/api/admin/routes/${id}`, { method: 'DELETE' }, true);
export const adminReports = () => request('/api/admin/reports', {}, true);
export const adminSetStatus = (id, status) => request(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, true);
