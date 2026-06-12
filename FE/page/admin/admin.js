/* Admin panel views: Dashboard, Found Items, Lost Items, Claims, Categories */

/* ---- ADMIN DASHBOARD ---- */
Views.adminDashboard = async function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="shield"></i> Admin Dashboard</h1><p class="page-subtitle">System overview and management</p></div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" id="exp-found">⬇ Found CSV</button>
          <button class="btn btn-secondary btn-sm" id="exp-lost">⬇ Lost CSV</button>
          <button class="btn btn-secondary btn-sm" id="exp-claims">⬇ Claims CSV</button>
        </div>
      </div>
      <div id="admin-stats">${spinner()}</div>
      <div style="margin-top:28px">
        <h2 class="section-title"><i data-lucide="hourglass"></i> Pending Claims Awaiting Action</h2>
        <div id="admin-pending">${spinner()}</div>
      </div>
    </div>`;

  document.getElementById('exp-found').onclick = () => { API.exportFoundItems(); toast('Export started.'); };
  document.getElementById('exp-lost').onclick = () => { API.exportLostItems(); toast('Export started.'); };
  document.getElementById('exp-claims').onclick = () => { API.exportClaimRequests(); toast('Export started.'); };

  try {
    const [foundRes, lostRes, claimRes] = await Promise.all([
      API.getFoundItems(), API.getLostItems(), API.getClaimRequests()
    ]);
    const found = foundRes.data||[]; const lost = lostRes.data||[]; const claims = claimRes.data||[];

    document.getElementById('admin-stats').innerHTML = `
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-icon green"><i data-lucide="package"></i></div><div><div class="stat-value">${found.length}</div><div class="stat-label">Total Found Items</div></div></div>
        <div class="stat-card"><div class="stat-icon red"><i data-lucide="search"></i></div><div><div class="stat-value">${lost.length}</div><div class="stat-label">Lost Reports</div></div></div>
        <div class="stat-card"><div class="stat-icon amber"><i data-lucide="hourglass"></i></div><div><div class="stat-value">${claims.filter(c=>c.status==='pending').length}</div><div class="stat-label">Pending Claims</div></div></div>
        <div class="stat-card"><div class="stat-icon indigo"><i data-lucide="check-circle-2"></i></div><div><div class="stat-value">${claims.filter(c=>c.status==='released').length}</div><div class="stat-label">Released Items</div></div></div>
      </div>
      <div class="grid grid-4" style="margin-top:16px">
        <div class="stat-card"><div class="stat-icon sky"><i data-lucide="check-circle"></i></div><div><div class="stat-value">${found.filter(i=>i.status==='available').length}</div><div class="stat-label">Available Found</div></div></div>
        <div class="stat-card"><div class="stat-icon amber">🔄</div><div><div class="stat-value">${found.filter(i=>i.status==='under_review').length}</div><div class="stat-label">Under Review</div></div></div>
        <div class="stat-card"><div class="stat-icon green">🎉</div><div><div class="stat-value">${found.filter(i=>i.status==='claimed').length}</div><div class="stat-label">Claimed</div></div></div>
        <div class="stat-card"><div class="stat-icon red">🗄️</div><div><div class="stat-value">${found.filter(i=>i.status==='archived').length}</div><div class="stat-label">Archived</div></div></div>
      </div>`;

    const pending = claims.filter(c=>c.status==='pending');
    document.getElementById('admin-pending').innerHTML = pending.length ?
      `<div class="table-wrapper"><table>
        <thead><tr><th>Item</th><th>Claimant</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody>${pending.slice(0,8).map(c=>`<tr>
          <td class="fw-600">${c.found_item?.item_name||'—'}</td>
          <td>${c.claimant?.name||'—'}<div class="text-xs text-muted">${c.claimant?.email||''}</div></td>
          <td class="text-muted">${fmtDate(c.created_at)}</td>
          <td>
            <div class="flex gap-8">
              <button class="btn btn-success btn-sm" data-approve="${c.id}"><i data-lucide="check-circle-2"></i> Approve</button>
              <button class="btn btn-danger btn-sm" data-reject="${c.id}"><i data-lucide="x-circle"></i> Reject</button>
              <button class="btn btn-secondary btn-sm" data-view-claim="${c.id}">Details</button>
            </div>
          </td>
        </tr>`).join('')}
        </tbody></table></div>
        ${pending.length>8?`<button class="btn btn-secondary btn-sm mt-12" onclick="Router.go('admin-claims')">See all ${pending.length} pending →</button>`:''}` :
      emptyState('🎉','No pending claims','All claims have been processed!');

    document.querySelectorAll('[data-approve]').forEach(b => {
      b.onclick = async () => {
        try { await API.approveClaim(b.dataset.approve); toast('Claim approved.'); Views.adminDashboard(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
    document.querySelectorAll('[data-reject]').forEach(b => {
      b.onclick = async () => {
        try { await API.rejectClaim(b.dataset.reject); toast('Claim rejected.'); Views.adminDashboard(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
    document.querySelectorAll('[data-view-claim]').forEach(b => {
      b.onclick = async () => { const r = await API.getClaimRequest(b.dataset.viewClaim); showClaimDetail(r.data,'admin'); };
    });
  } catch(e) { toast(e.message,'error'); }
};

/* ---- ADMIN: FOUND ITEMS ---- */
Views.adminFoundItems = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="package"></i> All Found Items</h1><p class="page-subtitle">Manage all found items across all staff</p></div>
        <button class="btn btn-secondary btn-sm" id="admin-found-export">⬇ Export CSV</button>
      </div>
      <div id="admin-found-list">${spinner()}</div>
    </div>`;
  document.getElementById('admin-found-export').onclick = () => API.exportFoundItems();
  loadAdminFoundItems();
};

