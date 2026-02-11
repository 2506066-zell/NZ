import { pool, readBody, verifyToken } from './_lib.js';

export default async function handler(req, res) {
  const v = verifyToken(req, res);
  if (!v) return;

  if (req.method === 'GET') {
    const r = await pool.query('SELECT * FROM goals ORDER BY id DESC');
    res.status(200).json(r.rows);
    return;
  }

  if (req.method === 'POST') {
    const b = req.body || await readBody(req);
    const { title, category, deadline } = b;
    
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'Invalid title' });
      return;
    }

    const dl = deadline ? new Date(deadline) : null;
    if (deadline && isNaN(dl)) {
      res.status(400).json({ error: 'Invalid deadline' });
      return;
    }

    const r = await pool.query(
      'INSERT INTO goals (title, category, deadline, progress) VALUES ($1, $2, $3, 0) RETURNING *',
      [title, category || 'Personal', dl]
    );
    res.status(200).json(r.rows[0]);
    return;
  }

  if (req.method === 'PUT') {
    const b = req.body || await readBody(req);
    const { id, title, category, deadline, progress, completed, version } = b;
    const idNum = Number(id);
    
    if (!idNum) { res.status(400).json({ error: 'Invalid id' }); return; }

    const fields = [];
    const vals = [];
    let i = 1;

    if (title !== undefined) { fields.push(`title=$${i++}`); vals.push(title); }
    if (category !== undefined) { fields.push(`category=$${i++}`); vals.push(category); }
    if (deadline !== undefined) {
        const dl = deadline ? new Date(deadline) : null;
        if (deadline && isNaN(dl)) { res.status(400).json({ error: 'Invalid deadline' }); return; }
        fields.push(`deadline=$${i++}`); vals.push(dl);
    }
    if (progress !== undefined) { fields.push(`progress=$${i++}`); vals.push(progress); }
    if (completed !== undefined) { fields.push(`completed=$${i++}`); vals.push(completed); }

    // Increment version
    fields.push(`version = COALESCE(version, 0) + 1`);

    vals.push(idNum);
    let query = `UPDATE goals SET ${fields.join(', ')} WHERE id=$${i}`;
    
    // Optimistic locking
    if (version !== undefined) {
      i++;
      vals.push(version);
      query += ` AND version=$${i}`;
    }

    query += ` RETURNING *`;

    const r = await pool.query(query, vals);

    if (r.rowCount === 0) {
      const check = await pool.query('SELECT id FROM goals WHERE id=$1', [idNum]);
      if (check.rowCount === 0) {
        res.status(404).json({ error: 'Goal not found' });
      } else {
        res.status(409).json({ error: 'Conflict: Data has been modified by another user. Please refresh.' });
      }
      return;
    }

    res.status(200).json(r.rows[0]);
    return;
  }

  if (req.method === 'DELETE') {
    const id = new URL(req.url, 'http://x').searchParams.get('id');
    const idNum = Number(id);
    if (!idNum) { res.status(400).json({ error: 'Invalid id' }); return; }
    
    await pool.query('DELETE FROM goals WHERE id=$1', [idNum]);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
