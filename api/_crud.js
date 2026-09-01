import { neon } from '@neondatabase/serverless';

// One HTTP-based Neon client per cold start. DATABASE_URL is provided by the
// Vercel <-> Neon integration (or set it manually in Project Settings).
const sql = neon(process.env.DATABASE_URL);

/**
 * Build a tiny REST handler for one table.
 *   GET    /api/<t>            -> { data: [rows] }        (ordered by pk)
 *   POST   /api/<t>   body row -> { data: row }           (insert, or upsert when pk present)
 *   DELETE /api/<t>?<pk>=<id>  -> { ok: true }
 *
 * `table`, `pk` and `columns` are hard-coded per route (never user input), so
 * interpolating them into SQL is safe. All values are passed as parameters.
 */
export function crud({ table, pk = 'id', columns }) {
  return async function handler(req, res) {
    try {
      if (req.method === 'GET') {
        const { rows } = await sql.query(`SELECT * FROM ${table} ORDER BY ${pk} ASC`);
        return res.status(200).json({ data: rows });
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        const body =
          typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        const idVal = body[pk];
        const cols = columns.filter((c) => body[c] !== undefined);
        const hasId = idVal !== undefined && idVal !== null && idVal !== '';

        if (hasId) {
          // INSERT ... ON CONFLICT (pk) DO UPDATE  — works for both new rows
          // with an explicit key (steps) and edits of existing rows.
          const insertCols = [pk, ...cols];
          const placeholders = insertCols.map((_, i) => `$${i + 1}`);
          const updates = cols.map((c) => `${c} = EXCLUDED.${c}`).join(', ');
          const setClause = updates || `${pk} = EXCLUDED.${pk}`;
          const { rows } = await sql.query(
            `INSERT INTO ${table} (${insertCols.join(', ')})
             VALUES (${placeholders.join(', ')})
             ON CONFLICT (${pk}) DO UPDATE SET ${setClause}
             RETURNING *`,
            [idVal, ...cols.map((c) => body[c])]
          );
          return res.status(200).json({ data: rows[0] });
        }

        const { rows } = await sql.query(
          `INSERT INTO ${table} (${cols.join(', ')})
           VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})
           RETURNING *`,
          cols.map((c) => body[c])
        );
        return res.status(200).json({ data: rows[0] });
      }

      if (req.method === 'DELETE') {
        const idVal = req.query[pk] ?? req.query.id;
        if (idVal === undefined) {
          return res.status(400).json({ error: `missing ?${pk}=` });
        }
        await sql.query(`DELETE FROM ${table} WHERE ${pk} = $1`, [idVal]);
        return res.status(200).json({ ok: true });
      }

      res.setHeader('Allow', 'GET, POST, DELETE');
      return res.status(405).json({ error: 'Method not allowed' });
    } catch (e) {
      console.error(`[api/${table}]`, e.message);
      return res.status(500).json({ error: e.message });
    }
  };
}

export { sql };
