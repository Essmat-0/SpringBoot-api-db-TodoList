 const API = 'http://localhost:8080/api';
  let todos = [];
  let filter = 'all';
  let editingId = null;

  function token() { return localStorage.getItem('token'); }

  function headers() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` };
  }

  function logout() {
    localStorage.clear();
    window.location.href = 'auth.html';
  }

  function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast ${type} show`;
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  function setFilter(f, btn) {
    filter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  }

  function updateStats() {
    const done = todos.filter(t => t.completed).length;
    document.getElementById('statTotal').textContent = todos.length;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statPending').textContent = todos.length - done;
  }

  function render() {
    const list = document.getElementById('todoList');
    let visible = todos;
    if (filter === 'pending') visible = todos.filter(t => !t.completed);
    if (filter === 'done') visible = todos.filter(t => t.completed);

    if (visible.length === 0) {
      list.innerHTML = `<div class="empty"><div class="empty-icon">◻</div><div class="empty-text">No tasks here</div></div>`;
      return;
    }

    list.innerHTML = visible.map(todo => `
      <div class="todo-item ${todo.completed ? 'completed' : ''}" id="item-${todo.id}">
        <button class="check-btn" onclick="toggleTodo(${todo.id}, ${todo.completed})">✓</button>
        <div class="todo-body">
          <div class="todo-title">${escHtml(todo.title)}</div>
          ${todo.description ? `<div class="todo-desc">${escHtml(todo.description)}</div>` : ''}
          <div class="todo-meta">${formatDate(todo.createdAt)}</div>
        </div>
        <div class="todo-actions">
          <button class="icon-btn edit" onclick="openEdit(${todo.id})">✎</button>
          <button class="icon-btn delete" onclick="deleteTodo(${todo.id})">✕</button>
        </div>
      </div>
    `).join('');

    updateStats();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function formatDate(dt) {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function loadTodos() {
    try {
      const res = await fetch(`${API}/todos`, { headers: headers() });
      if (res.status === 401) return logout();
      todos = await res.json();
      updateStats();
      render();
    } catch (e) {
      toast('Failed to load todos', 'error');
    }
  }

  async function createTodo() {
    const title = document.getElementById('newTitle').value.trim();
    const description = document.getElementById('newDesc').value.trim();
    if (!title) return;

    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ title, description, completed: false })
      });
      const todo = await res.json();
      todos.unshift(todo);
      document.getElementById('newTitle').value = '';
      document.getElementById('newDesc').value = '';
      render();
      toast('Task added');
    } catch (e) {
      toast('Failed to add task', 'error');
    }
  }

  async function toggleTodo(id, current) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const res = await fetch(`${API}/todos/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ ...todo, completed: !current })
      });
      const updated = await res.json();
      todos = todos.map(t => t.id === id ? updated : t);
      render();
    } catch (e) {
      toast('Failed to update', 'error');
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`${API}/todos/${id}`, { method: 'DELETE', headers: headers() });
      todos = todos.filter(t => t.id !== id);
      render();
      toast('Task deleted');
    } catch (e) {
      toast('Failed to delete', 'error');
    }
  }

  function openEdit(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    editingId = id;
    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editDesc').value = todo.description || '';
    document.getElementById('overlay').classList.add('show');
  }

  function closeModal(e) {
    if (e && e.target !== document.getElementById('overlay')) return;
    document.getElementById('overlay').classList.remove('show');
    editingId = null;
  }

  async function saveEdit() {
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDesc').value.trim();
    if (!title || !editingId) return;

    const todo = todos.find(t => t.id === editingId);
    try {
      const res = await fetch(`${API}/todos/${editingId}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ ...todo, title, description })
      });
      const updated = await res.json();
      todos = todos.map(t => t.id === editingId ? updated : t);
      document.getElementById('overlay').classList.remove('show');
      editingId = null;
      render();
      toast('Task updated');
    } catch (e) {
      toast('Failed to update', 'error');
    }
  }

  document.getElementById('newTitle').addEventListener('keydown', e => {
    if (e.key === 'Enter') createTodo();
  });

  // Init
  if (!token()) { window.location.href = 'auth.html'; }
  else {
    document.getElementById('usernameDisplay').textContent = localStorage.getItem('username') || '—';
    loadTodos();
  }