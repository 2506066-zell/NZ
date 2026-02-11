import { pool, readBody, verifyToken } from './_lib.js';
export default async function handler(req, res) {
  const v = verifyToken(req, res);
  if (!v) return;
  if (req.method === 'GET') {
    const r = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.status(200).json(r.rows);
    return;
  }
  if (req.method === 'POST') {
    const b = req.body || await readBody(req);
    const { title } = b;
    if (!title || typeof title !== 'string') { res.status(400).json({ error: 'Invalid title' }); return; }
    const r = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
    res.status(200).json(r.rows[0]);
    return;
  }
  if (req.method === 'PUT') {
    const b = req.body || await readBody(req);
    const { id, title, completed } = b;
    const idNum = Number(id);
    if (!idNum) { res.status(400).json({ error: 'Invalid id' }); return; }
    const fields = [];
    const vals = [];
    let i = 1;
    if (title !== undefined) { fields.push(`title=$${i++}`); vals.push(title); }
    if (completed !== undefined) { fields.push(`completed=$${i++}`); vals.push(completed); }
    vals.push(idNum);
    const r = await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, vals);
    res.status(200).json(r.rows[0]);
    return;
  }
  if (req.method === 'DELETE') {
    const id = new URL(req.url, 'http://x').searchParams.get('id');
    const idNum = Number(id);
    if (!idNum) { res.status(400).json({ error: 'Invalid id' }); return; }
    await pool.query('DELETE FROM tasks WHERE id=$1', [idNum]);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
}