async function loadAdminFoundItems() {
  const el = document.getElementById('admin-found-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getFoundItems();
    const items = res.data||[];
    if (!items.length) { el.innerHTML = emptyState('<i data-lucide="package"></i>','No found items','Nothing logged yet.'); return; }
    el.innerHTML = `<div class="table-wrapper"><table>
      <thead><tr><th>Item</th><th>Staff</th><th>Category</th><th>Location</th><th>Status</th><th>Ref</th><th>Actions</th></tr></thead>
      <tbody>${items.map(i=>`<tr>
        <td>
          <div class="flex items-center gap-8">
            ${i.image_url?`<img src="${i.image_url}" style="width:36px;height:36px;border-radius:6px;object-fit:cover"/>`:'<span style="font-size:1.4rem"><i data-lucide="package"></i></span>'}
            <div class="fw-600">${i.item_name}</div>
          </div>
        </td>
        <td class="text-muted">${i.staff?.name||'—'}</td>
        <td class="text-muted">${i.category?.name||'—'}</td>
        <td class="text-muted">${i.found_location||'—'}</td>
        <td>${badge(i.status)}</td>
        <td><code style="font-size:0.75rem;color:var(--primary-light)">${i.reference_code||'—'}</code></td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-primary btn-sm" data-match-fi="${i.id}">Matches</button>
            ${['available','under_review'].includes(i.status)?
              `<button class="btn btn-danger btn-sm" data-archive="${i.id}">Archive</button>`:'<span class="text-muted text-xs">—</span>'}
          </div>
        </td>
      </tr>`).join('')}
      </tbody></table></div>`;

    document.querySelectorAll('[data-archive]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Archive this item?')) return;
        try { await API.archiveFoundItem(b.dataset.archive); toast('Item archived.'); loadAdminFoundItems(); }
        catch(e) { toast(e.message,'error'); }
      };
    });

    document.querySelectorAll('[data-match-fi]').forEach(b => {
      b.onclick = async () => {
        openModal(spinner());
        try {
          const res3 = await API.getFoundItemMatches(b.dataset.matchFi, 10);
          const list = res3.data?.items || [];
          openModal(`
            <h2 class="modal-title"><i data-lucide="sparkles"></i> Possible Owners (Lost Reports)</h2>
            <p class="text-sm text-muted mb-16">Ranked by category, name, color, and date proximity.</p>
            ${list.length ? `
              <div class="table-wrapper"><table>
                <thead><tr><th>Lost Item</th><th>Reporter</th><th>Last Seen</th><th>Date Lost</th><th>Score</th></tr></thead>
                <tbody>
                  ${list.map(i => `<tr>
                    <td class="fw-600">${i.item_name}<div class="text-xs text-muted">${i.category?.name||'—'} ${i.color?`• ${i.color}`:''}</div></td>
                    <td>${i.user?.name||'—'}<div class="text-xs text-muted">${i.user?.email||''}</div></td>
                    <td class="text-muted">${i.last_seen_location||'—'}</td>
                    <td class="text-muted">${fmtDate(i.date_lost)}</td>
                    <td><span class="badge badge--info">${i.match_score}</span></td>
                  </tr>`).join('')}
                </tbody>
              </table></div>
            ` : emptyState('<i data-lucide="search"></i>', 'No strong matches yet', 'Try adding more details (category/color) to the found item and check again.')}
          `, true);
          if (window.lucide) lucide.createIcons();
        } catch (e) {
          openModal(emptyState('<i data-lucide="x-circle"></i>', 'Could not load matches', e.message));
        }
      };
    });
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
}

