/* Views namespace — must be declared before any view module files */
var Views = {};

/* ---- ROLE HELP / QUICKSTART ---- */
Views.roleHelp = function() {
  renderNavbar();
  const role = Auth.isLoggedIn() ? Auth.role() : 'guest';
  const app = document.getElementById('app');

  const blocks = {
    guest: {
      title: 'Welcome to FindBack',
      subtitle: 'Browse found items, search lost board, or sign in to claim/report.',
      steps: [
        { t: 'Browse Found Items', d: 'Search items that were turned in and view details.', go: () => Router.go('browse-found') },
        { t: 'Browse Lost Board', d: 'See what the community reported missing.', go: () => Router.go('browse-lost') },
        { t: 'Sign In / Register', d: 'Create an account to submit claims and reports.', go: () => Router.go('login') },
      ],
    },
    user: {
      title: 'User Help (Owner / Claimant)',
      subtitle: 'Report what you lost, browse what was found, and claim your items.',
      steps: [
        { t: 'Report a Lost Item', d: 'Go to My Reports → Report Lost Item.', go: () => Router.go('user-lost-items') },
        { t: 'Browse Found Items', d: 'Open an available item and file a claim request.', go: () => Router.go('browse-found') },
        { t: 'Track Claims', d: 'My Claims shows status + pickup code when approved.', go: () => Router.go('user-claims') },
        { t: 'Find Matches', d: 'In My Reports, use Matches to see suggested found items.', go: () => Router.go('user-lost-items') },
        { t: 'Scan / Lookup', d: 'Enter a reference code to quickly open the item.', go: () => Router.go('scan') },
      ],
    },
    staff: {
      title: 'Staff Help (Intake / Items)',
      subtitle: 'Log found items, keep details accurate, and assist verification.',
      steps: [
        { t: 'Log Found Item', d: 'Found Items → Log Found Item.', go: () => Router.go('staff-found-items') },
        { t: 'Check Possible Owners', d: 'Use Matches on a found item to see likely lost reports.', go: () => Router.go('staff-found-items') },
        { t: 'Review Claims', d: 'Claim Requests → open details, add staff notes, check pickup code.', go: () => Router.go('staff-claims') },
        { t: 'Scan / Lookup', d: 'Paste/reference a code from the QR label to find the item.', go: () => Router.go('scan') },
      ],
    },
    admin: {
      title: 'Admin Help (Approvals / Governance)',
      subtitle: 'Approve/reject/release claims, manage categories/users, and audit activity.',
      steps: [
        { t: 'Process Claims', d: 'All Claims → Approve/Reject. Release requires pickup code.', go: () => Router.go('admin-claims') },
        { t: 'Re-issue Pickup Code', d: 'If code expired/missing: open claim → Re-issue Code.', go: () => Router.go('admin-claims') },
        { t: 'Audit Trail', d: 'Activity Logs shows who did what and when.', go: () => Router.go('admin-activity-logs') },
        { t: 'Manage Taxonomy', d: 'Categories keeps searching and reporting structured.', go: () => Router.go('admin-categories') },
        { t: 'User & Staff Accounts', d: 'User Management → create staff/users.', go: () => Router.go('admin-users') },
        { t: 'Scan / Lookup', d: 'Quickly locate by reference code from QR prints.', go: () => Router.go('scan') },
      ],
    },
  };

  const cfg = blocks[role] || blocks.guest;

  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title"><i data-lucide="help-circle"></i> ${cfg.title}</h1>
          <p class="page-subtitle">${cfg.subtitle}</p>
        </div>
      </div>

      <div class="grid grid-2">
        ${cfg.steps.map((s, idx) => `
          <div class="card">
            <div class="fw-700" style="display:flex;align-items:center;gap:10px">
              <span class="badge badge--info">${String(idx + 1).padStart(2,'0')}</span>
              <span>${s.t}</span>
            </div>
            <div class="text-sm text-muted mt-12">${s.d}</div>
            <div class="mt-16">
              <button class="btn btn-primary btn-sm" data-help-go="${idx}">Open</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

  document.querySelectorAll('[data-help-go]').forEach(b => {
    const i = Number(b.dataset.helpGo);
    b.onclick = () => cfg.steps[i]?.go?.();
  });

  if (window.lucide) lucide.createIcons();
};

/* ---- SCAN / LOOKUP ---- */
Views.scanLookup = function() {
  renderNavbar();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title"><i data-lucide="qr-code"></i> Scan / Lookup</h1>
          <p class="page-subtitle">Enter a reference code (from QR label) to open the item instantly.</p>
        </div>
      </div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">Reference Code</label>
          <input id="scan-code" class="form-control" placeholder="e.g. A1B2C3D4E5"/>
          <div class="text-xs text-muted mt-8">Tip: You can paste the code from the QR printout.</div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-primary" id="scan-btn"><i data-lucide="search"></i> Lookup</button>
          <button class="btn btn-secondary" id="scan-clear">Clear</button>
        </div>
      </div>

      <div id="scan-result" class="mt-16"></div>
    </div>`;

  async function lookup() {
    const code = document.getElementById('scan-code').value.trim();
    const out = document.getElementById('scan-result');
    if (!code) { toast('Enter a reference code.', 'warning'); return; }
    out.innerHTML = spinner();
    try {
      const res = await API.getScan(code);
      const item = res.data;
      out.innerHTML = `
        <div class="card">
          <div class="flex justify-between items-center mb-16">
            <div class="fw-800">${item.item_name || 'Found Item'}</div>
            ${badge(item.status || 'available')}
          </div>
          ${item.image_url ? `<img src="${item.image_url}" style="width:100%;border-radius:10px;max-height:220px;object-fit:cover;margin-bottom:12px"/>` : ''}
          <div class="detail-grid">
            <div class="detail-row"><div class="detail-label">Reference</div><div class="detail-value"><code>${item.reference_code || code}</code></div></div>
            <div class="detail-row"><div class="detail-label">Category</div><div class="detail-value">${item.category?.name || '—'}</div></div>
            <div class="detail-row"><div class="detail-label">Found Location</div><div class="detail-value">${item.found_location || '—'}</div></div>
            <div class="detail-row"><div class="detail-label">Storage</div><div class="detail-value">${item.storage_location || '—'}</div></div>
            <div class="detail-row"><div class="detail-label">Date Found</div><div class="detail-value">${fmtDate(item.date_found)}</div></div>
          </div>
          ${item.description ? `<p class="text-sm text-muted mt-12">${item.description}</p>` : ''}
          ${Auth.isUser && Auth.isUser() && item.status === 'available'
            ? `<button class="btn btn-primary btn-block mt-16" id="scan-claim">File a Claim Request</button>`
            : ''}
        </div>
      `;
      document.getElementById('scan-claim')?.addEventListener('click', () => {
        // Reuse existing claim modal from public browse page.
        if (typeof showClaimForm === 'function') showClaimForm(item);
        else toast('Claim form is not available on this page.', 'error');
      });
    } catch (e) {
      out.innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Not found', e.message);
    } finally {
      if (window.lucide) lucide.createIcons();
    }
  }

  document.getElementById('scan-btn').onclick = lookup;
  document.getElementById('scan-clear').onclick = () => {
    document.getElementById('scan-code').value = '';
    document.getElementById('scan-result').innerHTML = '';
  };
  document.getElementById('scan-code').onkeyup = (e) => { if (e.key === 'Enter') lookup(); };

  if (window.lucide) lucide.createIcons();
};
