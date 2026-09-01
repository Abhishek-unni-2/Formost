import { supabase } from '../supabaseClient';

// Helper to check configuration
export const isConfigured = () => !!supabase;

// --- Districts Mapping & CRUD ---
export const fetchDistricts = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('id', { ascending: true });
  return { data, error };
};

export const saveDistrict = async (district) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  // If id is present, it's an upsert/update; otherwise we let database assign serial id
  const payload = { ...district };
  if (!payload.id) {
    delete payload.id;
  }
  const { data, error } = await supabase
    .from('districts')
    .upsert(payload)
    .select();
  return { data: data ? data[0] : null, error };
};

export const deleteDistrict = async (id) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { error } = await supabase
    .from('districts')
    .delete()
    .eq('id', id);
  return { error };
};

// --- Users Mapping & CRUD ---
const mapUserToDb = (user) => {
  const payload = {
    name: user.name,
    role: user.role,
    pass: user.pass,
    district_id: user.districtId,
    phone: user.phone || '',
    email: user.email || '',
    photo: user.photo || ''
  };
  if (user.id) {
    payload.id = user.id;
  }
  return payload;
};

const mapUserFromDb = (dbUser) => ({
  id: dbUser.id,
  name: dbUser.name,
  role: dbUser.role,
  pass: dbUser.pass,
  districtId: dbUser.district_id,
  phone: dbUser.phone || '',
  email: dbUser.email || '',
  photo: dbUser.photo || ''
});

export const fetchUsers = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('id', { ascending: true });
  return { data: data ? data.map(mapUserFromDb) : null, error };
};

export const saveUser = async (user) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const payload = mapUserToDb(user);
  const { data, error } = await supabase
    .from('users')
    .upsert(payload)
    .select();
  return { data: data ? mapUserFromDb(data[0]) : null, error };
};

export const deleteUser = async (id) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  return { error };
};

// --- Steps Mapping & CRUD ---
const mapStepToDb = (step) => ({ ...step, description: step.desc, desc: undefined });
const mapStepFromDb = (s) => ({ ...s, desc: s.description, description: undefined });

export const fetchSteps = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .order('num', { ascending: true });
  return { data: data ? data.map(mapStepFromDb) : null, error };
};

export const saveStep = async (step) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('steps')
    .upsert(mapStepToDb(step))
    .select();
  return { data: data ? mapStepFromDb(data[0]) : null, error };
};

export const deleteStep = async (num) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { error } = await supabase
    .from('steps')
    .delete()
    .eq('num', num);
  return { error };
};

// --- Leads Mapping & CRUD ---
const mapLeadToDb = (lead) => {
  const payload = {
    name: lead.name,
    phone: lead.phone,
    location: lead.location,
    system: lead.system || '',
    source: lead.source || '',
    stage: lead.stage,
    status: lead.status,
    notes: lead.notes || '',
    date: lead.date,
    district_id: lead.districtId
  };
  if (lead.id) {
    payload.id = lead.id;
  }
  return payload;
};

const mapLeadFromDb = (dbLead) => ({
  id: dbLead.id,
  name: dbLead.name,
  phone: dbLead.phone,
  location: dbLead.location,
  system: dbLead.system,
  source: dbLead.source,
  stage: dbLead.stage,
  status: dbLead.status,
  notes: dbLead.notes,
  date: dbLead.date,
  districtId: dbLead.district_id
});

export const fetchLeads = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('id', { ascending: true });
  return { data: data ? data.map(mapLeadFromDb) : null, error };
};

export const saveLead = async (lead) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const payload = mapLeadToDb(lead);
  const { data, error } = await supabase
    .from('leads')
    .upsert(payload)
    .select();
  return { data: data ? mapLeadFromDb(data[0]) : null, error };
};

export const deleteLead = async (id) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
  return { error };
};

// --- Quotations Mapping & CRUD ---
const mapQuotationToDb = (q) => {
  const payload = {
    customer_name: q.customerName,
    place: q.place || '',
    phone: q.phone || '',
    kw: q.kw,
    amount: q.amount,
    date: q.date,
    notes: q.notes || '',
    created_by: q.createdBy,
    district_id: q.districtId
  };
  if (q.id) {
    payload.id = q.id;
  }
  return payload;
};

const mapQuotationFromDb = (dbQ) => ({
  id: dbQ.id,
  customerName: dbQ.customer_name,
  place: dbQ.place || '',
  phone: dbQ.phone || '',
  kw: dbQ.kw,
  amount: dbQ.amount,
  date: dbQ.date,
  notes: dbQ.notes || '',
  createdBy: dbQ.created_by,
  districtId: dbQ.district_id
});

export const fetchQuotations = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('id', { ascending: true });
  return { data: data ? data.map(mapQuotationFromDb) : null, error };
};

export const saveQuotation = async (q) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const payload = mapQuotationToDb(q);
  const { data, error } = await supabase
    .from('quotations')
    .upsert(payload)
    .select();
  return { data: data ? mapQuotationFromDb(data[0]) : null, error };
};

export const deleteQuotation = async (id) => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);
  return { error };
};

// --- Settings (stored as settings.json in app-config storage bucket) ---
export const fetchSettings = async () => {
  if (!supabase) return { data: null, error: 'Not Configured' };
  const { data, error } = await supabase.storage
    .from('app-config')
    .download('settings.json');
  if (error) return { data: null, error };
  try {
    const text = await data.text();
    return { data: JSON.parse(text), error: null };
  } catch {
    return { data: null, error: 'Parse error' };
  }
};

export const saveSettings = async (config) => {
  if (!supabase) return { error: 'Not Configured' };
  const blob = new Blob([JSON.stringify(config)], { type: 'application/json' });
  const { error } = await supabase.storage
    .from('app-config')
    .upload('settings.json', blob, { upsert: true, contentType: 'application/json' });
  return { error };
};
