/* User portal views: Dashboard, My Lost Items, My Claims */

/* ---- USER DASHBOARD ---- */
Views.userDashboard = async function() {
  if (!Router.requireAuth('user')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title"><i data-lucide="hand"></i> Hello, ${Auth.user.name}</h1>
          <p class="page-subtitle">Manage your lost item reports and claim requests</p>
        </div>
      </div>
      <div id="dash-stats">${spinner()}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:28px" id="dash-recent">
        <div><h2 class="section-title"><i data-lucide="clipboard-list"></i> Recent Lost Reports</h2><div id="recent-lost">${spinner()}</div></div>
        <div><h2 class="section-title"><i data-lucide="folder-open"></i> Recent Claims</h2><div id="recent-claims">${spinner()}</div></div>
      </div>
      <div style="margin-top:28px">
        <h2 class="section-title"><i data-lucide="check-circle"></i> Quick Browse Found Items</h2>
        <div id="quick-found">${spinner()}</div>
      </div>
    </div>`;

  try {
    const [lostRes, claimRes, foundPub] = await Promise.all([
      API.getLostItems(), API.getClaimRequests(), API.publicFoundItems('per_page=6')
    ]);
    const lost = lostRes.data || []; const claims = claimRes.data || [];
    const foundItems = foundPub.data?.items || [];

    document.getElementById('dash-stats').innerHTML = `
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-icon indigo"><i data-lucide="clipboard-list"></i></div><div><div class="stat-value">${lost.length}</div><div class="stat-label">Lost Reports</div></div></div>
        <div class="stat-card"><div class="stat-icon amber"><i data-lucide="hourglass"></i></div><div><div class="stat-value">${lost.filter(i=>i.status==='pending').length}</div><div class="stat-label">Pending Reports</div></div></div>
        <div class="stat-card"><div class="stat-icon sky"><i data-lucide="folder-open"></i></div><div><div class="stat-value">${claims.length}</div><div class="stat-label">My Claims</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><i data-lucide="check-circle-2"></i></div><div><div class="stat-value">${claims.filter(c=>c.status==='released').length}</div><div class="stat-label">Items Retrieved</div></div></div>
      </div>`;

    document.getElementById('recent-lost').innerHTML = lost.length ? `
      <div class="table-wrapper"><table>
        <thead><tr><th>Item</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${lost.slice(0,5).map(i=>`<tr>
          <td class="fw-600">${i.item_name}</td>
          <td>${badge(i.status)}</td>
          <td class="text-muted">${fmtDate(i.date_lost)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
      <button class="btn btn-secondary btn-sm mt-12" id="see-all-lost">View All →</button>` :
      emptyState('<i data-lucide="clipboard-list"></i>', 'No lost reports', 'Report a lost item to get started.');

    document.getElementById('recent-claims').innerHTML = claims.length ? `
      <div class="table-wrapper"><table>
        <thead><tr><th>Item</th><th>Status</th></tr></thead>
        <tbody>${claims.slice(0,5).map(c=>`<tr>
          <td class="fw-600">${c.found_item?.item_name || '—'}</td>
          <td>${badge(c.status)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
      <button class="btn btn-secondary btn-sm mt-12" id="see-all-claims">View All →</button>` :
      emptyState('<i data-lucide="folder-open"></i>', 'No claims yet', 'Browse found items to submit a claim.');

    document.getElementById('quick-found').innerHTML = foundItems.length ?
      `<div class="grid grid-3">${foundItems.map(renderFoundCard).join('')}</div>
       <div style="text-align:center;margin-top:16px"><button class="btn btn-secondary" id="see-all-found">Browse All Found Items →</button></div>` :
      emptyState('<i data-lucide="package"></i>', 'No found items', '');

    document.getElementById('see-all-lost')?.addEventListener('click', () => Router.go('user-lost-items'));
    document.getElementById('see-all-claims')?.addEventListener('click', () => Router.go('user-claims'));
    document.getElementById('see-all-found')?.addEventListener('click', () => Router.go('browse-found'));
    document.querySelectorAll('[data-found-id]').forEach(el => {
      el.addEventListener('click', () => showPublicFoundDetail(el.dataset.foundId));
    });
  } catch(e) {
    const errHTML = emptyState('<i data-lucide="alert-circle"></i>', 'Failed to load', e.message);
    document.getElementById('dash-stats').innerHTML = errHTML;
    document.getElementById('recent-lost').innerHTML = errHTML;
    document.getElementById('recent-claims').innerHTML = errHTML;
    document.getElementById('quick-found').innerHTML = errHTML;
    if (e.message.includes('401')) {
      Auth.clearSession();
      Router.go('login');
      toast('Your session has expired. Please log in again.', 'warning');
    } else {
      toast(e.message, 'error');
    }
  }
};

/* ---- USER: MY LOST ITEMS ---- */
Views.userLostItems = function() {
  if (!Router.requireAuth('user')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="clipboard-list"></i> My Lost Reports</h1><p class="page-subtitle">Items you have reported as lost</p></div>
        <button class="btn btn-primary" id="new-lost-btn">+ Report Lost Item</button>
      </div>
      <div id="lost-list">${spinner()}</div>
    </div>`;

  document.getElementById('new-lost-btn').onclick = () => showLostItemForm();
  loadUserLostItems();
};

async function loadUserLostItems() {
  const el = document.getElementById('lost-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getLostItems();
    const items = res.data || [];
    if (!items.length) { el.innerHTML = emptyState('<i data-lucide="clipboard-list"></i>', 'No reports yet', 'Click "Report Lost Item" to get started.'); return; }
    el.innerHTML = `<div class="table-wrapper"><table>
      <thead><tr><th>Item</th><th>Category</th><th>Location</th><th>Date Lost</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${items.map(i=>`<tr>
        <td><div class="fw-600">${i.item_name}</div><div class="text-xs text-muted">${i.color || ''}</div></td>
        <td class="text-muted">${i.category?.name || '—'}</td>
        <td class="text-muted">${i.last_seen_location || '—'}</td>
        <td class="text-muted">${fmtDate(i.date_lost)}</td>
        <td>${badge(i.status)}</td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" data-edit-lost="${i.id}">Edit</button>
            <button class="btn btn-primary btn-sm" data-match-lost="${i.id}">Matches</button>
            ${i.status==='pending'?`<button class="btn btn-danger btn-sm" data-del-lost="${i.id}">Delete</button>`:''}
          </div>
        </td>
      </tr>`).join('')}
      </tbody></table></div>`;

    document.querySelectorAll('[data-edit-lost]').forEach(b => {
      b.onclick = async () => {
        const res2 = await API.getLostItem(b.dataset.editLost);
        showLostItemForm(res2.data);
      };
    });
    document.querySelectorAll('[data-del-lost]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Delete this report?')) return;
        try { await API.deleteLostItem(b.dataset.delLost); toast('Report deleted.'); loadUserLostItems(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
    document.querySelectorAll('[data-match-lost]').forEach(b => {
      b.onclick = async () => {
        openModal(spinner());
        try {
          const res3 = await API.getLostItemMatches(b.dataset.matchLost, 10);
          const list = res3.data?.items || [];
          openModal(`
            <h2 class="modal-title"><i data-lucide="sparkles"></i> Suggested Matches</h2>
            <p class="text-sm text-muted mb-16">These are likely found items based on category, name, color, and date proximity.</p>
            ${list.length ? `
              <div class="grid grid-2">
                ${list.map(i => `
                  <div class="card" style="cursor:pointer" data-found-id="${i.id}">
                    ${i.image_url ? `<img src="${i.image_url}" style="width:100%;border-radius:10px;max-height:140px;object-fit:cover;margin-bottom:10px"/>` : ''}
                    <div class="fw-600">${i.item_name}</div>
                    <div class="text-xs text-muted mt-8">
                      <span>Score: <strong>${i.match_score}</strong></span> •
                      <span>${i.category?.name || '—'}</span> •
                      <span>${fmtDate(i.date_found)}</span>
                    </div>
                    <div class="text-sm text-muted mt-8">${i.found_location || '—'}</div>
                    <div class="mt-12">${badge(i.status)}</div>
                  </div>
                `).join('')}
              </div>
            ` : emptyState('<i data-lucide="search"></i>', 'No strong matches yet', 'Try updating the report details (category/color) and check again later.')}
          `, true);

          document.querySelectorAll('[data-found-id]').forEach(el2 => {
            el2.addEventListener('click', () => showPublicFoundDetail(el2.dataset.foundId));
          });
        } catch (e) {
          openModal(emptyState('<i data-lucide="x-circle"></i>', 'Could not load matches', e.message));
        }
      };
    });
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Error', e.message); }
}

function showLostItemForm(item = null) {
  const isEdit = !!item;
  openModal(`
    <h2 class="modal-title">${isEdit ? 'Edit Lost Report' : '<i data-lucide="clipboard-list"></i> Report Lost Item'}</h2>
    <form id="li-form">
      <div class="form-group">
        <label class="form-label">Item Name *</label>
        <input id="li-name" class="form-control" value="${item?.item_name||''}" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select id="li-cat" class="form-control"><option value="">Select category</option></select>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="li-desc" class="form-control">${item?.description||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Color</label>
        <input id="li-color" class="form-control" value="${item?.color||''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Last Seen Location</label>
        <input id="li-loc" class="form-control" value="${item?.last_seen_location||''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Date Lost</label>
        <input id="li-date" type="date" class="form-control" value="${item?.date_lost||''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Image (Optional)</label>
        <div class="img-upload-box" id="li-img-box">
          <input type="file" id="li-img" accept="image/*"/>
          <div id="li-img-label">${item?.image_url ? '<i data-lucide="camera"></i> Replace image' : '<i data-lucide="camera"></i> Upload image'}</div>
          ${item?.image_url ? `<img class="img-preview" src="${item.image_url}"/>` : ''}
        </div>
      </div>
      <div id="li-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="li-btn">${isEdit?'Update':'Submit Report'}</button>
    </form>`);

  loadCategorySelect('li-cat').then(() => {
    if (item?.category) document.getElementById('li-cat').value = item.category.id;
  });

  document.getElementById('li-img-box').onclick = () => document.getElementById('li-img').click();
  document.getElementById('li-img').onchange = (e) => {
    const f = e.target.files[0];
    if (f) { document.getElementById('li-img-label').textContent = f.name; }
  };

  document.getElementById('li-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('li-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    const fd = new FormData();
    fd.append('item_name', document.getElementById('li-name').value);
    const cat = document.getElementById('li-cat').value;
    if (cat) fd.append('category_id', cat);
    fd.append('description', document.getElementById('li-desc').value);
    fd.append('color', document.getElementById('li-color').value);
    fd.append('last_seen_location', document.getElementById('li-loc').value);
    fd.append('date_lost', document.getElementById('li-date').value);
    const img = document.getElementById('li-img').files[0];
    if (img) fd.append('image', img);
    try {
      if (isEdit) await API.updateLostItem(item.id, fd, true);
      else await API.createLostItem(fd, true);
      toast(isEdit ? 'Report updated.' : 'Report submitted!');
      closeModal();
      loadUserLostItems();
    } catch(err) {
      document.getElementById('li-err').textContent = err.message;
      btn.disabled = false; btn.textContent = isEdit ? 'Update' : 'Submit Report';
    }
  };
}

/* ---- USER: MY CLAIMS ---- */
Views.userClaims = function() {
  if (!Router.requireAuth('user')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="folder-open"></i> My Claim Requests</h1><p class="page-subtitle">Track the status of your submitted claims</p></div>
        <button class="btn btn-secondary" id="browse-btn">Browse Found Items</button>
      </div>
      <div id="claims-list">${spinner()}</div>
    </div>`;

  document.getElementById('browse-btn').onclick = () => Router.go('browse-found');
  loadUserClaims();
};

async function loadUserClaims() {
  const el = document.getElementById('claims-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getClaimRequests();
    const claims = res.data || [];
    if (!claims.length) { el.innerHTML = emptyState('<i data-lucide="folder-open"></i>', 'No claims yet', 'Browse found items and submit a claim.'); return; }
    el.innerHTML = `<div class="grid grid-2">${claims.map(c=>`
      <div class="card">
        <div class="flex justify-between items-center mb-16">
          <div class="fw-600">${c.found_item?.item_name || 'Unknown Item'}</div>
          ${badge(c.status)}
        </div>
        ${c.proof_image_url ? `<img src="${c.proof_image_url}" style="width:100%;border-radius:var(--radius-sm);max-height:140px;object-fit:cover;margin-bottom:12px"/>` : ''}
        <div class="text-sm text-muted mb-16">${c.proof_details || '—'}</div>
        ${c.pickup_code ? `
          <div class="card" style="padding:10px;border:1px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.03);margin-bottom:12px">
            <div class="text-xs text-muted">Pickup code</div>
            <div class="fw-700" style="letter-spacing:2px;font-size:1.1rem"><code>${c.pickup_code}</code></div>
            ${c.pickup_code_expires_at ? `<div class="text-xs text-muted">Expires ${fmtDate(c.pickup_code_expires_at)}</div>` : ''}
          </div>
        ` : ''}
        <div class="detail-grid text-sm">
          <div><span class="text-muted">Location: </span>${c.found_item?.found_location||'—'}</div>
          <div><span class="text-muted">Ref: </span>${c.found_item?.reference_code||'—'}</div>
          <div><span class="text-muted">Submitted: </span>${fmtDate(c.created_at)}</div>
          ${c.approved_at?`<div><span class="text-muted">Approved: </span>${fmtDate(c.approved_at)}</div>`:''}
          ${c.released_at?`<div><span class="text-muted">Released: </span>${fmtDate(c.released_at)}</div>`:''}
        </div>
        ${c.status==='pending' ? `
          <div class="flex gap-8 mt-16">
            <button class="btn btn-secondary btn-sm" data-edit-claim="${c.id}" data-item="${c.found_item?.item_name}">Edit</button>
            <button class="btn btn-danger btn-sm" data-del-claim="${c.id}">Cancel</button>
          </div>` : ''}
      </div>`).join('')}</div>`;

    document.querySelectorAll('[data-del-claim]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Cancel this claim?')) return;
        try { await API.deleteClaimRequest(b.dataset.delClaim); toast('Claim cancelled.'); loadUserClaims(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
    document.querySelectorAll('[data-edit-claim]').forEach(b => {
      b.onclick = async () => {
        const res = await API.getClaimRequest(b.dataset.editClaim);
        showEditClaimForm(res.data);
      };
    });
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
}

function showEditClaimForm(claim) {
  openModal(`
    <h2 class="modal-title">Edit Claim: ${claim.found_item?.item_name}</h2>
    <form id="ec-form">
      <div class="form-group">
        <label class="form-label">Proof Details</label>
        <textarea id="ec-details" class="form-control">${claim.proof_details||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Replace Proof Image</label>
        <div class="img-upload-box" id="ec-img-box">
          <input type="file" id="ec-img" accept="image/*"/>
          <div>${claim.proof_image_url?'<i data-lucide="camera"></i> Replace image':'<i data-lucide="camera"></i> Upload image'}</div>
          ${claim.proof_image_url?`<img class="img-preview" src="${claim.proof_image_url}"/>`:''}
        </div>
      </div>
      <div id="ec-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="ec-btn">Update Claim</button>
    </form>`);

  document.getElementById('ec-img-box').onclick = () => document.getElementById('ec-img').click();
  document.getElementById('ec-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ec-btn'); btn.disabled = true; btn.textContent='Saving…';
    const fd = new FormData();
    fd.append('proof_details', document.getElementById('ec-details').value);
    const img = document.getElementById('ec-img').files[0];
    if (img) fd.append('proof_image', img);
    try {
      await API.updateClaimRequest(claim.id, fd, true);
      toast('Claim updated.');
      closeModal();
      loadUserClaims();
    } catch(err) {
      document.getElementById('ec-err').textContent = err.message;
      btn.disabled = false; btn.textContent = 'Update Claim';
    }
  };
}

/* ---- PROFILE SETTINGS ---- */
Views.profile = async function() {
  if (!Router.requireAuth()) return;
  renderNavbar();
  const app = document.getElementById('app');
  const user = Auth.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const role = Auth.role();

  app.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card p-0 overflow-hidden" style="border:none; background:transparent; box-shadow:none;">
        <!-- Profile Cover & Header -->
        <div class="profile-cover"></div>
        <div class="profile-header-content">
          <div class="profile-avatar-wrapper" id="profile-img-box">
            ${user.profile_image ? `<img src="${user.profile_image}" id="avatar-preview"/>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;color:var(--text-dim);background:var(--surface-2)">${initial}</div>`}
            <div class="avatar-edit-overlay">
              <i data-lucide="camera"></i>
            </div>
            <input type="file" id="profile-img-input" accept="image/*" class="hidden"/>
          </div>
          <div class="profile-info">
            <h1>${user.name}</h1>
            <p><span class="role-badge ${role}">${role}</span> • ${user.email}</p>
          </div>
        </div>

        <!-- Main Settings Grid -->
        <div class="profile-main-grid">
          <!-- Internal Sidebar Navigation -->
          <aside class="profile-nav">
            <button class="profile-nav-item active" data-tab="account">
              <i data-lucide="user"></i> Account Information
            </button>
            <button class="profile-nav-item" data-tab="security">
              <i data-lucide="shield"></i> Security & Password
            </button>
          </aside>

          <!-- Settings Content Area -->
          <div class="profile-content">
            <!-- Account Tab -->
            <div id="tab-account" class="tab-content animate-fade-in">
              <div class="card glass-card">
                <h2 class="section-title"><i data-lucide="settings"></i> General Information</h2>
                <p class="text-sm text-muted mb-24">Update your profile details and how others see you on the platform.</p>
                <form id="profile-form">
                  <div class="grid grid-2">
                    <div class="form-group">
                      <label class="form-label">Full Name</label>
                      <input id="profile-name" class="form-control" value="${user.name || ''}" placeholder="Your full name" required/>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Email Address</label>
                      <input id="profile-email" class="form-control" value="${user.email || ''}" placeholder="email@mlgcl.edu.ph" required/>
                      <p class="text-xs text-muted mt-4">University email required.</p>
                    </div>
                  </div>
                  <div id="profile-err" class="form-error mb-16"></div>
                  <div class="flex justify-end mt-16">
                    <button class="btn btn-primary" type="submit" id="profile-btn">
                      <i data-lucide="save"></i> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Security Tab -->
            <div id="tab-security" class="tab-content animate-fade-in hidden">
              <div class="card glass-card">
                <h2 class="section-title"><i data-lucide="lock"></i> Security Settings</h2>
                <p class="text-sm text-muted mb-24">Protect your account by regularly updating your password.</p>
                <form id="password-form">
                  <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <div style="position:relative">
                      <input type="password" id="current-pass" class="form-control" placeholder="Enter current password"/>
                    </div>
                  </div>
                  <div class="grid grid-2">
                    <div class="form-group">
                      <label class="form-label">New Password</label>
                      <input type="password" id="new-pass" class="form-control" placeholder="Min. 8 characters"/>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Confirm New Password</label>
                      <input type="password" id="confirm-pass" class="form-control" placeholder="Repeat new password"/>
                    </div>
                  </div>
                  <div id="pass-err" class="form-error mb-16"></div>
                  <div class="flex justify-end mt-16">
                    <button class="btn btn-primary" type="submit" id="pass-btn">
                      <i data-lucide="shield-check"></i> Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Tab Switching Logic
  const tabs = document.querySelectorAll('.profile-nav-item');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    };
  });

  // Profile Form Logic
  const imgInput = document.getElementById('profile-img-input');
  const imgBox = document.getElementById('profile-img-box');
  
  imgBox.onclick = () => imgInput.click();
  imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        imgBox.innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover"/><div class="avatar-edit-overlay"><i data-lucide="camera"></i></div>`;
        if (window.lucide) lucide.createIcons();
      };
      reader.readAsDataURL(file);
    }
  };

  document.getElementById('profile-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('profile-btn');
    const err = document.getElementById('profile-err');
    btn.disabled = true; btn.innerHTML = '<i class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:8px"></i> Saving...';
    err.textContent = '';

    const fd = new FormData();
    fd.append('name', document.getElementById('profile-name').value);
    fd.append('email', document.getElementById('profile-email').value);
    const img = imgInput.files[0];
    if (img) fd.append('profile_image', img);

    try {
      const res = await API.updateProfile(fd);
      Auth.updateUser(res.data);
      toast('Profile updated successfully.');
      renderNavbar(); // Refresh sidebar avatar/name
    } catch(e) {
      err.textContent = e.message;
    } finally {
      btn.disabled = false; btn.innerHTML = '<i data-lucide="save"></i> Save Changes';
      if (window.lucide) lucide.createIcons();
    }
  };

  // Password Form Logic
  document.getElementById('password-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pass-btn');
    const err = document.getElementById('pass-err');
    const currentPass = document.getElementById('current-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    if (!currentPass || !newPass) {
      err.textContent = 'Please fill in both current and new password.';
      return;
    }
    if (newPass !== confirmPass) {
      err.textContent = 'Passwords do not match.';
      return;
    }

    btn.disabled = true; btn.innerHTML = '<i class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:8px"></i> Updating...';
    err.textContent = '';

    const fd = new FormData();
    fd.append('current_password', currentPass);
    fd.append('password', newPass);
    fd.append('password_confirmation', confirmPass);

    try {
      const res = await API.updateProfile(fd);
      Auth.updateUser(res.data);
      toast('Password updated successfully.');
      document.getElementById('password-form').reset();
    } catch(e) {
      err.textContent = e.message;
    } finally {
      btn.disabled = false; btn.innerHTML = '<i data-lucide="shield-check"></i> Update Password';
      if (window.lucide) lucide.createIcons();
    }
  };

  if (window.lucide) lucide.createIcons();
};
