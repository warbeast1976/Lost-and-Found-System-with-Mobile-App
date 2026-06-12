/**
 * Toast Notification System
 * Premium SaaS Aesthetic
 */
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';
    if (type === 'warning') icon = 'alert-triangle';

    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${icon}"></i></div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);
    
    if (window.lucide) {
      lucide.createIcons({
        attrs: {
          class: ['lucide']
        },
        nameAttr: 'data-lucide'
      });
    }

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, duration);
  },

  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur) { this.show(msg, 'error', dur); },
  warn(msg, dur) { this.show(msg, 'warning', dur); },
  info(msg, dur) { this.show(msg, 'info', dur); }
};

// Auto-init on load if container exists
document.addEventListener('DOMContentLoaded', () => Toast.init());
