import { sql } from './_crud.js';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

// Simple city -> district_id map (same defaults as the Settings district map).
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
  (fieldData || []).forEach((f) => {
    fields[f.name] = (f.values || [])[0] || '';
  });
  return fields;
}

async function fetchLeadFromMeta(leadgenId) {
  const url = `https://graph.facebook.com/v18.0/${leadgenId}?fields=field_data,created_time,ad_name,form_id&access_token=${PAGE_ACCESS_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error('Meta API: ' + data.error.message);
  return data;
}

async function saveLead(lead) {
  await sql.query(
    `INSERT INTO leads (name, phone, location, system, source, stage, status, notes, date, district_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      lead.name, lead.phone, lead.location, lead.system, lead.source,
      lead.stage, lead.status, lead.notes, lead.date, lead.district_id,
    ]
  );
}

export default async function handler(req, res) {
  // Webhook verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[meta-webhook] Verified successfully');
      return res.status(200).send(challenge);
    }
    console.warn('[meta-webhook] Verification failed - token mismatch');
    return res.status(403).end();
  }

  // Lead event (POST)
  if (req.method === 'POST') {
    try {
      const entries = req.body?.entry || [];

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          if (change.field !== 'leadgen') continue;

          const leadgenId = change.value?.leadgen_id;
          if (!leadgenId) continue;

          const metaLead = await fetchLeadFromMeta(leadgenId);
          const f = parseFields(metaLead.field_data);

          const name = f['full_name'] || f['name'] || 'Unknown';
          const phone = f['phone_number'] || f['phone'] || '';
          const city = f['city'] || f['location'] || '';
          const system = f['system_size'] || f['kw_required'] || '';
          const email = f['email'] || '';

          await saveLead({
            name,
            phone,
            location: city,
            system,
            source: 'Meta Ad',
            stage: 1,
            status: 'pending',
            notes: `Auto-imported from Meta Lead Ad.${email ? ' Email: ' + email : ''} Leadgen ID: ${leadgenId}`,
            date: new Date().toISOString().split('T')[0],
            district_id: detectDistrict(city),
          });
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
