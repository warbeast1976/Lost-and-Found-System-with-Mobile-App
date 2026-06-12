/* Public views: Home, Login, Register, Browse Found, Browse Lost */

/* ---- HOME / LANDING ---- */
Views.home = function() {
  if (Auth.isLoggedIn()) { Router.goHome(); return; }
  document.body.classList.remove('sidebar-open');
  document.getElementById('sidebar').classList.remove('sidebar--open');
  document.getElementById('sidebar').innerHTML = '';

  document.getElementById('app').innerHTML = `
    <div class="landing">

      <!-- Public Header -->
      <header class="pub-header">
        <div class="pub-header-inner">
          <div class="pub-logo-wrap" id="pub-logo">
            <div class="pub-logo-icon"><i data-lucide="search"></i></div>
            <span class="pub-logo-text">FindBack</span>
          </div>
          <div class="pub-header-actions">
            <button class="btn btn-ghost btn-sm" id="h-browse">Browse Items</button>
            <button class="btn btn-outline btn-sm" id="h-login">Sign In</button>
            <button class="btn btn-primary btn-sm" id="h-register">Get Started</button>
          </div>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            Lost &amp; Found Management Platform
          </div>
          <h1 class="hero-title">
            Find what you lost.<br/>
            <span class="gradient-text">Return what you found.</span>
          </h1>
          <p class="hero-desc">
            A modern platform for reporting lost items, browsing found items,
            and managing claims — powered by QR code tracking and role-based access.
          </p>
          <div class="hero-ctas">
            <button class="btn btn-primary btn-xl" id="cta-start">Get Started Free</button>
            <button class="btn btn-outline btn-xl" id="cta-browse-hero">Browse Found Items →</button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-val">QR</span>
              <span class="hero-stat-lbl">Smart Tracking</span>
            </div>
            <div class="hero-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-val">3</span>
              <span class="hero-stat-lbl">User Roles</span>
            </div>
            <div class="hero-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-val">∞</span>
              <span class="hero-stat-lbl">Items Tracked</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features-section">
        <div class="section-container">
          <div class="section-label">Platform Features</div>
          <h2 class="section-heading">Everything you need in one place</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-blue"><i data-lucide="search"></i></div>
              <h3>Smart Search & Filter</h3>
              <p>Find items by category, date, location, and color with advanced filtering.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-purple">📱</div>
              <h3>QR Code Tracking</h3>
              <p>Every found item gets a unique QR code for instant identification at any time.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-cyan"><i data-lucide="shield"></i></div>
              <h3>Role-Based Access</h3>
              <p>Dedicated dashboards for users, staff, and admins with the right permissions.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-green"><i data-lucide="clipboard-list"></i></div>
              <h3>Claim Management</h3>
              <p>Structured claim workflow with proof uploads and multi-step approval pipeline.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-amber"><i data-lucide="bar-chart"></i></div>
              <h3>Reports & CSV Exports</h3>
              <p>Export found items, lost reports, and claims to CSV for administrative use.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap feature-icon-rose"><i data-lucide="tag"></i></div>
              <h3>Category System</h3>
              <p>Organize items with a fully manageable category taxonomy.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section class="how-section">
        <div class="section-container">
          <div class="section-label">How It Works</div>
          <h2 class="section-heading">Simple three-step process</h2>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">01</div>
              <h3>Report or Browse</h3>
              <p>Lost something? Report it. Found something? Browse to see if your item was turned in.</p>
            </div>
            <div class="step-card">
              <div class="step-number">02</div>
              <h3>Submit a Claim</h3>
              <p>Found your item listed? Submit a claim with proof of ownership for staff review.</p>
            </div>
            <div class="step-card">
              <div class="step-number">03</div>
              <h3>Collect Your Item</h3>
              <p>Once your claim is approved and released, collect it from the designated location.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Band -->
      <section class="cta-section">
        <h2>Ready to get started?</h2>
        <p>Create your free account and start tracking lost &amp; found items today.</p>
        <button class="btn btn-primary btn-xl" id="cta-final">Create Free Account</button>
      </section>

      <!-- Footer -->
      <footer class="pub-footer">
        <div class="pub-footer-inner">
          <div class="pub-logo-wrap">
            <div class="pub-logo-icon"><i data-lucide="search"></i></div>
            <span class="pub-logo-text">FindBack</span>
          </div>
          <p class="pub-footer-copy">© 2026 FindBack. All rights reserved.</p>
        </div>
      </footer>
    </div>`;

  document.getElementById('pub-logo').onclick       = () => Router.go('home');
  document.getElementById('h-browse').onclick       = () => Router.go('browse-found');
  document.getElementById('h-login').onclick        = () => Router.go('login');
  document.getElementById('h-register').onclick     = () => Router.go('register');
  document.getElementById('cta-start').onclick      = () => Router.go('register');
  document.getElementById('cta-browse-hero').onclick= () => Router.go('browse-found');
  document.getElementById('cta-final').onclick      = () => Router.go('register');
};

