/* Auth state management */
const Auth = {
  user: null,

  init() {
    const saved = localStorage.getItem('user');
    if (saved) {
      try { this.user = JSON.parse(saved); } catch(e) {}
    }
  },

  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
  },

  updateUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
    if (window.renderNavbar) renderNavbar();
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
  },

  isLoggedIn() { return !!localStorage.getItem('token'); },
  role() { return this.user?.role || null; },
  isAdmin() { return this.user?.role === 'admin'; },
  isStaff() { return this.user?.role === 'staff'; },
  isUser()  { return this.user?.role === 'user'; },
};

Auth.init();