/* ---- ADMIN: LOST ITEMS ---- */
Views.adminLostItems = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="search"></i> All Lost Reports</h1><p class="page-subtitle">All lost item reports from users</p></div>
        <button class="btn btn-secondary btn-sm" id="admin-lost-export">⬇ Export CSV</button>
      </div>
      <div id="admin-lost-list">${spinner()}</div>
    </div>`;

  document.getElementById('admin-lost-export').onclick = () => API.exportLostItems();

  (async () => {
    const el = document.getElementById('admin-lost-list');
    try {
      const res = await API.getLostItems();
      const items = res.data||[];
      if (!items.length) { el.innerHTML = emptyState('<i data-lucide="search"></i>','No lost reports',''); return; }
      el.innerHTML = `<div class="table-wrapper"><table>
        <thead><tr><th>Item</th><th>Reporter</th><th>Category</th><th>Location</th><th>Date Lost</th><th>Status</th></tr></thead>
        <tbody>${items.map(i=>`<tr>
          <td class="fw-600">${i.item_name}<div class="text-xs text-muted">${i.color||''}</div></td>
          <td>${i.user?.name||'—'}<div class="text-xs text-muted">${i.user?.email||''}</div></td>
          <td class="text-muted">${i.category?.name||'—'}</td>
          <td class="text-muted">${i.last_seen_location||'—'}</td>
          <td class="text-muted">${fmtDate(i.date_lost)}</td>
          <td>${badge(i.status)}</td>
        </tr>`).join('')}
        </tbody></table></div>`;
    } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
  })();
};

/* ---- ADMIN: CLAIMS ---- */
Views.adminClaims = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="folder-open"></i> All Claim Requests</h1><p class="page-subtitle">Approve, reject, or release claims</p></div>
        <button class="btn btn-secondary btn-sm" id="admin-claims-export">⬇ Export CSV</button>
      </div>
      <div id="admin-claims-list">${spinner()}</div>
    </div>`;
  document.getElementById('admin-claims-export').onclick = () => API.exportClaimRequests();
  loadClaimList('admin-claims-list','admin');
};

