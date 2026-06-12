/* UI helpers: toast, modal, spinner, badges, sidebar, navbar */

/* ---- Toast ---- */
function toast(msg, type = 'success') {
  const icons = { success: '<i data-lucide="check-circle-2"></i>', error: '<i data-lucide="x-circle"></i>', warning: '<i data-lucide="alert-triangle"></i>', info: '<i data-lucide="info"></i>' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ---- Modal ---- */
function openModal(html, large = false) {
  const box = document.getElementById('modal-box');
  box.classList.toggle('modal-lg', large);
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

/* ---- Spinner ---- */
function spinner() {
  return `<div class="spinner-wrap"><div class="spinner"></div></div>`;
}

/* ---- Status badge ---- */
function badge(status) {
  const labels = {
    pending: 'Pending', available: 'Available', matched: 'Matched',
    approved: 'Approved', rejected: 'Rejected', released: 'Released',
    claimed: 'Claimed', archived: 'Archived', under_review: 'Under Review',
  };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

/* ---- Date format ---- */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ---- Image placeholder ---- */
function imgOrPlaceholder(url, emoji = '<i data-lucide="package"></i>') {
  if (url) return `<img class="item-card-img" src="${url}" alt="item" loading="lazy"/>`;
  return `<div class="item-card-img-placeholder">${emoji}</div>`;
}

/* ---- Empty state ---- */
function emptyState(icon, title, sub) {
  return `<div class="empty-state">
    <div class="empty-state-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${sub}</p>
  </div>`;
}

/* ---- Sidebar (authenticated) ---- */
function renderNavbar() {
  const sidebar = document.getElementById('sidebar');

  if (!Auth.isLoggedIn()) {
    sidebar.classList.remove('sidebar--open');
    document.body.classList.remove('sidebar-open');
    sidebar.innerHTML = '';
    return;
  }

  sidebar.classList.add('sidebar--open');
  document.body.classList.add('sidebar-open');

  const role = Auth.role();
  const navMap = {
    user: [
      { icon: '<i data-lucide="home"></i>', label: 'Dashboard',        view: 'user-dashboard' },
      { icon: '<i data-lucide="check-circle"></i>', label: 'Browse Found',      view: 'browse-found' },
      { icon: '<i data-lucide="alert-circle"></i>', label: 'Lost Items Board',  view: 'browse-lost' },
       { icon: '<i data-lucide="file-text"></i>', label: 'My Reports',        view: 'user-lost-items' },
      { icon: '<i data-lucide="folder-open"></i>', label: 'My Claims',         view: 'user-claims' },
      { icon: '<i data-lucide="qr-code"></i>', label: 'Scan / Lookup',         view: 'scan' },
      { icon: '<i data-lucide="help-circle"></i>', label: 'Help',              view: 'help' },
    ],
    staff: [
      { icon: '<i data-lucide="home"></i>', label: 'Dashboard',         view: 'staff-dashboard' },
       { icon: '<i data-lucide="package"></i>', label: 'Found Items',        view: 'staff-found-items' },
      { icon: '<i data-lucide="folder-open"></i>', label: 'Claim Requests',    view: 'staff-claims' },
      { icon: '<i data-lucide="qr-code"></i>', label: 'Scan / Lookup',         view: 'scan' },
      { icon: '<i data-lucide="help-circle"></i>', label: 'Help',              view: 'help' },
    ],
    admin: [
      { icon: '<i data-lucide="home"></i>', label: 'Dashboard',         view: 'admin-dashboard' },
      { icon: '<i data-lucide="package"></i>', label: 'Found Items',        view: 'admin-found-items' },
      { icon: '<i data-lucide="search"></i>', label: 'Lost Reports',       view: 'admin-lost-items' },
      { icon: '<i data-lucide="folder-open"></i>', label: 'All Claims',        view: 'admin-claims' },
       { icon: '<i data-lucide="tag"></i>', label: 'Categories',        view: 'admin-categories' },
      { icon: '<i data-lucide="users"></i>', label: 'User Management',   view: 'admin-users' },
      { icon: '<i data-lucide="activity"></i>', label: 'Activity Logs',   view: 'admin-activity-logs' },
      { icon: '<i data-lucide="qr-code"></i>', label: 'Scan / Lookup',   view: 'scan' },
      { icon: '<i data-lucide="help-circle"></i>', label: 'Help',        view: 'help' },
    ],
  };

  const items = navMap[role] || [];
  const initial = Auth.user?.name?.charAt(0)?.toUpperCase() || '?';

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon"><i data-lucide="search"></i></div>
      <span class="sidebar-logo-text">FindBack</span>
    </div>
    <nav class="sidebar-nav">
      ${items.map(item => `
        <button class="sidebar-nav-item" data-view="${item.view}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
     <div class="sidebar-footer" style="position:relative">
      <div id="sidebar-profile-dropdown" class="profile-dropdown hidden">
        <button class="profile-dropdown-item" id="dropdown-settings">
          <i data-lucide="settings"></i> Settings
        </button>
        <div class="profile-dropdown-divider"></div>
        <button class="profile-dropdown-item danger" id="dropdown-logout">
          <i data-lucide="log-out"></i> Sign Out
        </button>
      </div>

      <div class="sidebar-user" id="sidebar-user-trigger" style="cursor:pointer">
        <div class="sidebar-avatar">
          ${Auth.user?.profile_image ? `<img src="${Auth.user.profile_image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : initial}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${Auth.user?.name || ''}</div>
          <div class="sidebar-user-role"><span class="role-badge ${role}">${role}</span></div>
        </div>
        <div style="margin-left:auto; color:var(--text-dim)"><i data-lucide="more-vertical"></i></div>
      </div>
    </div>
  `;

   sidebar.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => Router.go(btn.dataset.view));
  });

  const trigger = document.getElementById('sidebar-user-trigger');
  const dropdown = document.getElementById('sidebar-profile-dropdown');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  document.getElementById('dropdown-settings').addEventListener('click', () => {
    dropdown.classList.add('hidden');
    Router.go('profile');
  });

  document.getElementById('dropdown-logout').addEventListener('click', async () => {
    try { await API.logout(); } catch(e) {}
    Auth.clearSession();
    sidebar.classList.remove('sidebar--open');
    document.body.classList.remove('sidebar-open');
    sidebar.innerHTML = '';
    Router.go('home');
    toast('Signed out successfully.');
  });
}

/* ---- Active nav state ---- */
function setActiveNav(view) {
  document.querySelectorAll('.sidebar-nav-item[data-view]').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
}

/* ---- Pagination ---- */
function renderPagination(pagination, onPage) {
  if (!pagination || pagination.last_page <= 1) return '';
  const { current_page, last_page } = pagination;
  let btns = `<button class="page-btn" ${current_page===1?'disabled':''} data-page="${current_page-1}">‹</button>`;
  for (let i = 1; i <= last_page; i++) {
    if (i===1 || i===last_page || Math.abs(i-current_page)<=1)
      btns += `<button class="page-btn ${i===current_page?'active':''}" data-page="${i}">${i}</button>`;
    else if (Math.abs(i-current_page)===2)
      btns += `<span style="color:var(--text-dim);padding:0 4px">…</span>`;
  }
  btns += `<button class="page-btn" ${current_page===last_page?'disabled':''} data-page="${current_page+1}">›</button>`;
  const wrap = document.createElement('div');
  wrap.className = 'pagination';
  wrap.innerHTML = btns;
  wrap.querySelectorAll('.page-btn:not([disabled])').forEach(b => {
    b.addEventListener('click', () => onPage(+b.dataset.page));
  });
  return wrap;
}

/* ---- Category select ---- */
async function loadCategorySelect(selectId) {
  try {
    const res = Auth.isLoggedIn() ? await API.lookupCategories() : await API.publicCategories();
    const cats = res.data || [];
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = `<option value="">All Categories</option>` +
      cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  } catch(e) {}
}
