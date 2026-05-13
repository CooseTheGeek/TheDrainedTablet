// access-control.js – DRAINED TABLET ULTIMATE v7.0.0 (with granular permissions)

class AccessControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.roleHierarchy = { user: 1, owner: 2, master: 3 };
        this.userPermissions = {}; // loaded from bridge after login
        this.init();
    }

    init() {
        console.log('AccessControl initialized');
        this.loadPermissions();
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
        // Master has all permissions
        if (this.isMasterUser()) return true;
        if (this.userPermissions['*']) return true;
        if (this.userPermissions[permission] === true) return true;
        // Check specific context permission (e.g., "tab:garage")
        if (context && this.userPermissions[`${permission}:${context}`] === true) return true;
        return false;
    }

    isMaster() {
        if (this.isMasterUser()) return true;
        return window.AppState?.user?.role === 'master';
    }

    isOwner() {
        if (this.isMasterUser()) return true;
        return window.AppState?.user?.role === 'owner';
    }

    guard(requiredRole) {
        if (!this.hasRole(requiredRole)) {
            throw new Error(`Access denied: ${requiredRole} role required`);
        }
    }

    protect(fn, requiredRole) {
        return (...args) => {
            if (!this.hasRole(requiredRole)) {
                console.warn(`Access denied to function ${fn.name || 'anonymous'}`);
                return null;
            }
            return fn(...args);
        };
    }

    applyUIPermissions() {
        if (!this.hasRole('master')) {
            document.querySelectorAll('.master-only').forEach(el => el.style.display = 'none');
        }
        if (!this.hasRole('owner')) {
            document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
        }
        // Hide tabs based on permissions
        if (!this.hasPermission('tab', 'master-control')) {
            const masterNav = document.querySelector('.nav-item[data-tab="master"]');
            if (masterNav) masterNav.style.display = 'none';
        }
        // Add more permission checks for other tabs as needed
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});