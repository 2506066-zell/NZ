import { pool, readBody, verifyToken, logActivity } from './_lib.js';

export default async function handler(req, res) {
    const v = verifyToken(req, res);
    if (!v) return;
    const user = v.user;

    if (req.method === 'GET') {
        const r = await pool.query('SELECT * FROM schedule ORDER BY day_id, time_start');
        res.status(200).json(r.rows);
        return;
    }

    if (req.method === 'POST') {
        const b = req.body || await readBody(req);
        const { day, start, end, subject, room, lecturer } = b;

        if (!day || !start || !end || !subject) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const r = await pool.query(
            `INSERT INTO schedule (day_id, time_start, time_end, subject, room, lecturer, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [day, start, end, subject, room || null, lecturer || null, user]
        );

        await logActivity(pool, 'schedule', r.rows[0].id, 'CREATE', user, { subject, day });
        res.status(200).json(r.rows[0]);
        return;
    }

    if (req.method === 'DELETE') {
        const id = new URL(req.url, 'http://x').searchParams.get('id');
        if (!id) { res.status(400).json({ error: 'Missing id' }); return; }

        const r = await pool.query('DELETE FROM schedule WHERE id=$1 RETURNING *', [id]);
        if (r.rowCount) {
            await logActivity(pool, 'schedule', id, 'DELETE', user, r.rows[0]);
        }

        res.status(200).json({ ok: true });
        return;
    }

    res.status(405).json({ error: 'Method not allowed' });
}
