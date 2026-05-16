// access-control.js – Only user and master roles

class AccessControl {
    constructor() {
        this.uiMode = localStorage.getItem('tdl_ui_mode') || 'user';
        this.init();
    }

    async init() {
        await this.loadPermissions();
        this.applyUIPermissions();
    }

    async loadPermissions() {
        // No complex permissions needed – we use role only
    }

    isMasterUser() {
        const username = window.AppState?.user?.username || localStorage.getItem('tdl_username');
        return username === 'CooseTheGeek';
    }

    hasRole(requiredRole) {
        if (this.isMasterUser()) return true;
        // Only 'user' is the other role
        return requiredRole === 'user';
    }

    getUIMode() {
        return this.uiMode;
    }

    async setUIMode(mode) {
        if (!this.isMasterUser()) return;
        if (mode !== 'user' && mode !== 'master') return;
        this.uiMode = mode;
        localStorage.setItem('tdl_ui_mode', mode);
        if (window.sidebarManager) window.sidebarManager.renderSidebar();
        if (window.settings && window.settings.renderSidebarCustomizer) window.settings.renderSidebarCustomizer();
        window.dispatchEvent(new CustomEvent('mode-changed', { detail: { mode } }));
        toast.success(`${mode === 'master' ? 'Admin Mode' : 'User Mode'} active`);
    }

    applyUIPermissions() {
        // Hide admin elements if not in master mode
        const isMasterMode = this.isMasterUser() && this.uiMode === 'master';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isMasterMode ? '' : 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});