/* ---- ADMIN: ACTIVITY LOGS ---- */
Views.adminActivityLogs = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title"><i data-lucide="activity"></i> Activity Logs</h1>
          <p class="page-subtitle">Audit trail of important actions across the system</p>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" id="al-refresh">Refresh</button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-icon-wrap">
          <span class="search-icon"><i data-lucide="search"></i></span>
          <input id="al-q" class="form-control" placeholder="Search action / IP / user agent…"/>
        </div>
        <input id="al-action" class="form-control" style="max-width:240px" placeholder="Action (e.g. claim.approved)"/>
        <input id="al-actor" type="number" class="form-control" style="max-width:150px" placeholder="Actor ID"/>
        <input id="al-subject" type="number" class="form-control" style="max-width:160px" placeholder="Subject ID"/>
        <input id="al-limit" type="number" class="form-control" style="max-width:130px" value="200" min="1" max="500"/>
        <button class="btn btn-primary" id="al-search-btn">Search</button>
      </div>

      <div id="al-list">${spinner()}</div>
    </div>`;

  async function load() {
    const q = new URLSearchParams();
    const txt = document.getElementById('al-q').value.trim();
    const action = document.getElementById('al-action').value.trim();
    const actor = document.getElementById('al-actor').value;
    const subj = document.getElementById('al-subject').value;
    const limit = document.getElementById('al-limit').value;
    if (txt) q.set('q', txt);
    if (action) q.set('action', action);
    if (actor) q.set('actor_id', actor);
    if (subj) q.set('subject_id', subj);
    if (limit) q.set('limit', limit);

    const el = document.getElementById('al-list');
    el.innerHTML = spinner();
    try {
      const res = await API.getActivityLogs(q.toString());
      const logs = res.data || [];
      if (!logs.length) {
        el.innerHTML = emptyState('<i data-lucide="activity"></i>', 'No logs found', 'Try widening your search.');
        return;
      }
      el.innerHTML = `<div class="table-wrapper"><table>
        <thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Subject</th><th>IP</th></tr></thead>
        <tbody>
          ${logs.map(l => `<tr>
            <td class="text-muted">${fmtDate(l.created_at)}</td>
            <td class="fw-600">${l.action}</td>
            <td>${l.actor?.name || '—'}<div class="text-xs text-muted">#${l.actor?.id || '—'} ${l.actor?.email ? `• ${l.actor.email}` : ''}</div></td>
            <td class="text-muted">${(l.subject_type || '').split('\\').pop() || '—'}${l.subject_id ? ` #${l.subject_id}` : ''}</td>
            <td class="text-muted">${l.ip || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
    } catch (e) {
      document.getElementById('al-list').innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Failed to load logs', e.message);
    } finally {
      if (window.lucide) lucide.createIcons();
    }
  }

  document.getElementById('al-refresh').onclick = load;
  document.getElementById('al-search-btn').onclick = load;
  document.getElementById('al-q').onkeyup = (e) => { if (e.key === 'Enter') load(); };
  document.getElementById('al-action').onkeyup = (e) => { if (e.key === 'Enter') load(); };

  load();
};

/* ---- ADMIN: CATEGORIES ---- */
Views.adminCategories = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="tag"></i> Categories</h1><p class="page-subtitle">Manage item categories</p></div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" id="admin-cat-export">⬇ Export CSV</button>
          <button class="btn btn-primary" id="new-cat-btn">+ New Category</button>
        </div>
      </div>
      <div id="cat-list">${spinner()}</div>
    </div>`;

  document.getElementById('new-cat-btn').onclick = () => showCategoryForm();
  document.getElementById('admin-cat-export').onclick = () => API.exportCategories();
  loadCategories();
};

async function loadCategories() {
  const el = document.getElementById('cat-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getCategories();
    const cats = res.data||[];
    if (!cats.length) { el.innerHTML = emptyState('<i data-lucide="tag"></i>','No categories','Create your first category.'); return; }
    el.innerHTML = `<div class="grid grid-3">${cats.map(c=>`
      <div class="card flex justify-between items-center">
        <div>
          <div class="fw-600">${c.name}</div>
          ${c.description?`<div class="text-sm text-muted mt-8">${c.description}</div>`:''}
        </div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" data-edit-cat="${c.id}" data-name="${c.name}" data-desc="${c.description||''}">Edit</button>
          <button class="btn btn-danger btn-sm" data-del-cat="${c.id}">Del</button>
        </div>
      </div>`).join('')}</div>`;

    document.querySelectorAll('[data-edit-cat]').forEach(b => {
      b.onclick = () => showCategoryForm({ id: b.dataset.editCat, name: b.dataset.name, description: b.dataset.desc });
    });
    document.querySelectorAll('[data-del-cat]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Delete this category?')) return;
        try { await API.deleteCategory(b.dataset.delCat); toast('Category deleted.'); loadCategories(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
}

function showCategoryForm(cat = null) {
  const isEdit = !!cat;
  openModal(`
    <h2 class="modal-title">${isEdit?'Edit Category':'<i data-lucide="tag"></i> New Category'}</h2>
    <form id="cat-form">
      <div class="form-group">
        <label class="form-label">Category Name *</label>
        <input id="cf-name" class="form-control" value="${cat?.name||''}" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="cf-desc" class="form-control">${cat?.description||''}</textarea>
      </div>
      <div id="cf-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="cf-btn">${isEdit?'Update':'Create'}</button>
    </form>`);

  document.getElementById('cat-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('cf-btn'); btn.disabled=true; btn.textContent='Saving…';
    const payload = { name: document.getElementById('cf-name').value, description: document.getElementById('cf-desc').value };
    try {
      if (isEdit) await API.updateCategory(cat.id, payload);
      else await API.createCategory(payload);
      toast(isEdit?'Category updated.':'Category created!');
      closeModal();
      loadCategories();
    } catch(err) {
      document.getElementById('cf-err').textContent = err.message;
      btn.disabled=false; btn.textContent=isEdit?'Update':'Create';
    }
  };
}

/* ---- ADMIN: USER MANAGEMENT ---- */
Views.adminUsers = function() {
  if (!Router.requireAuth('admin')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="users"></i> User Management</h1><p class="page-subtitle">Manage system users and staff</p></div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" id="new-user-btn">+ New Regular User</button>
          <button class="btn btn-primary btn-sm" id="new-staff-btn">+ New Staff Account</button>
        </div>
      </div>
      <div id="admin-user-list">${spinner()}</div>
    </div>`;

  document.getElementById('new-user-btn').onclick = () => showUserForm('user');
  document.getElementById('new-staff-btn').onclick = () => showUserForm('staff');
  loadAdminUsers();
};