/* ---- LOGIN ---- */
Views.login = function() {
  if (Auth.isLoggedIn()) { Router.goHome(); return; }
  document.body.classList.remove('sidebar-open');
  document.getElementById('sidebar').classList.remove('sidebar--open');
  document.getElementById('sidebar').innerHTML = '';

  document.getElementById('app').innerHTML = `
    <div class="auth-layout auth-layout--split">
      <div class="auth-panel-brand">
        <div class="auth-brand-bg"></div>
        <div class="auth-brand-content">
          <div class="auth-brand-logo">
            <div class="logo-icon"><i data-lucide="search"></i></div>
            <span>FindBack</span>
          </div>
          <h2 class="auth-brand-headline">Welcome back.<br/><span class="gradient-text-light">You've been missed.</span></h2>
          <p class="auth-brand-sub">Sign in to manage your reports, track claim requests, and stay on top of your lost &amp; found activity.</p>
          <div class="auth-brand-features">
            <div class="auth-brand-feat">
              <span class="auth-brand-feat-icon"><i data-lucide="activity"></i></span>
              <div>
                <strong>Live claim tracking</strong>
                <span>Follow every step from submission to release</span>
              </div>
            </div>
            <div class="auth-brand-feat">
              <span class="auth-brand-feat-icon"><i data-lucide="qr-code"></i></span>
              <div>
                <strong>QR identification</strong>
                <span>Instantly verify found items with a scan</span>
              </div>
            </div>
            <div class="auth-brand-feat">
              <span class="auth-brand-feat-icon"><i data-lucide="shield-check"></i></span>
              <div>
                <strong>Secure access</strong>
                <span>Role-based permissions for every user type</span>
              </div>
            </div>
          </div>
          <div class="auth-brand-stats">
            <div class="auth-brand-stat">
              <span class="auth-brand-stat-val">QR</span>
              <span class="auth-brand-stat-lbl">Smart Tracking</span>
            </div>
            <div class="auth-brand-stat-divider"></div>
            <div class="auth-brand-stat">
              <span class="auth-brand-stat-val">3</span>
              <span class="auth-brand-stat-lbl">User Roles</span>
            </div>
            <div class="auth-brand-stat-divider"></div>
            <div class="auth-brand-stat">
              <span class="auth-brand-stat-val">24/7</span>
              <span class="auth-brand-stat-lbl">Access</span>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-panel-form">
        <div class="auth-form-wrap animate-fade-in">
          <button type="button" class="auth-back-link" id="go-home">
            <i data-lucide="arrow-left"></i> Back to home
          </button>
          <div class="auth-card">
            <div class="auth-card-header">
              <div class="auth-card-icon"><i data-lucide="log-in"></i></div>
              <div>
                <h2 class="auth-card-title">Sign in</h2>
                <p class="auth-card-sub">Enter your credentials to continue</p>
              </div>
            </div>
            <form id="login-form">
              <div class="form-group">
                <label class="form-label" for="l-email">Email address</label>
                <div class="input-icon-wrap">
                  <span class="input-icon"><i data-lucide="mail"></i></span>
                  <input id="l-email" type="email" class="form-control input-with-icon" placeholder="you@example.com" autocomplete="email" required/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="l-pass">Password</label>
                <div class="input-icon-wrap">
                  <span class="input-icon"><i data-lucide="lock"></i></span>
                  <input id="l-pass" type="password" class="form-control input-with-icon" placeholder="Enter your password" autocomplete="current-password" required/>
                  <button type="button" class="input-toggle-pass" id="l-toggle-pass" aria-label="Show password">
                    <i data-lucide="eye"></i>
                  </button>
                </div>
              </div>
              <div id="l-err" class="auth-alert hidden" role="alert"></div>
              <button class="btn btn-primary btn-block btn-lg auth-submit" type="submit" id="l-btn">
                <span class="auth-submit-text">Sign in</span>
                <i data-lucide="arrow-right" class="auth-submit-icon"></i>
              </button>
            </form>
            <div class="auth-divider"><span>or</span></div>
            <button type="button" class="btn btn-outline btn-block" id="go-browse">
              <i data-lucide="compass"></i> Browse items without signing in
            </button>
            <div class="auth-footer">
              Don't have an account? <a href="#" id="go-register">Create one free</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('go-home').onclick     = () => Router.go('home');
  document.getElementById('go-register').onclick = (e) => { e.preventDefault(); Router.go('register'); };
  document.getElementById('go-browse').onclick   = () => Router.go('browse-found');

  const passInput = document.getElementById('l-pass');
  const toggleBtn = document.getElementById('l-toggle-pass');
  toggleBtn.onclick = () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    toggleBtn.innerHTML = show ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
    toggleBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    if (window.lucide) lucide.createIcons();
  };

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('l-btn');
    const errEl = document.getElementById('l-err');
    const submitText = btn.querySelector('.auth-submit-text');
    btn.disabled = true;
    submitText.textContent = 'Signing in…';
    errEl.textContent = '';
    errEl.classList.add('hidden');
    try {
      const res = await API.login({ email: document.getElementById('l-email').value, password: passInput.value });
      Auth.setSession(res.data.token, res.data.user);
      renderNavbar();
      Router.goHome();
      toast(`Welcome back, ${res.data.user.name}!`);
    } catch(err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
      btn.disabled = false;
      submitText.textContent = 'Sign in';
    }
  };
};

/* ---- REGISTER ---- */
Views.register = function() {
  if (Auth.isLoggedIn()) { Router.goHome(); return; }
  document.body.classList.remove('sidebar-open');
  document.getElementById('sidebar').classList.remove('sidebar--open');
  document.getElementById('sidebar').innerHTML = '';

  document.getElementById('app').innerHTML = `
    <div class="auth-layout">
      <div class="auth-panel-brand">
        <div class="auth-brand-logo">
          <div class="logo-icon"><i data-lucide="search"></i></div>
          <span>FindBack</span>
        </div>
        <h2 class="auth-brand-headline">Join the community.<br/><span class="gradient-text">Start finding.</span></h2>
        <p class="auth-brand-sub">Create an account to report lost items, browse found items, and submit claims in minutes.</p>
        <div class="auth-brand-features">
          <div class="auth-brand-feat"><span class="auth-brand-feat-icon"><i data-lucide="check"></i></span> Free to sign up, no credit card needed</div>
          <div class="auth-brand-feat"><span class="auth-brand-feat-icon"><i data-lucide="check"></i></span> Report lost items immediately</div>
          <div class="auth-brand-feat"><span class="auth-brand-feat-icon"><i data-lucide="check"></i></span> File claims with proof attachments</div>
        </div>
      </div>
      <div class="auth-panel-form">
        <div class="auth-card">
          <h2 class="auth-card-title">Create account</h2>
          <p class="auth-card-sub">Fill in your details to get started</p>
          <form id="reg-form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input id="r-name" type="text" class="form-control" placeholder="John Doe" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input id="r-email" type="email" class="form-control" placeholder="you@example.com" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input id="r-pass" type="password" class="form-control" placeholder="At least 8 characters" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input id="r-pass2" type="password" class="form-control" placeholder="Repeat password" required/>
            </div>
            <div id="r-err" class="form-error mb-16"></div>
            <button class="btn btn-primary btn-block btn-lg" type="submit" id="r-btn">Create Account</button>
          </form>
          <div class="auth-footer">Already have an account? <a href="#" id="go-login">Sign in</a></div>
        </div>
      </div>
    </div>`;

  document.getElementById('go-login').onclick = (e) => { e.preventDefault(); Router.go('login'); };
  document.getElementById('reg-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('r-btn');
    const errEl = document.getElementById('r-err');
    const pass = document.getElementById('r-pass').value;
    const pass2 = document.getElementById('r-pass2').value;
    if (pass !== pass2) { errEl.textContent = 'Passwords do not match.'; return; }
    btn.disabled = true; btn.textContent = 'Creating account…';
    errEl.textContent = '';
    try {
      const res = await API.register({
        name: document.getElementById('r-name').value,
        email: document.getElementById('r-email').value,
        password: pass, password_confirmation: pass2,
      });
      Auth.setSession(res.data.token, res.data.user);
      renderNavbar();
      Router.goHome();
      toast('Account created! Welcome to FindBack.');
    } catch(err) {
      errEl.textContent = err.message;
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  };
};

/* ---- BROWSE FOUND ITEMS (public) ---- */
Views.browseFound = function(page = 1) {
  renderNavbar();
  const app = document.getElementById('app');
  const isLoggedIn = Auth.isLoggedIn();
  app.innerHTML = `
    <div>
      ${!isLoggedIn ? `
      <div class="browse-topbar">
        <div class="browse-topbar-inner">
          <div class="pub-logo-wrap" id="back-home" style="cursor:pointer">
            <div class="pub-logo-icon" style="width:26px;height:26px;font-size:.85rem"><i data-lucide="search"></i></div>
            <span class="pub-logo-text">FindBack</span>
          </div>
          <div class="flex gap-8">
            <button class="btn btn-ghost btn-sm" id="go-login-top">Sign In</button>
            <button class="btn btn-primary btn-sm" id="go-register-top">Get Started</button>
          </div>
        </div>
      </div>` : ''}
      <div class="page-container">
        <div class="page-header">
          <div>
            <h1 class="page-title"><i data-lucide="check-circle"></i> Found Items</h1>
            <p class="page-subtitle">Browse items that have been turned in — yours might be here!</p>
          </div>
          ${!isLoggedIn ? `<button class="btn btn-primary" id="go-login-cta">Login to Claim</button>` : ''}
        </div>
        <div class="filter-bar">
          <div class="search-icon-wrap">
            <span class="search-icon"><i data-lucide="search"></i></span>
            <input id="fi-search" class="form-control" placeholder="Search items…"/>
          </div>
          <select id="fi-cat" class="form-control" style="max-width:200px"></select>
          <input id="fi-from" type="date" class="form-control" style="max-width:160px"/>
          <input id="fi-to"   type="date" class="form-control" style="max-width:160px"/>
          <button class="btn btn-primary" id="fi-search-btn">Filter</button>
        </div>
        <div id="fi-grid">${spinner()}</div>
        <div id="fi-pages"></div>
      </div>
    </div>`;

  if (!isLoggedIn) {
    document.getElementById('back-home')?.addEventListener('click', () => Router.go('home'));
    document.getElementById('go-login-top')?.addEventListener('click', () => Router.go('login'));
    document.getElementById('go-register-top')?.addEventListener('click', () => Router.go('register'));
    document.getElementById('go-login-cta')?.addEventListener('click', () => Router.go('login'));
  }

  async function load(p = 1) {
    const q = new URLSearchParams();
    const search = document.getElementById('fi-search')?.value;
    const cat    = document.getElementById('fi-cat')?.value;
    const from   = document.getElementById('fi-from')?.value;
    const to     = document.getElementById('fi-to')?.value;
    if (search) q.set('search', search);
    if (cat)    q.set('category_id', cat);
    if (from)   q.set('date_from', from);
    if (to)     q.set('date_to', to);
    q.set('page', p); q.set('per_page', 12);
    document.getElementById('fi-grid').innerHTML = spinner();
    try {
      const res = await API.publicFoundItems(q.toString());
      const { items, pagination: pg } = res.data;
      if (!items.length) {
        document.getElementById('fi-grid').innerHTML = emptyState('<i data-lucide="package"></i>', 'No items found', 'Try adjusting your filters.');
      } else {
        document.getElementById('fi-grid').innerHTML = `<div class="grid grid-3">${items.map(renderFoundCard).join('')}</div>`;
        document.querySelectorAll('[data-found-id]').forEach(el =>
          el.addEventListener('click', () => showPublicFoundDetail(el.dataset.foundId))
        );
      }
      const pagesEl = document.getElementById('fi-pages');
      pagesEl.innerHTML = '';
      if (pg && pg.last_page > 1) pagesEl.appendChild(renderPagination(pg, load));
    } catch(e) {
      document.getElementById('fi-grid').innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Error loading items', e.message);
    }
  }

  loadCategorySelect('fi-cat');
  document.getElementById('fi-search-btn').onclick = () => load(1);
  document.getElementById('fi-search').onkeyup = (e) => { if (e.key === 'Enter') load(1); };
  load(page);
};

function renderFoundCard(item) {
  return `<div class="item-card" data-found-id="${item.id}">
    ${item.image_url ? `<img class="item-card-img" src="${item.image_url}" alt="${item.item_name}" loading="lazy"/>` : `<div class="item-card-img-placeholder"><i data-lucide="package"></i></div>`}
    <div class="item-card-body">
      <div class="item-card-title">${item.item_name}</div>
      <div class="item-card-meta">
        <span><i data-lucide="map-pin"></i> ${item.found_location || '—'}</span>
        <span><i data-lucide="calendar"></i> ${fmtDate(item.date_found)}</span>
        ${item.color    ? `<span><i data-lucide="palette"></i> ${item.color}</span>` : ''}
        ${item.category ? `<span><i data-lucide="tag"></i> ${item.category.name}</span>` : ''}
      </div>
    </div>
    <div class="item-card-footer">
      ${badge(item.status)}
      <span class="text-xs text-muted">#${item.reference_code || ''}</span>
    </div>
  </div>`;
}

async function showPublicFoundDetail(id) {
  openModal(spinner());
  try {
    const res = await API.publicFoundItemById(id);
    const item = res.data;
    if (!item) { closeModal(); toast('Item not found.', 'error'); return; }
    openModal(`
      <h2 class="modal-title">${item.item_name}</h2>
      ${item.image_url ? `<img src="${item.image_url}" style="width:100%;border-radius:var(--radius-sm);margin-bottom:16px"/>` : ''}
      <div class="detail-grid">
        <div class="detail-row"><div class="detail-label">Status</div><div class="detail-value">${badge(item.status)}</div></div>
        <div class="detail-row"><div class="detail-label">Category</div><div class="detail-value">${item.category?.name||'—'}</div></div>
        <div class="detail-row"><div class="detail-label">Location</div><div class="detail-value">${item.found_location||'—'}</div></div>
        <div class="detail-row"><div class="detail-label">Date Found</div><div class="detail-value">${fmtDate(item.date_found)}</div></div>
        <div class="detail-row"><div class="detail-label">Color</div><div class="detail-value">${item.color||'—'}</div></div>
        <div class="detail-row"><div class="detail-label">Ref. Code</div><div class="detail-value">${item.reference_code||'—'}</div></div>
      </div>
      <p class="text-sm text-muted mt-12">${item.description||''}</p>
      ${Auth.isUser() && item.status==='available' ? `<button class="btn btn-primary btn-block mt-16" id="do-claim">File a Claim Request</button>` : ''}
      ${!Auth.isLoggedIn() ? `<button class="btn btn-outline btn-block mt-16" id="login-to-claim">Login to Claim</button>` : ''}
    `, true);
    document.getElementById('do-claim')?.addEventListener('click', () => { closeModal(); showClaimForm(item); });
    document.getElementById('login-to-claim')?.addEventListener('click', () => { closeModal(); Router.go('login'); });
  } catch(e) { toast(e.message, 'error'); closeModal(); }
}

function showClaimForm(item) {
  openModal(`
    <h2 class="modal-title">Submit Claim: ${item.item_name}</h2>
    <form id="claim-form">
      <input type="hidden" id="cf-found-id" value="${item.id}"/>
      <div class="form-group">
        <label class="form-label">Proof / Description <span style="color:var(--danger)">*</span></label>
        <textarea id="cf-details" class="form-control" placeholder="Describe how this item is yours…" required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Proof Image (Optional)</label>
        <div class="img-upload-box" id="cf-img-box">
          <input type="file" id="cf-img" accept="image/*"/>
          <div id="cf-img-label"><i data-lucide="camera"></i> Click to upload proof image</div>
        </div>
      </div>
      <div id="cf-err" class="form-error mb-16"></div>
      <button class="btn btn-primary btn-block" type="submit" id="cf-btn">Submit Claim</button>
    </form>`);

  document.getElementById('cf-img-box').onclick = () => document.getElementById('cf-img').click();
  document.getElementById('cf-img').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    document.getElementById('cf-img-label').textContent = f.name;
    const box = document.getElementById('cf-img-box');
    let preview = box.querySelector('.img-preview');
    if (!preview) {
      preview = document.createElement('img');
      preview.className = 'img-preview';
      box.appendChild(preview);
    }
    preview.src = URL.createObjectURL(f);
  };
  document.getElementById('claim-form').onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = document.getElementById('cf-btn');
    btn.disabled = true; btn.textContent = 'Submitting…';
    const fd = new FormData();
    fd.append('found_item_id', document.getElementById('cf-found-id').value);
    fd.append('proof_details', document.getElementById('cf-details').value);
    const img = document.getElementById('cf-img').files[0];
    if (img) fd.append('proof_image', img);
    try {
      await API.createClaimRequest(fd, true);
      toast("Claim submitted! We'll review it shortly.");
      closeModal();
      Router.go('user-claims');
    } catch(e) {
      document.getElementById('cf-err').textContent = e.message;
      btn.disabled = false; btn.textContent = 'Submit Claim';
    }
  };
}

/* ---- BROWSE LOST ITEMS (public) ---- */
Views.browseLost = function(page = 1) {
  renderNavbar();
  const app = document.getElementById('app');
  const isLoggedIn = Auth.isLoggedIn();
  app.innerHTML = `
    <div>
      ${!isLoggedIn ? `
      <div class="browse-topbar">
        <div class="browse-topbar-inner">
          <div class="pub-logo-wrap" id="back-home2" style="cursor:pointer">
            <div class="pub-logo-icon" style="width:26px;height:26px;font-size:.85rem"><i data-lucide="search"></i></div>
            <span class="pub-logo-text">FindBack</span>
          </div>
          <button class="btn btn-primary btn-sm" id="go-login-lt">Sign In</button>
        </div>
      </div>` : ''}
      <div class="page-container">
        <div class="page-header">
          <div>
            <h1 class="page-title"><i data-lucide="alert-circle"></i> Lost Items Board</h1>
            <p class="page-subtitle">Items reported as lost by community members</p>
          </div>
        </div>
        <div class="filter-bar">
          <div class="search-icon-wrap">
            <span class="search-icon"><i data-lucide="search"></i></span>
            <input id="li-search" class="form-control" placeholder="Search…"/>
          </div>
          <select id="li-cat" class="form-control" style="max-width:200px"></select>
          <button class="btn btn-primary" id="li-search-btn">Filter</button>
        </div>
        <div id="li-grid">${spinner()}</div>
        <div id="li-pages"></div>
      </div>
    </div>`;

  if (!isLoggedIn) {
    document.getElementById('back-home2')?.addEventListener('click', () => Router.go('home'));
    document.getElementById('go-login-lt')?.addEventListener('click', () => Router.go('login'));
  }

  async function load(p = 1) {
    const q = new URLSearchParams();
    const search = document.getElementById('li-search')?.value;
    const cat    = document.getElementById('li-cat')?.value;
    if (search) q.set('search', search);
    if (cat)    q.set('category_id', cat);
    q.set('page', p); q.set('per_page', 12);
    document.getElementById('li-grid').innerHTML = spinner();
    try {
      const res = await API.publicLostItems(q.toString());
      const { items, pagination } = res.data;
      if (!items.length) {
        document.getElementById('li-grid').innerHTML = emptyState('<i data-lucide="search"></i>', 'No lost items found', 'Try different search terms.');
      } else {
        document.getElementById('li-grid').innerHTML = `<div class="grid grid-3">
          ${items.map(item => `<div class="item-card">
            ${item.image_url ? `<img class="item-card-img" src="${item.image_url}" loading="lazy"/>` : `<div class="item-card-img-placeholder"><i data-lucide="search"></i></div>`}
            <div class="item-card-body">
              <div class="item-card-title">${item.item_name}</div>
              <div class="item-card-meta">
                <span><i data-lucide="map-pin"></i> ${item.last_seen_location||'—'}</span>
                <span><i data-lucide="calendar"></i> Last seen ${fmtDate(item.date_lost)}</span>
                ${item.color    ? `<span><i data-lucide="palette"></i> ${item.color}</span>` : ''}
                ${item.category ? `<span><i data-lucide="tag"></i> ${item.category.name}</span>` : ''}
              </div>
            </div>
            <div class="item-card-footer">${badge(item.status)}</div>
          </div>`).join('')}
        </div>`;
      }
      const pagesEl = document.getElementById('li-pages');
      pagesEl.innerHTML = '';
      if (pagination && pagination.last_page > 1) pagesEl.appendChild(renderPagination(pagination, load));
    } catch(e) {
      document.getElementById('li-grid').innerHTML = emptyState('<i data-lucide="x-circle"></i>', 'Error', e.message);
    }
  }
  loadCategorySelect('li-cat');
  document.getElementById('li-search-btn').onclick = () => load(1);
  document.getElementById('li-search').onkeyup = (e) => { if (e.key === 'Enter') load(1); };
  load(page);
};
