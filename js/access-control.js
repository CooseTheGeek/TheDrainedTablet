// access-control.js – DRAINED TABLET v7.0.0 (Master bypass, mode switch requires re-auth)

class AccessControl {
    constructor() {
        this.roleHierarchy = { user: 1, owner: 2, master: 3 };
        this.userPermissions = {};
        this.uiMode = localStorage.getItem('tdl_ui_mode') || 'user';
        this.pendingMode = null;
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
                    }
                }
            } catch(e) { console.warn(e); }
        }
        if (this.isMasterUser()) this.userPermissions = { '*': true };
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

    getUIMode() { return this.uiMode; }

    async setUIMode(mode) {
        if (!this.isMasterUser()) return;
        if (mode !== 'user' && mode !== 'master') return;
        // When switching to master mode, require re-authentication
        if (mode === 'master' && this.uiMode === 'user') {
            const password = prompt('Enter master password to switch to Master Mode:');
            if (password !== '0827') {
                toast.error('Incorrect password. Mode unchanged.');
                return;
            }
        }
        this.uiMode = mode;
        localStorage.setItem('tdl_ui_mode', mode);
        if (window.sidebarManager) window.sidebarManager.renderSidebar();
        if (window.settings && window.settings.renderSidebarCustomizer) window.settings.renderSidebarCustomizer();
        window.dispatchEvent(new CustomEvent('mode-changed', { detail: { mode } }));
        // Update header role display
        const roleBadge = document.getElementById('role-badge');
        if (roleBadge) roleBadge.innerText = mode === 'master' ? 'MASTER' : (AppState.user?.role || 'USER').toUpperCase();
        toast.success(`${mode === 'master' ? 'Admin Mode' : 'User Mode'} active`);
    }

    applyUIPermissions() {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = this.isMasterUser() && this.uiMode === 'master' ? '' : 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { window.accessControl = new AccessControl(); });