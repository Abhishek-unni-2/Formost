import { sql } from './_crud.js';

// App configuration is a single JSON blob (settings.id = 1).
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql.query('SELECT data FROM settings WHERE id = 1');
      return res.status(200).json({ data: rows[0]?.data || {} });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      await sql.query(
        `INSERT INTO settings (id, data) VALUES (1, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [JSON.stringify(body)]
      );
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/settings]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
