const Auth = {
  getUser()    { const u = localStorage.getItem('usuario'); return u ? JSON.parse(u) : null; },
  getToken()   { return localStorage.getItem('token'); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin()    { return this.getUser()?.role === 'admin'; },

  login(token, usuario) {
    localStorage.setItem('token',   token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
  },

  updateNavbar() {
    const authBtns = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    if (this.isLoggedIn()) {
      const u = this.getUser();
      if (authBtns) authBtns.style.display = 'none';
      if (userMenu) userMenu.style.display  = 'flex';
      if (userName) userName.textContent    = u.nome.split(' ')[0];
    } else {
      if (authBtns) authBtns.style.display = 'flex';
      if (userMenu) userMenu.style.display  = 'none';
    }
  },

  requireLogin() {
    if (!this.isLoggedIn()) { window.location.href = '/login.html'; return false; }
    return true;
  },

  requireAdmin() {
    if (!this.isAdmin()) { window.location.href = '/'; return false; }
    return true;
  }
};

const Cart = {
  getItems()  { const c = localStorage.getItem('carrinho'); return c ? JSON.parse(c) : []; },
  save(items) { localStorage.setItem('carrinho', JSON.stringify(items)); this.updateCount(); },

  add(produto) {
    const items = this.getItems();
    const idx   = items.findIndex(i => i.id === produto.id);
    if (idx >= 0) items[idx].quantidade++;
    else items.push({ ...produto, quantidade: 1 });
    this.save(items);
  },

  remove(id)   { this.save(this.getItems().filter(i => i.id !== id)); },

  setQty(id, qty) {
    if (qty <= 0) { this.remove(id); return; }
    const items = this.getItems();
    const item  = items.find(i => i.id === id);
    if (item) { item.quantidade = qty; this.save(items); }
  },

  getTotal() { return this.getItems().reduce((s, i) => s + i.preco * i.quantidade, 0); },
  getCount() { return this.getItems().reduce((s, i) => s + i.quantidade, 0); },
  clear()    { localStorage.removeItem('carrinho'); this.updateCount(); },

  updateCount() {
    const n = this.getCount();
    const el = document.getElementById('cartCount');
    if (el) { el.textContent = n; el.style.display = n > 0 ? 'flex' : 'none'; }
  }
};

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3200);
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavbar();
  Cart.updateCount();
  document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
});
