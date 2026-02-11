import { initProtected, showToast } from './main.js';
import { get, put } from './api.js';
async function load() {
  initProtected();
  const data = await get('/anniversary');
  const dateEl = document.querySelector('#anniv-date');
  const noteEl = document.querySelector('#anniv-note');
  if (data && data.date) dateEl.value = data.date.slice(0,10);
  if (data && data.note) noteEl.value = data.note;
}
async function save(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  const date = document.querySelector('#anniv-date').value;
  const note = document.querySelector('#anniv-note').value;
  await put('/anniversary', { date, note });
  load();
  showToast('Anniversary disimpan', 'success');
  if (btn) btn.disabled = false;
}
function init() {
  document.querySelector('#anniv-form').addEventListener('submit', save);
  load();
}
document.addEventListener('DOMContentLoaded', init);
