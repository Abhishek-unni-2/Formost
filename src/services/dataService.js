/* ============================================================
   Data layer — talks to the /api/* serverless routes (Neon).
   Same public surface the app used with Supabase, so callers
   (App.jsx, Settings.jsx) are unchanged apart from the import.

   Every fetch returns { data, error }; every save returns
   { data, error }; every delete returns { error }.
   When the API is not available (local dev without `vercel dev`)
   the app runs in offline mock-data mode.
   ============================================================ */

const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/;

const useApi =
  typeof window !== 'undefined' &&
  (!LOCAL_HOSTS.test(window.location.hostname) ||
    import.meta.env.VITE_USE_API === '1');

export const isConfigured = () => useApi;

async function api(path, opts = {}) {
  if (!useApi) return { data: null, error: 'offline' };
  try {
    const r = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) return { data: null, error: json.error || `HTTP ${r.status}` };
    return { data: json.data ?? null, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

/* ---------- Districts (no field remapping needed) ---------- */
export const fetchDistricts = () => api('/districts');

export const saveDistrict = (district) => {
  const payload = { ...district };
  if (!payload.id) delete payload.id;
  return api('/districts', { method: 'POST', body: JSON.stringify(payload) });
};

export const deleteDistrict = (id) =>
  api(`/districts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

/* ---------- Users ---------- */
const userToDb = (u) => {
  const p = {
    name: u.name,
    role: u.role,
    pass: u.pass,
    district_id: u.districtId,
    phone: u.phone || '',
    email: u.email || '',
    photo: u.photo || '',
  };
  if (u.id) p.id = u.id;
  return p;
};
const userFromDb = (u) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  pass: u.pass,
  districtId: u.district_id,
  phone: u.phone || '',
  email: u.email || '',
  photo: u.photo || '',
});

export const fetchUsers = async () => {
  const { data, error } = await api('/users');
  return { data: data ? data.map(userFromDb) : null, error };
};
export const saveUser = async (user) => {
  const { data, error } = await api('/users', {
    method: 'POST',
    body: JSON.stringify(userToDb(user)),
  });
  return { data: data ? userFromDb(data) : null, error };
};
export const deleteUser = (id) =>
  api(`/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

/* ---------- Steps (desc <-> description) ---------- */
const stepToDb = (s) => ({
  num: s.num,
  icon: s.icon,
  title: s.title,
  role: s.role,
  dept: s.dept,
  description: s.desc,
});
const stepFromDb = (s) => ({
  num: s.num,
  icon: s.icon,
  title: s.title,
  role: s.role,
  dept: s.dept,
  desc: s.description,
});

export const fetchSteps = async () => {
  const { data, error } = await api('/steps');
  return { data: data ? data.map(stepFromDb) : null, error };
};
export const saveStep = async (step) => {
  const { data, error } = await api('/steps', {
    method: 'POST',
    body: JSON.stringify(stepToDb(step)),
  });
  return { data: data ? stepFromDb(data) : null, error };
};
export const deleteStep = (num) =>
  api(`/steps?num=${encodeURIComponent(num)}`, { method: 'DELETE' });

/* ---------- Leads ---------- */
const leadToDb = (l) => {
  const p = {
    name: l.name,
    phone: l.phone,
    location: l.location,
    system: l.system || '',
    source: l.source || '',
    stage: l.stage,
    status: l.status,
    notes: l.notes || '',
    date: l.date,
    district_id: l.districtId,
  };
  if (l.id) p.id = l.id;
  return p;
};
const leadFromDb = (l) => ({
  id: l.id,
  name: l.name,
  phone: l.phone,
  location: l.location,
  system: l.system,
  source: l.source,
  stage: l.stage,
  status: l.status,
  notes: l.notes,
  date: l.date,
  districtId: l.district_id,
});

export const fetchLeads = async () => {
  const { data, error } = await api('/leads');
  return { data: data ? data.map(leadFromDb) : null, error };
};
export const saveLead = async (lead) => {
  const { data, error } = await api('/leads', {
    method: 'POST',
    body: JSON.stringify(leadToDb(lead)),
  });
  return { data: data ? leadFromDb(data) : null, error };
};
export const deleteLead = (id) =>
  api(`/leads?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

/* ---------- Quotations ---------- */
const quoteToDb = (q) => {
  const p = {
    customer_name: q.customerName,
    place: q.place || '',
    phone: q.phone || '',
    kw: q.kw,
    amount: q.amount,
    date: q.date,
    notes: q.notes || '',
    created_by: q.createdBy,
    district_id: q.districtId,
  };
  if (q.id) p.id = q.id;
  return p;
};
const quoteFromDb = (q) => ({
  id: q.id,
  customerName: q.customer_name,
  place: q.place || '',
  phone: q.phone || '',
  kw: q.kw,
  amount: q.amount,
  date: q.date,
  notes: q.notes || '',
  createdBy: q.created_by,
  districtId: q.district_id,
});

export const fetchQuotations = async () => {
  const { data, error } = await api('/quotations');
  return { data: data ? data.map(quoteFromDb) : null, error };
};
export const saveQuotation = async (q) => {
  const { data, error } = await api('/quotations', {
    method: 'POST',
    body: JSON.stringify(quoteToDb(q)),
  });
  return { data: data ? quoteFromDb(data) : null, error };
};
export const deleteQuotation = (id) =>
  api(`/quotations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

/* ---------- Settings (single JSON blob) ---------- */
export const fetchSettings = () => api('/settings');

export const saveSettings = async (config) => {
  const { error } = await api('/settings', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
  return { error };
};
