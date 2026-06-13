/* global API service — all endpoint calls live here */
function resolveApiBase() {
  // Set in core/config.js (generated from project root .env via npm run sync-env)
  if (window.API_BASE) return window.API_BASE.replace(/\/$/, '');
  console.error('Missing window.API_BASE. Run npm run sync-env from the project root.');
  return 'http://127.0.0.1:8000/api';
}

const BASE = resolveApiBase();

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, body, isFile = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFile) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  } else {
    headers['Accept'] = 'application/json';
  }
  const opts = { method, headers };
  if (body) opts.body = isFile ? body : JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.errors
      ? (data.message || Object.values(data.errors || {}).flat().join(' '))
      : `HTTP ${res.status}`;
    if (window.Toast) Toast.error(msg);
    throw new Error(msg);
  }
  return data;
}

const GET = (p) => request('GET', p);
const POST = (p, b, f) => request('POST', p, b, f);
const PUT = (p, b, f) => request('PUT', p, b, f);
const DEL = (p) => request('DELETE', p);

const API = {
  /* Auth */
  register: (d) => POST('/register', d),
  login: (d) => POST('/login', d),
  logout: () => POST('/logout', {}),
  me: () => GET('/me'),
  updateProfile: (fd) => request('POST', '/me?_method=PATCH', fd, true),
  getUsers: () => GET('/users'),
  adminCreateStaff: (d) => POST('/users/create-staff', d),
  adminCreateUser: (d) => POST('/users/create-user', d),
  adminUpdateUser: (id, d) => request('POST', `/users/${id}?_method=PUT`, d),
  adminDeleteUser: (id) => DEL(`/users/${id}`),
  getScan: (code) => GET(`/scan/${code}`),
  getActivityLogs: (q) => GET('/activity-logs' + (q ? '?' + q : '')),

  /* Public */
  publicCategories: () => GET('/public/categories'),
  publicFoundItems: (q) => GET('/public/found-items' + (q ? '?' + q : '')),
  publicLostItems: (q) => GET('/public/lost-items' + (q ? '?' + q : '')),
  publicFoundItemById: (id) => GET(`/public/found-items/id/${id}`),
  publicFoundItemByRef: (code) => GET(`/public/found-items/${code}`),

  /* Categories (admin) */
  getCategories: () => GET('/categories'),
  lookupCategories: () => GET('/lookup/categories'),
  createCategory: (d) => POST('/categories', d),
  updateCategory: (id, d) => PUT(`/categories/${id}`, d),
  deleteCategory: (id) => DEL(`/categories/${id}`),
  importCategories: (f) => POST('/imports/categories', f, true),

  /* Lost Items */
  getLostItems: () => GET('/lost-items'),
  getLostItem: (id) => GET(`/lost-items/${id}`),
  getLostItemMatches: (id, limit = 10) => GET(`/lost-items/${id}/matches?limit=${encodeURIComponent(limit)}`),
  createLostItem: (d, f) => POST('/lost-items', d, f),
  updateLostItem: (id, d, f) => request('POST', `/lost-items/${id}?_method=PUT`, d, f),
  deleteLostItem: (id) => DEL(`/lost-items/${id}`),

  /* Found Items */
  getFoundItems: () => GET('/found-items'),
  getFoundItem: (id) => GET(`/found-items/${id}`),
  getFoundItemMatches: (id, limit = 10) => GET(`/found-items/${id}/matches?limit=${encodeURIComponent(limit)}`),
  createFoundItem: (d, f) => POST('/found-items', d, f),
  updateFoundItem: (id, d, f) => request('POST', `/found-items/${id}?_method=PUT`, d, f),
  deleteFoundItem: (id) => DEL(`/found-items/${id}`),
  archiveFoundItem: (id) => POST(`/found-items/${id}/archive`, {}),
  regenerateQr: (id) => POST(`/found-items/${id}/regenerate-qr`, {}),

  /* Claim Requests */
  getClaimRequests: () => GET('/claim-requests'),
  getClaimRequest: (id) => GET(`/claim-requests/${id}`),
  getClaimActivity: (id, limit = 50) => GET(`/claim-requests/${id}/activity?limit=${encodeURIComponent(limit)}`),
  createClaimRequest: (d, f) => POST('/claim-requests', d, f),
  updateClaimRequest: (id, d, f) => request('POST', `/claim-requests/${id}?_method=PUT`, d, f),
  updateClaimNotes: (id, staff_notes) => request('PATCH', `/claim-requests/${id}/notes`, { staff_notes }),
  deleteClaimRequest: (id) => DEL(`/claim-requests/${id}`),
  approveClaim: (id) => POST(`/claim-requests/${id}/approve`, {}),
  rejectClaim: (id) => POST(`/claim-requests/${id}/reject`, {}),
  releaseClaim: (id, pickup_code) => POST(`/claim-requests/${id}/release`, { pickup_code }),
  reissuePickupCode: (id) => POST(`/claim-requests/${id}/reissue-pickup-code`, {}),

  /* Exports */
  exportCategories: () => openExport('/exports/categories'),
  exportLostItems: () => openExport('/exports/lost-items'),
  exportFoundItems: () => openExport('/exports/found-items'),
  exportClaimRequests: () => openExport('/exports/claim-requests'),

  /* Print */
  printFoundItemSlip: (id) => openPrint(`/print/found-items/${id}`),
  printClaimReceipt: (id) => openPrint(`/print/claims/${id}`),
  printLostItemReport: (id) => openPrint(`/print/lost-items/${id}`),
  printClaimsSummary: () => openPrint('/print/reports/claims'),
};

function openExport(path) {
  const token = getToken();
  if (!token) {
    const msg = 'Please sign in to export data.';
    if (window.Toast) Toast.error(msg);
    else if (window.toast) toast(msg, 'error');
    return;
  }
  window.open(`${BASE}${path}?token=${encodeURIComponent(token)}`, '_blank');
}

function resolveServerBase() {
  return resolveApiBase().replace(/\/api$/, '');
}

function openPrint(path) {
  const token = getToken();
  if (!token) {
    const msg = 'Please sign in to print.';
    if (window.Toast) Toast.error(msg);
    else if (window.toast) toast(msg, 'error');
    return;
  }
  window.open(`${resolveServerBase()}${path}?token=${encodeURIComponent(token)}`, '_blank');
}
