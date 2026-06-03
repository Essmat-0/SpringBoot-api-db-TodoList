  const API = 'http://localhost:8080/api';
  let mode = 'login';

  function switchTab(tab) {
    mode = tab;
    document.querySelectorAll('.tab').forEach((t, i) => {
      t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
    document.getElementById('submitBtn').textContent = tab === 'login' ? 'Sign In' : 'Create Account';
    hideMsg();
  }

  function showMsg(text, type) {
    const el = document.getElementById('msg');
    el.textContent = text;
    el.className = `message ${type} show`;
  }
  function hideMsg() {
    document.getElementById('msg').className = 'message';
  }

  async function handleSubmit() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) return showMsg('Fill in all fields.', 'error');

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;

    try {
      const res = await fetch(`${API}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
          const text = await res.text();
          throw new Error(text || (mode === 'login' ? 'Invalid username or password' : 'Registration failed'));
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      window.location.href = 'index.html';
    } catch (e) {
      showMsg(e.message, 'error');
    } finally {
      btn.disabled = false;
    }
  }

  document.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  if (localStorage.getItem('token')) window.location.href = 'index.html';