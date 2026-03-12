// toast.js – DRAINED TABLET ULTIMATE v7.0.0
// Global toast notification system with multiple types, durations, and animations.

class Toast {
    constructor() {
        this.container = null;
        this.defaultDuration = 3000;
        this.maxToasts = 5;
        this.init();
    }

    init() {
        // Create toast container if not exists
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = this.defaultDuration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${this.getIcon(type)}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('toast-visible'), 10);

        // Auto-remove after duration
        const timeout = setTimeout(() => this.remove(toast), duration);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            this.remove(toast);
        });

        // Limit number of toasts
        while (this.container.children.length > this.maxToasts) {
            this.remove(this.container.firstChild);
        }
    }

    remove(toast) {
        toast.classList.remove('toast-visible');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.remove();
        });
    }

    getIcon(type) {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '•';
        }
    }

    success(message, duration) { this.show(message, 'success', duration); }
    error(message, duration) { this.show(message, 'error', duration); }
    warning(message, duration) { this.show(message, 'warning', duration); }
    info(message, duration) { this.show(message, 'info', duration); }
}

// Initialize global toast instance
window.toast = new Toast();

// Also add to tablet for backward compatibility
if (window.drainedTablet) {
    window.drainedTablet.showToast = (msg, type) => toast.show(msg, type);
}