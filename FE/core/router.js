/* Client-side router */
const Router = {
  current: null,

  routes: {
    /* Public */
    'home':          () => Views.home(),
    'login':         () => Views.login(),
    'register':      () => Views.register(),
    'browse-found':  () => Views.browseFound(),
    'browse-lost':   () => Views.browseLost(),
    'scan':          () => Views.scanLookup(),
    'help':          () => Views.roleHelp(),
    'profile':       () => Views.profile(),

    /* User */
    'user-dashboard':   () => Views.userDashboard(),
    'user-lost-items':  () => Views.userLostItems(),
    'user-claims':      () => Views.userClaims(),

    /* Staff */
    'staff-dashboard':   () => Views.staffDashboard(),
    'staff-found-items': () => Views.staffFoundItems(),
    'staff-claims':      () => Views.staffClaims(),

    /* Admin */
    'admin-dashboard':   () => Views.adminDashboard(),
    'admin-found-items': () => Views.adminFoundItems(),
    'admin-lost-items':  () => Views.adminLostItems(),
    'admin-claims':      () => Views.adminClaims(),
    'admin-categories':  () => Views.adminCategories(),
    'admin-users':       () => Views.adminUsers(),
    'admin-activity-logs': () => Views.adminActivityLogs(),
  },

  go(view, params) {
    this.current = view;
    this.params = params || {};
    setActiveNav(view);
    const handler = this.routes[view];
    if (handler) {
      handler();
    } else {
      Views.home();
    }
  },

  /* Redirect based on role after login */
  goHome() {
    if (!Auth.isLoggedIn()) { this.go('home'); return; }
    const role = Auth.role();
    if (role === 'admin') this.go('admin-dashboard');
    else if (role === 'staff') this.go('staff-dashboard');
    else this.go('user-dashboard');
  },

  requireAuth(role) {
    if (!Auth.isLoggedIn()) { this.go('login'); return false; }
    if (role && Auth.role() !== role) {
      if (Array.isArray(role) && !role.includes(Auth.role())) {
        this.goHome(); return false;
      } else if (!Array.isArray(role) && Auth.role() !== role) {
        this.goHome(); return false;
      }
    }
    return true;
  },
};
