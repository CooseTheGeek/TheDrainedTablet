// access-control.js – DRAINED TABLET ULTIMATE v7.0.0 (User/Master mode)

class AccessControl {
    constructor() {
        this.roleHierarchy = { user: 1, owner: 2, master: 3 };
        this.userPermissions = {};
        this.uiMode = localStorage.getItem('tdl_ui_mode') || 'user';
        this.init();
    }

    async init() {
        await this.loadPermissions();
        this.applyUIPermissions();
    }

    async loadPermissions() {
        const sessionStr = localStorage.getItem('tdl_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session.token) {
                    const res = await fetch('https://drained-bridge.onrender.com/api/user/profile', {
                        headers: { 'Authorization': `Bearer ${session.token}` }
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        this.userPermissions = profile.permissions || {};
                        if (profile.username === 'CooseTheGeek') {
                            this.userPermissions = { '*': true };
                        }
                    }
                }
            } catch(e) { console.warn(e); }
        }
    }

    isMasterUser() {
        const username = window.AppState?.user?.username || localStorage.getItem('tdl_username');
        return username === 'CooseTheGeek';
    }

    hasRole(requiredRole) {
        if (this.isMasterUser()) return true;
        const currentRole = window.AppState?.user?.role || 'user';
        return this.roleHierarchy[currentRole] >= this.roleHierarchy[requiredRole];
    }

    hasPermission(permission, context = null) {
        if (this.isMasterUser() && this.uiMode === 'master') return true;
        if (this.userPermissions['*']) return true;
        if (this.userPermissions[permission] === true) return true;
        if (context && this.userPermissions[`${permission}:${context}`] === true) return true;
        return false;
    }

    getUIMode() {
        return this.uiMode;
    }

    setUIMode(mode) {
        if (!this.isMasterUser()) return;
        if (mode !== 'user' && mode !== 'master') return;
        this.uiMode = mode;
        localStorage.setItem('tdl_ui_mode', mode);
        if (window.sidebarManager) window.sidebarManager.renderSidebar();
        window.dispatchEvent(new CustomEvent('mode-changed', { detail: { mode } }));
        toast.success(`${mode === 'master' ? 'Admin Mode' : 'User Mode'} active`);
    }

    applyUIPermissions() {
        // Additional UI hiding if needed
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});