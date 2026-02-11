import { initProtected, showToast } from './main.js';
import { get, post, put, del } from './api.js';

async function load() {
  initProtected();
  
  const activeList = document.querySelector('#tasks-active');
  const completedList = document.querySelector('#tasks-completed');
  
  // Skeleton
  activeList.innerHTML = `<div class="list-item"><div class="skeleton skeleton-line" style="width:60%"></div></div>`;
  completedList.innerHTML = '';
  
  const data = await get('/tasks');
  activeList.innerHTML = '';
  completedList.innerHTML = '';
  
  if (!data.length) {
    activeList.innerHTML = '<div class="empty center muted">Belum ada task.</div>';
    return;
  }
  
  const active = data.filter(t => !t.completed).sort((a, b) => b.id - a.id);
  const completed = data.filter(t => t.completed).sort((a, b) => b.id - a.id);
  
  const createItem = (t, isCompleted) => {
    const el = document.createElement('div');
    el.className = 'list-item';
    
    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '10px';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = isCompleted;
    cb.dataset.id = String(t.id);
    cb.dataset.version = String(t.version || 0);
    cb.dataset.action = 'toggle';
    left.appendChild(cb);
    
    const strong = document.createElement('strong');
    strong.textContent = t.title || '';
    if (isCompleted) {
      strong.style.textDecoration = 'line-through';
      strong.style.opacity = '0.7';
    }
    left.appendChild(strong);
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger small';
    delBtn.dataset.id = String(t.id);
    delBtn.dataset.action = 'delete';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    actions.appendChild(delBtn);
    
    el.appendChild(left);
    el.appendChild(actions);
    return el;
  };
  
  if (active.length) {
    active.forEach(t => activeList.appendChild(createItem(t, false)));
  } else {
    activeList.innerHTML = '<div class="muted center p-2">Semua beres!</div>';
  }
  
  if (completed.length) {
    completed.forEach(t => completedList.appendChild(createItem(t, true)));
  } else {
    completedList.innerHTML = '<div class="muted center p-2">Belum ada yang selesai.</div>';
  }
}

async function create(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  const title = new FormData(e.target).get('title');
  await post('/tasks', { title });
  e.target.reset();
  load();
  showToast('Task ditambahkan', 'success');
  if (btn) btn.disabled = false;
}

async function actions(e) {
  // Support both direct click on input/button and bubbled clicks
  let target = e.target;
  // If clicked icon inside button, move to button
  if (target.tagName === 'I') target = target.closest('button');
  // If not an actionable element, return
  if (!target || !target.dataset.action) return;
  
  const id = target.dataset.id;
  const act = target.dataset.action;
  
  if (act === 'delete') {
    if (!confirm('Hapus task ini?')) return;
    await del(`/tasks?id=${id}`);
    showToast('Task dihapus', 'success');
  }
  if (act === 'toggle') {
    const version = target.dataset.version ? Number(target.dataset.version) : undefined;
    const res = await put('/tasks', { id, completed: target.checked, version });
    
    if (res.error) {
       showToast(res.error, 'error');
       if (res.error.includes('Conflict')) {
         await load(); // Reload to get latest version
       } else {
         target.checked = !target.checked; // Revert
       }
       return;
    }
    
    showToast(target.checked ? 'Task selesai' : 'Task dibuka', 'info');
    if (res.version) target.dataset.version = res.version;
  }
  load();
}

function init() {
  document.querySelector('#create-task').addEventListener('submit', create);
  
  const handleListClick = (e) => {
    if (e.target.tagName === 'INPUT') actions(e);
    else actions(e);
  };
  
  document.querySelector('#tasks-active').addEventListener('click', handleListClick);
  document.querySelector('#tasks-active').addEventListener('change', handleListClick);
  
  document.querySelector('#tasks-completed').addEventListener('click', handleListClick);
  document.querySelector('#tasks-completed').addEventListener('change', handleListClick);
  
  load();
}

document.addEventListener('DOMContentLoaded', init);
