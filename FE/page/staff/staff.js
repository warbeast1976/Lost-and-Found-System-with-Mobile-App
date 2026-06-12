/* Staff panel views: Dashboard, Found Items (CRUD), Claim Requests */

/* ---- STAFF DASHBOARD ---- */
Views.staffDashboard = async function() {
  if (!Router.requireAuth('staff')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">👷 Staff Dashboard</h1><p class="page-subtitle">Manage found items and review claim requests</p></div>
        <button class="btn btn-primary" id="log-found-btn">+ Log Found Item</button>
      </div>
      <div id="staff-stats">${spinner()}</div>
      <div style="margin-top:28px">
        <h2 class="section-title"><i data-lucide="folder-open"></i> Pending Claims for My Items</h2>
        <div id="pending-claims">${spinner()}</div>
      </div>
    </div>`;

  document.getElementById('log-found-btn').onclick = () => {
    Router.go('staff-found-items');
    setTimeout(() => showFoundItemForm(), 300);
  };

  try {
    const [foundRes, claimRes] = await Promise.all([API.getFoundItems(), API.getClaimRequests()]);
    const found = foundRes.data || []; const claims = claimRes.data || [];
    document.getElementById('staff-stats').innerHTML = `
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-icon green"><i data-lucide="package"></i></div><div><div class="stat-value">${found.length}</div><div class="stat-label">My Found Items</div></div></div>
        <div class="stat-card"><div class="stat-icon indigo"><i data-lucide="check-circle-2"></i></div><div><div class="stat-value">${found.filter(i=>i.status==='available').length}</div><div class="stat-label">Available</div></div></div>
        <div class="stat-card"><div class="stat-icon amber"><i data-lucide="hourglass"></i></div><div><div class="stat-value">${claims.filter(c=>c.status==='pending').length}</div><div class="stat-label">Pending Claims</div></div></div>
        <div class="stat-card"><div class="stat-icon sky"><i data-lucide="clipboard-list"></i></div><div><div class="stat-value">${found.filter(i=>i.status==='claimed').length}</div><div class="stat-label">Claimed</div></div></div>
      </div>`;

    const pending = claims.filter(c=>c.status==='pending').slice(0,5);
    document.getElementById('pending-claims').innerHTML = pending.length ? `
      <div class="table-wrapper"><table>
        <thead><tr><th>Item</th><th>Claimant</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody>${pending.map(c=>`<tr>
          <td class="fw-600">${c.found_item?.item_name||'—'}</td>
          <td>${c.claimant?.name||'—'}</td>
          <td class="text-muted">${fmtDate(c.created_at)}</td>
          <td><button class="btn btn-primary btn-sm" data-view-claim="${c.id}">View</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <button class="btn btn-secondary btn-sm mt-12" onclick="Router.go('staff-claims')">See All Claims →</button>` :
      emptyState('🎉','No pending claims','All clear for now!');

    document.querySelectorAll('[data-view-claim]').forEach(b => {
      b.onclick = async () => {
        const res = await API.getClaimRequest(b.dataset.viewClaim);
        showClaimDetail(res.data, 'staff');
      };
    });
  } catch(e) {
    const errHTML = emptyState('<i data-lucide="alert-circle"></i>', 'Failed to load', e.message);
    document.getElementById('staff-stats').innerHTML = errHTML;
    document.getElementById('pending-claims').innerHTML = errHTML;
    if (e.message.includes('401')) {
      Auth.clearSession();
      Router.go('login');
      toast('Your session has expired. Please log in again.', 'warning');
    } else {
      toast(e.message, 'error');
    }
  }
};

/* ---- STAFF: FOUND ITEMS ---- */
Views.staffFoundItems = function() {
  if (!Router.requireAuth('staff')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="package"></i> My Found Items</h1><p class="page-subtitle">Items you have logged as found</p></div>
        <button class="btn btn-primary" id="new-fi-btn">+ Log Found Item</button>
      </div>
      <div id="fi-staff-list">${spinner()}</div>
    </div>`;

  document.getElementById('new-fi-btn').onclick = () => showFoundItemForm();
  loadStaffFoundItems();
};

async function loadStaffFoundItems() {
  const el = document.getElementById('fi-staff-list');
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getFoundItems();
    const items = res.data || [];
    if (!items.length) { el.innerHTML = emptyState('<i data-lucide="package"></i>','No found items','Log a new found item to get started.'); return; }
    el.innerHTML = `<div class="table-wrapper"><table>
      <thead><tr><th>Item</th><th>Category</th><th>Location</th><th>Date Found</th><th>Status</th><th>Ref Code</th><th>Actions</th></tr></thead>
      <tbody>${items.map(i=>`<tr>
        <td>
          <div class="flex items-center gap-8">
            ${i.image_url ? `<img src="${i.image_url}" style="width:36px;height:36px;border-radius:6px;object-fit:cover"/>` : '<span style="font-size:1.4rem"><i data-lucide="package"></i></span>'}
            <div class="fw-600">${i.item_name}</div>
          </div>
        </td>
        <td class="text-muted">${i.category?.name||'—'}</td>
        <td class="text-muted">${i.found_location||'—'}</td>
        <td class="text-muted">${fmtDate(i.date_found)}</td>
        <td>${badge(i.status)}</td>
        <td><code style="font-size:0.75rem;color:var(--primary-light)">${i.reference_code||'—'}</code></td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" data-edit-fi="${i.id}">Edit</button>
            <button type="button" class="btn btn-warning btn-sm" data-view-qr="${i.id}">QR</button>
            <button class="btn btn-primary btn-sm" data-match-fi="${i.id}">Matches</button>
            ${i.status==='available'?`<button class="btn btn-danger btn-sm" data-del-fi="${i.id}">Del</button>`:''}
          </div>
        </td>
      </tr>`).join('')}
      </tbody></table></div>`;

    document.querySelectorAll('[data-edit-fi]').forEach(b => {
      b.onclick = async () => { const r = await API.getFoundItem(b.dataset.editFi); showFoundItemForm(r.data); };
    });
    document.querySelectorAll('[data-del-fi]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Delete this found item?')) return;
        try { await API.deleteFoundItem(b.dataset.delFi); toast('Item deleted.'); loadStaffFoundItems(); }
        catch(e) { toast(e.message,'error'); }
      };
    });
    document.querySelectorAll('[data-view-qr]').forEach(b => {
      b.addEventListener('click', (e) => showFoundItemQr(b.dataset.viewQr, e));
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

async function showFoundItemQr(itemId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  openModal(spinner(), true);

  const renderQrModal = (item) => {
    const qrUrl = item?.qr_code_url
      ? `${item.qr_code_url}${item.qr_code_url.includes('?') ? '&' : '?'}t=${Date.now()}`
      : null;

    openModal(`
      <h2 class="modal-title"><i data-lucide="qr-code"></i> Found Item QR Code</h2>
      <div style="text-align:center">
        ${qrUrl
          ? `<img src="${qrUrl}" alt="QR code for ${item.reference_code || 'item'}" style="display:block;max-width:240px;width:100%;margin:0 auto;border:1px solid var(--border);border-radius:12px;padding:8px;background:#fff"/>`
          : emptyState('<i data-lucide="qr-code"></i>', 'No QR code yet', 'Click regenerate to create one for this item.')}
        <p class="text-sm text-muted mt-12">Reference: <strong>${item.reference_code || '—'}</strong></p>
        <p class="text-xs text-muted mt-8">Attach this label to the physical item in storage.</p>
      </div>
      <div class="flex gap-8 mt-16 justify-center">
        <button type="button" class="btn btn-secondary btn-sm" id="modal-regen-qr">Regenerate</button>
        <button type="button" class="btn btn-primary btn-sm" id="modal-close-qr">Close</button>
      </div>
    `, true);

    document.getElementById('modal-close-qr')?.addEventListener('click', closeModal);
    document.getElementById('modal-regen-qr')?.addEventListener('click', async () => {
      const btn = document.getElementById('modal-regen-qr');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Regenerating…';
      }
      try {
        const regen = await API.regenerateQr(itemId);
        toast('QR code regenerated.');
        renderQrModal(regen.data);
      } catch (err) {
        toast(err.message, 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Regenerate';
        }
      }
    });

    if (window.lucide) lucide.createIcons();
  };

  try {
    const res = await API.getFoundItem(itemId);
    let item = res.data;

    if (!item?.qr_code_url) {
      const regen = await API.regenerateQr(itemId);
      item = regen.data;
    }

    renderQrModal(item);
  } catch (e) {
    openModal(emptyState('<i data-lucide="x-circle"></i>', 'Could not load QR code', e.message), true);
    if (window.lucide) lucide.createIcons();
  }
}

function showFoundItemForm(item = null) {
  const isEdit = !!item;
  openModal(`
    <h2 class="modal-title">${isEdit?'Edit Found Item':'<i data-lucide="package"></i> Log Found Item'}</h2>
    <form id="sfi-form">
      <div class="form-group"><label class="form-label">Item Name *</label>
        <input id="sfi-name" class="form-control" value="${item?.item_name||''}" required/></div>
      <div class="form-group"><label class="form-label">Category</label>
        <select id="sfi-cat" class="form-control"><option value="">Select…</option></select></div>
      <div class="form-group"><label class="form-label">Description</label>
        <textarea id="sfi-desc" class="form-control">${item?.description||''}</textarea></div>
      <div class="form-group"><label class="form-label">Color</label>
        <input id="sfi-color" class="form-control" value="${item?.color||''}"/></div>
      <div class="form-group"><label class="form-label">Found Location</label>
        <input id="sfi-loc" class="form-control" value="${item?.found_location||''}"/></div>
      <div class="form-group"><label class="form-label">Storage Location</label>
        <input id="sfi-storage" class="form-control" value="${item?.storage_location||''}"/></div>
      <div class="form-group"><label class="form-label">Date Found</label>
        <input id="sfi-date" type="date" class="form-control" value="${item?.date_found||''}"/></div>
      <div class="form-group"><label class="form-label">Image</label>
        <div class="img-upload-box" id="sfi-img-box">
          <input type="file" id="sfi-img" accept="image/*"/>
          <div id="sfi-img-lbl">${item?.image_url?'<i data-lucide="camera"></i> Replace image':'<i data-lucide="camera"></i> Upload image'}</div>
          ${item?.image_url?`<img class="img-preview" src="${item.image_url}"/>`:''}
        </div>
      </div>
      <div id="sfi-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="sfi-btn">${isEdit?'Update':'Log Item'}</button>
    </form>`, true);

  loadCategorySelect('sfi-cat').then(() => { if (item?.category) document.getElementById('sfi-cat').value = item.category.id; });
  document.getElementById('sfi-img-box').onclick = () => document.getElementById('sfi-img').click();
  document.getElementById('sfi-img').onchange = (e) => { const f=e.target.files[0]; if(f) document.getElementById('sfi-img-lbl').textContent=f.name; };
  document.getElementById('sfi-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('sfi-btn'); btn.disabled=true; btn.textContent='Saving…';
    const fd = new FormData();
    fd.append('item_name', document.getElementById('sfi-name').value);
    const cat = document.getElementById('sfi-cat').value; if(cat) fd.append('category_id', cat);
    fd.append('description', document.getElementById('sfi-desc').value);
    fd.append('color', document.getElementById('sfi-color').value);
    fd.append('found_location', document.getElementById('sfi-loc').value);
    fd.append('storage_location', document.getElementById('sfi-storage').value);
    fd.append('date_found', document.getElementById('sfi-date').value);
    const img = document.getElementById('sfi-img').files[0]; if(img) fd.append('image', img);
    try {
      if (isEdit) await API.updateFoundItem(item.id, fd, true);
      else await API.createFoundItem(fd, true);
      toast(isEdit?'Item updated.':'Item logged successfully!');
      closeModal();
      if (document.getElementById('fi-staff-list')) loadStaffFoundItems();
    } catch(err) {
      document.getElementById('sfi-err').textContent = err.message;
      btn.disabled=false; btn.textContent=isEdit?'Update':'Log Item';
    }
  };
}

/* ---- STAFF: CLAIM REQUESTS ---- */
Views.staffClaims = function() {
  if (!Router.requireAuth('staff')) return;
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title"><i data-lucide="folder-open"></i> Claim Requests</h1><p class="page-subtitle">Claims submitted for items you logged</p></div>
      </div>
      <div id="staff-claims-list">${spinner()}</div>
    </div>`;
  loadClaimList('staff-claims-list', 'staff');
};

async function loadClaimList(elId, role) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = spinner();
  try {
    const res = await API.getClaimRequests();
    const claims = res.data || [];
    if (!claims.length) { el.innerHTML = emptyState('<i data-lucide="folder-open"></i>','No claims','Nothing to show.'); return; }
    el.innerHTML = `<div class="table-wrapper"><table>
      <thead><tr><th>Item</th><th>Claimant</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
      <tbody>${claims.map(c=>`<tr>
        <td class="fw-600">${c.found_item?.item_name||'—'}</td>
        <td>${c.claimant?.name||'—'}<div class="text-xs text-muted">${c.claimant?.email||''}</div></td>
        <td>${badge(c.status)}</td>
        <td class="text-muted">${fmtDate(c.created_at)}</td>
        <td><button class="btn btn-secondary btn-sm" data-view-claim="${c.id}">Details</button></td>
      </tr>`).join('')}
      </tbody></table></div>`;
    document.querySelectorAll('[data-view-claim]').forEach(b => {
      b.onclick = async () => { const r = await API.getClaimRequest(b.dataset.viewClaim); showClaimDetail(r.data, role); };
    });
  } catch(e) { el.innerHTML = emptyState('<i data-lucide="x-circle"></i>','Error',e.message); }
}

function showClaimDetail(claim, role) {
  openModal(`
    <h2 class="modal-title">Claim #${claim.id}</h2>
    <div class="detail-grid mb-16">
      <div class="detail-row"><div class="detail-label">Item</div><div class="detail-value fw-600">${claim.found_item?.item_name||'—'}</div></div>
      <div class="detail-row"><div class="detail-label">Status</div><div class="detail-value">${badge(claim.status)}</div></div>
      <div class="detail-row"><div class="detail-label">Claimant</div><div class="detail-value">${claim.claimant?.name||'—'}</div></div>
      <div class="detail-row"><div class="detail-label">Email</div><div class="detail-value">${claim.claimant?.email||'—'}</div></div>
      <div class="detail-row"><div class="detail-label">Submitted</div><div class="detail-value">${fmtDate(claim.created_at)}</div></div>
      ${claim.approved_at?`<div class="detail-row"><div class="detail-label">Approved</div><div class="detail-value">${fmtDate(claim.approved_at)}</div></div>`:''}
      ${claim.released_at?`<div class="detail-row"><div class="detail-label">Released</div><div class="detail-value">${fmtDate(claim.released_at)}</div></div>`:''}
      ${claim.pickup_code?`<div class="detail-row"><div class="detail-label">Pickup Code</div><div class="detail-value"><code>${claim.pickup_code}</code>${claim.pickup_code_expires_at?` <span class="text-xs text-muted">(expires ${fmtDate(claim.pickup_code_expires_at)})</span>`:''}</div></div>`:''}
    </div>
    <div class="form-group"><div class="detail-label">Proof Description</div><p class="text-sm mt-8">${claim.proof_details||'—'}</p></div>
    ${claim.proof_image_url?`<img src="${claim.proof_image_url}" style="width:100%;border-radius:var(--radius-sm);max-height:220px;object-fit:cover;margin-bottom:16px"/>`:''}
    ${role!=='user'?`
      <div class="form-group">
        <label class="form-label">Staff Notes</label>
        <textarea id="staff-notes" class="form-control" placeholder="Internal notes for verification / pickup instructions">${claim.staff_notes||''}</textarea>
        <div class="flex justify-end mt-12">
          <button class="btn btn-secondary btn-sm" id="save-notes">Save Notes</button>
        </div>
      </div>
    `:''}
    <div class="form-group">
      <div class="flex justify-between items-center">
        <label class="form-label" style="margin:0">Activity</label>
        <button class="btn btn-secondary btn-sm" id="refresh-activity">Refresh</button>
      </div>
      <div id="claim-activity" class="mt-12">${spinner()}</div>
    </div>
    ${role==='admin' && claim.status==='pending'?`
      <div class="flex gap-8 mt-8">
        <button class="btn btn-success" id="do-approve"><i data-lucide="check-circle-2"></i> Approve</button>
        <button class="btn btn-danger" id="do-reject"><i data-lucide="x-circle"></i> Reject</button>
      </div>`:''}
    ${role==='admin' && claim.status==='approved'?`
      <div class="form-group mt-16">
        <label class="form-label">Pickup Code (required to release)</label>
        <input id="pickup-code-input" class="form-control" placeholder="Enter 6-digit code"/>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary" id="reissue-code"><i data-lucide="refresh-cw"></i> Re-issue Code</button>
        <button class="btn btn-primary" style="flex:1" id="do-release"><i data-lucide="package"></i> Verify &amp; Release</button>
      </div>`:''}
  `, true);

  async function loadActivity() {
    const el = document.getElementById('claim-activity');
    if (!el) return;
    el.innerHTML = spinner();
    try {
      const res = await API.getClaimActivity(claim.id, 50);
      const logs = res.data || [];
      if (!logs.length) {
        el.innerHTML = `<div class="text-sm text-muted">No activity yet.</div>`;
        return;
      }
      el.innerHTML = `<div class="table-wrapper"><table>
        <thead><tr><th>Time</th><th>Action</th><th>Actor</th></tr></thead>
        <tbody>
          ${logs.map(l => `<tr>
            <td class="text-muted">${fmtDate(l.created_at)}</td>
            <td class="fw-600">${l.action}</td>
            <td>${l.actor?.name || '—'}<div class="text-xs text-muted">${l.actor?.email || ''}</div></td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
    } catch (e) {
      el.innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Failed to load activity', e.message);
    } finally {
      if (window.lucide) lucide.createIcons();
    }
  }

  document.getElementById('refresh-activity')?.addEventListener('click', loadActivity);
  loadActivity();

  document.getElementById('save-notes')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-notes');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const res = await API.updateClaimNotes(claim.id, document.getElementById('staff-notes').value);
      toast('Notes saved.');
      claim.staff_notes = res.data?.staff_notes ?? claim.staff_notes;
      loadActivity();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Save Notes';
    }
  });

  document.getElementById('reissue-code')?.addEventListener('click', async () => {
    if (!confirm('Re-issue pickup code? The old code will be replaced.')) return;
    try {
      const res = await API.reissuePickupCode(claim.id);
      toast('Pickup code re-issued.');
      closeModal();
      refreshClaimViews();
      showClaimDetail(res.data, role);
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  document.getElementById('do-approve')?.addEventListener('click', async () => {
    try { await API.approveClaim(claim.id); toast('Claim approved! Email sent.'); closeModal(); refreshClaimViews(); }
    catch(e) { toast(e.message,'error'); }
  });
  document.getElementById('do-reject')?.addEventListener('click', async () => {
    try { await API.rejectClaim(claim.id); toast('Claim rejected.'); closeModal(); refreshClaimViews(); }
    catch(e) { toast(e.message,'error'); }
  });
  document.getElementById('do-release')?.addEventListener('click', async () => {
    const code = document.getElementById('pickup-code-input')?.value?.trim();
    if (!code) { toast('Pickup code is required.', 'warning'); return; }
    try { await API.releaseClaim(claim.id, code); toast('Item released!'); closeModal(); refreshClaimViews(); }
    catch(e) { toast(e.message,'error'); }
  });
}

function refreshClaimViews() {
  if (document.getElementById('admin-claims-list')) loadClaimList('admin-claims-list', 'admin');
  if (document.getElementById('staff-claims-list')) loadClaimList('staff-claims-list', 'staff');
}
