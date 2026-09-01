import { createClient } from '@supabase/supabase-js';

const VERIFY_TOKEN      = process.env.META_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY; // service role key (not anon)

// Simple city → district_id map (same as Settings district map but server-side default)
const CITY_DISTRICT = {
  tirur: 1, malappuram: 1, kondotty: 1, perinthalmanna: 1, manjeri: 1,
  kochi: 4, ernakulam: 4, thrissur: 3,
  calicut: 2, kozhikode: 2, vatakara: 2,
  palakkad: 5, kannur: 6,
};

function detectDistrict(city) {
  const key = (city || '').toLowerCase().trim();
  return CITY_DISTRICT[key] || 1;
}

function parseFields(fieldData) {
  const fields = {};
  (fieldData || []).forEach(f => {
    fields[f.name] = (f.values || [])[0] || '';
  });
  return fields;
}

async function fetchLeadFromMeta(leadgenId) {
  const url = `https://graph.facebook.com/v18.0/${leadgenId}?fields=field_data,created_time,ad_name,form_id&access_token=${PAGE_ACCESS_TOKEN}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error('Meta API: ' + data.error.message);
  return data;
}

async function saveToSupabase(lead) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { error } = await supabase.from('leads').insert(lead);
  if (error) throw new Error('Supabase: ' + error.message);
}

export default async function handler(req, res) {
  // ── Webhook verification (GET) ──────────────────────────
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[meta-webhook] Verified successfully');
      return res.status(200).send(challenge);
    }
    console.warn('[meta-webhook] Verification failed — token mismatch');
    return res.status(403).end();
  }

  // ── Lead event (POST) ───────────────────────────────────
  if (req.method === 'POST') {
    try {
      const entries = (req.body?.entry) || [];

      for (const entry of entries) {
        for (const change of (entry.changes || [])) {
          if (change.field !== 'leadgen') continue;

          const leadgenId = change.value?.leadgen_id;
          if (!leadgenId) continue;

          // Fetch full lead data from Meta
          const metaLead = await fetchLeadFromMeta(leadgenId);
          const f        = parseFields(metaLead.field_data);

          const name   = f['full_name']    || f['name']         || 'Unknown';
          const phone  = f['phone_number'] || f['phone']        || '';
          const city   = f['city']         || f['location']     || '';
          const system = f['system_size']  || f['kw_required']  || '';
          const email  = f['email']        || '';

          const lead = {
            name,
            phone,
            location: city,
            system,
            source:      'Meta Ad',
            stage:       1,
            status:      'pending',
            notes:       `Auto-imported from Meta Lead Ad.${email ? ' Email: ' + email : ''} Leadgen ID: ${leadgenId}`,
            date:        new Date().toISOString().split('T')[0],
            district_id: detectDistrict(city),
          };

          await saveToSupabase(lead);
          console.log('[meta-webhook] Lead saved:', name, phone);
        }
      }

      return res.status(200).json({ status: 'ok' });
    } catch (e) {
      console.error('[meta-webhook] Error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
