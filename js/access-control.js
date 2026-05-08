// access-control.js – DRAINED TABLET ULTIMATE v7.0.0 (with temporary master override)

class AccessControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.roleHierarchy = {
            user: 1,
            owner: 2,
            master: 3
        };
        this.init();
    }

    init() {
        console.log('AccessControl initialized');
    }

    // Temporary override for CooseTheGeek
    isMasterUser() {
        const username = AppState.user?.username || localStorage.getItem('tdl_username');
        return username === 'CooseTheGeek';
    }

    hasRole(requiredRole) {
        if (this.isMasterUser()) {
            return true;
        }
        const currentRole = AppState.user?.role || 'user';
        return this.roleHierarchy[currentRole] >= this.roleHierarchy[requiredRole];
    }

    isMaster() {
        if (this.isMasterUser()) {
            return true;
        }
        return AppState.user?.role === 'master';
    }

    isOwner() {
        if (this.isMasterUser()) {
            return true;
        }
        return AppState.user?.role === 'master';
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});