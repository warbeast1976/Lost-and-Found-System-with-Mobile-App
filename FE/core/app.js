/* App bootstrap */
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();

  // Watch for DOM changes to aggressively load newly injected Lucide SVG icons
  const observer = new MutationObserver(() => {
    if (window.lucide) {
      observer.disconnect(); // Prevent infinite loop when lucide mutates the DOM
      lucide.createIcons();
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Handle browser back button
  window.addEventListener('popstate', () => {
    const v = window.location.hash.replace('#','') || 'home';
    if (Router.routes[v]) {
      Router.current = v;
      setActiveNav(v);
      Router.routes[v]();
    }
  });

  // Basic routing override to keep hash in sync
  const origGo = Router.go.bind(Router);
  Router.go = function(view, params) {
    if (window.location.hash !== '#' + view) {
      window.history.pushState(null, '', '#' + view);
    }
    origGo(view, params);
  };

  const hash = window.location.hash.replace('#', '');
  if (hash && Router.routes[hash]) {
    Router.go(hash);
  } else if (Auth.isLoggedIn()) {
    Router.goHome();
  } else {
    Router.go('home');
  }
});