async function loadAdminUsers() {
  const el = document.getElementById('admin-user-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getUsers();
    const users = res.data||[];
    if (!users.length) { el.innerHTML = emptyState('<i data-lucide="users"></i>','No users found',''); return; }
    el.innerHTML = `<div class="table-wrapper"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
      <tbody>${users.map(u=>`<tr>
        <td class="fw-600">${u.name}</td>
        <td class="text-muted">${u.email}</td>
        <td><span class="role-badge ${u.role}">${u.role}</span></td>
        <td class="text-muted">${fmtDate(u.created_at)}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
}

function showUserForm(role = 'user') {
  const title = role === 'staff' ? 'New Staff Account' : 'New Regular User';
  openModal(`
    <h2 class="modal-title"><i data-lucide="user-plus"></i> ${title}</h2>
    <p class="text-muted mb-24">Create a new ${role} account. The user must use an @mlgcl.edu.ph address.</p>
    <form id="user-mgmt-form">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input id="um-name" class="form-control" placeholder="John Doe" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address *</label>
        <input id="um-email" type="email" class="form-control" placeholder="username@mlgcl.edu.ph" required/>
      </div>
      <div class="grid grid-2 gap-16">
        <div class="form-group">
          <label class="form-label">Password *</label>
          <input id="um-pass" type="password" class="form-control" placeholder="••••••••" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password *</label>
          <input id="um-conf" type="password" class="form-control" placeholder="••••••••" required/>
        </div>
      </div>
      <div id="um-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="um-btn">Create ${role.charAt(0).toUpperCase() + role.slice(1)}</button>
    </form>`);

  document.getElementById('user-mgmt-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('um-btn');
    const name = document.getElementById('um-name').value;
    const email = document.getElementById('um-email').value;
    const password = document.getElementById('um-pass').value;
    const password_confirmation = document.getElementById('um-conf').value;

    if (password !== password_confirmation) {
      document.getElementById('um-err').textContent = 'Passwords do not match.';
      return;
    }

    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      if (role === 'staff') {
        await API.adminCreateStaff({ name, email, password, password_confirmation });
      } else {
        await API.adminCreateUser({ name, email, password, password_confirmation });
      }
      toast(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`);
      closeModal();
      loadAdminUsers();
    } catch(err) {
      document.getElementById('um-err').textContent = err.message;
      btn.disabled = false; btn.textContent = `Create ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    }
  };
}
